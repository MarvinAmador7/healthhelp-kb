import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/** Sanity webhook → on-demand ISR revalidation + Algolia re-index */
export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify webhook signature
  const signature = req.headers.get("sanity-webhook-signature") ?? "";
  const secret = process.env.SANITY_WEBHOOK_SECRET ?? "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { _type: string; slug?: { current: string } };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload._type === "article" && payload.slug?.current) {
    revalidatePath(`/articles/${payload.slug.current}`);
    revalidatePath("/");
    revalidatePath("/search");
  } else if (payload._type === "category") {
    revalidatePath("/");
    revalidatePath("/search");
  }

  return NextResponse.json({ revalidated: true });
}
