import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  CHAT_PRIMARY_MODEL,
  gatewayProviderOptions,
} from "@/lib/ai/gateway";
import { moderateUserInput } from "@/lib/ai/moderation";
import {
  buildSystemPrompt,
  CLINICAL_DISCLAIMER,
  EMERGENCY_RESPONSE,
} from "@/lib/ai/prompt";
import { retrieveContext, type Citation } from "@/lib/ai/rag";
import { bumpUsage, resolveSession } from "@/lib/ai/session";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequestBody {
  messages: UIMessage[];
}

export async function POST(req: Request): Promise<Response> {
  // 1. Authn — require a valid signed session cookie.
  const sessionId = await resolveSession();
  if (!sessionId) {
    return jsonError(401, "missing_session", "No chat session. Open a session via POST /api/chat/session first.");
  }

  // 2. Parse body.
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return jsonError(400, "bad_json", "Invalid JSON body.");
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return jsonError(400, "no_messages", "messages array is required.");
  }

  const lastUser = lastUserText(messages);
  if (!lastUser) {
    return jsonError(400, "no_user_message", "Last message must be a user message with text content.");
  }

  // 3. Pre-input moderation.
  const verdict = moderateUserInput(lastUser);
  if (verdict.kind === "emergency") {
    return cannedTextStream(EMERGENCY_RESPONSE);
  }
  if (verdict.kind === "blocked") {
    return cannedTextStream(verdict.reason);
  }

  // 4. Rate limit.
  const limit = await bumpUsage(sessionId);
  if (!limit.ok) {
    const resp = jsonError(
      429,
      "rate_limited",
      `Too many messages. Try again in ${limit.retryAfterSeconds}s.`
    );
    resp.headers.set("Retry-After", String(limit.retryAfterSeconds));
    return resp;
  }

  // 5. RAG retrieval against the KB.
  const retrieval = await retrieveContext(lastUser);
  const system = buildSystemPrompt(retrieval.context);

  // 6. Stream model response through the Vercel AI Gateway. Provider order
  //    in `gatewayProviderOptions` makes the gateway fall back automatically
  //    if the primary provider errors.
  const result = streamText({
    model: CHAT_PRIMARY_MODEL,
    system,
    messages: await convertToModelMessages(messages),
    providerOptions: gatewayProviderOptions,
    temperature: 0.2,
    onError: ({ error }) => {
      console.error("[chat] streamText error:", error);
    },
  });

  // Surface the citations and rate-limit state to the client via custom
  // response headers so the chat UI can render source links + remaining quota
  // without a second round-trip.
  return result.toUIMessageStreamResponse({
    headers: {
      "x-chat-citations": encodeCitations(retrieval.citations),
      "x-chat-rate-1h": String(limit.count1h),
      "x-chat-rate-24h": String(limit.count24h),
      "x-chat-disclaimer-required": "true",
    },
  });
}

// --- helpers ---------------------------------------------------------------

function lastUserText(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const text = (m.parts ?? [])
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n")
      .trim();
    return text || null;
  }
  return null;
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ error: { code, message } }),
    {
      status,
      headers: { "content-type": "application/json" },
    }
  );
}

function encodeCitations(citations: Citation[]): string {
  // Header values must be ASCII-safe. Base64-encoding the JSON keeps article
  // titles with non-ASCII characters intact.
  const json = JSON.stringify(citations);
  return Buffer.from(json, "utf8").toString("base64");
}

/**
 * Stream a static reply through the AI SDK's UI message protocol so the
 * client `useChat` hook renders it identically to a model response. Used for
 * moderation deflections (emergency / blocked).
 */
function cannedTextStream(text: string): Response {
  const fullText = `${text}\n\n${CLINICAL_DISCLAIMER}`;
  const messageId = `canned-${Date.now()}`;
  const partId = `${messageId}-text-0`;

  const events: Array<Record<string, unknown>> = [
    { type: "start" },
    { type: "start-step" },
    { type: "text-start", id: partId },
    { type: "text-delta", id: partId, delta: fullText },
    { type: "text-end", id: partId },
    { type: "finish-step" },
    { type: "finish" },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const ev of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "x-vercel-ai-ui-message-stream": "v1",
      "x-chat-canned": "true",
    },
  });
}
