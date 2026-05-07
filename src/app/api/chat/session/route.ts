import { NextResponse } from "next/server";

import { issueSession } from "@/lib/ai/session";

export const runtime = "nodejs";

/**
 * Issue a fresh anonymous chat session cookie. The chat UI calls this once on
 * first open; subsequent /api/chat requests reuse the cookie.
 *
 * No body required. Always returns 200 with `{ sessionId }` so the client can
 * tag analytics events; the cookie itself is HttpOnly and not exposed to JS.
 */
export async function POST(): Promise<Response> {
  const session = await issueSession();
  return NextResponse.json({ sessionId: session.sessionId });
}
