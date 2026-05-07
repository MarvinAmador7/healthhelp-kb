import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

function getSanityWriteClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });
}

interface FeedbackBody {
  articleSlug: string;
  helpful: boolean;
  reason?: string;
  freeText?: string;
}

export async function POST(req: NextRequest) {
  let body: FeedbackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { articleSlug, helpful, reason, freeText } = body;

  if (!articleSlug || typeof helpful !== "boolean") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sanitizedFreeText = freeText
    ? freeText.replace(/<[^>]*>/g, "").slice(0, 500)
    : undefined;

  try {
    const writeClient = getSanityWriteClient();

    const articles = await writeClient.fetch<{ _id: string }[]>(
      `*[_type == "article" && slug.current == $slug][0..0] { _id }`,
      { slug: articleSlug }
    );

    if (articles.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const articleId = articles[0]._id;
    const patch = writeClient.patch(articleId).inc({ totalFeedbackCount: 1 });
    if (helpful) patch.inc({ helpfulCount: 1 });
    await patch.commit();

    await writeClient.create({
      _type: "articleFeedback",
      article: { _type: "reference", _ref: articleId },
      helpful,
      reason: reason ?? null,
      freeText: sanitizedFreeText ?? null,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Feedback write error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
