import { NextRequest, NextResponse } from "next/server";

import { embedAllArticles } from "@/lib/ai/embed-articles";

// Long-running bulk embedding job. Uses fluid compute / streaming-friendly
// runtime so it isn't capped at the default 10s function timeout.
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CHAT_ADMIN_SECRET ?? "";
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lines: string[] = [];
  try {
    const result = await embedAllArticles({ log: (line) => lines.push(line) });
    return NextResponse.json({ ok: true, ...result, log: lines });
  } catch (err) {
    console.error("admin/embed-articles failed:", err);
    return NextResponse.json(
      {
        error: "embed_failed",
        message: err instanceof Error ? err.message : String(err),
        log: lines,
      },
      { status: 500 },
    );
  }
}
