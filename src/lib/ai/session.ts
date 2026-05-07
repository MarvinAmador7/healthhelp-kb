// Anonymous chat session: HMAC-signed cookie that gates /api/chat without
// requiring a real user account. When real auth lands, replace `getSessionId`
// with the auth user id and the rest of the pipeline is unchanged.

import { cookies } from "next/headers";

import { getSql } from "@/lib/db/server";

const COOKIE_NAME = "chat_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h
const SESSION_ID_BYTES = 16;

export interface ResolvedSession {
  sessionId: string;
  isNew: boolean;
}

/**
 * Issue a new signed session id and write it to the response cookie.
 * Used by `POST /api/chat/session` (called by the chat UI on first open).
 */
export async function issueSession(): Promise<ResolvedSession> {
  const sessionId = randomHex(SESSION_ID_BYTES);
  const value = await signCookieValue(sessionId);
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return { sessionId, isNew: true };
}

/**
 * Resolve and verify the chat session cookie. Returns null if missing or
 * tampered with. Callers MUST treat null as 401 — do not silently re-issue,
 * since that would defeat the rate limit.
 */
export async function resolveSession(): Promise<string | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  return verifyCookieValue(cookie);
}

export interface RateLimitResult {
  ok: boolean;
  count1h: number;
  count24h: number;
  retryAfterSeconds: number;
}

/**
 * Atomically increment per-session message counters and check the hourly
 * and daily caps. Limits are enforced server-side via the
 * `bump_chat_session_usage` Postgres function so concurrent requests can't
 * race past the cap.
 */
export async function bumpUsage(sessionId: string): Promise<RateLimitResult> {
  const sql = getSql();
  const limit1h = Number(process.env.CHAT_RATE_LIMIT_1H ?? 20);
  const limit24h = Number(process.env.CHAT_RATE_LIMIT_24H ?? 200);
  try {
    const rows = await sql<
      Array<{
        count_1h: number;
        count_24h: number;
        over_limit: boolean;
        retry_after_seconds: number;
      }>
    >`select * from bump_chat_session_usage(${sessionId}, ${limit1h}::int, ${limit24h}::int)`;
    const row = rows[0];
    if (!row) {
      console.error("[session] bump_chat_session_usage returned no rows");
      return { ok: false, count1h: 0, count24h: 0, retryAfterSeconds: 60 };
    }
    return {
      ok: !row.over_limit,
      count1h: row.count_1h,
      count24h: row.count_24h,
      retryAfterSeconds: row.retry_after_seconds,
    };
  } catch (error) {
    console.error("[session] bump_chat_session_usage failed:", error);
    // Fail closed — better to deny than to silently bypass the limit.
    return { ok: false, count1h: 0, count24h: 0, retryAfterSeconds: 60 };
  }
}

// --- cookie signing ---------------------------------------------------------

async function signCookieValue(sessionId: string): Promise<string> {
  const sig = await hmac(sessionId);
  return `${sessionId}.${sig}`;
}

async function verifyCookieValue(value: string): Promise<string | null> {
  const dot = value.indexOf(".");
  if (dot < 0) return null;
  const sessionId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!sessionId || !sig) return null;
  const expected = await hmac(sessionId);
  return constantTimeEqual(sig, expected) ? sessionId : null;
}

async function hmac(message: string): Promise<string> {
  const secret = process.env.CHAT_SESSION_SECRET;
  if (!secret) {
    throw new Error("CHAT_SESSION_SECRET must be set to sign chat session cookies");
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(new Uint8Array(sig));
}

function randomHex(byteLength: number): string {
  const buf = new Uint8Array(byteLength);
  crypto.getRandomValues(buf);
  return toHex(buf);
}

function toHex(buf: Uint8Array): string {
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    out += buf[i].toString(16).padStart(2, "0");
  }
  return out;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
