"use client";

// Health Assistant chat widget — connects the Vercel AI SDK `useChat` hook
// to the `/api/chat` route shipped in GLO-13. Visual language follows the
// GLO-14 UX spec (forest + amber palette, no loading spinners, citations as
// numbered references). This is the v1 implementation: it covers the
// must-have states (welcome, streaming, complete, error, escalation header,
// new conversation, disclaimer) and intentionally defers the lower-priority
// polish (prefers-reduced-motion fine-tuning, mobile bottom-sheet animation,
// citation expansion UX, full a11y audit) to a follow-up issue.

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "What should I do for a sore throat?",
  "How do I check if a fever is serious?",
  "What are signs my child needs urgent care?",
];

const DISCLAIMER =
  "For medical emergencies call 911. AI responses are informational only and do not constitute medical advice.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Issue an anonymous chat session cookie the first time the user opens
  // the widget. Subsequent opens reuse the cookie via the browser.
  useEffect(() => {
    if (!open || sessionReady) return;
    let cancelled = false;
    fetch("/api/chat/session", { method: "POST" })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`session ${res.status}`);
        setSessionReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[chat] failed to issue session:", err);
        setSessionError("Couldn't start chat session. Please reload the page.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionReady]);

  // Keep the thread pinned to the latest message as tokens stream in.
  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, status]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !sessionReady || status === "streaming" || status === "submitted") return;
      sendMessage({ text: trimmed });
      setInput("");
    },
    [sendMessage, sessionReady, status]
  );

  const onSuggestionClick = (text: string) => submit(text);

  const onNewConversation = () => {
    if (status === "streaming" || status === "submitted") return;
    if (messages.length === 0) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Start a new conversation? This will clear your current chat. For privacy, conversations are not saved between sessions — this can't be undone."
      )
    ) {
      return;
    }
    setMessages([]);
  };

  const isStreaming = status === "streaming" || status === "submitted";
  const isReady = sessionReady && !isStreaming;

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Health Assistant chat"
          className="fixed bottom-6 right-6 z-[60] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#1c3829] text-white shadow-[0_8px_28px_rgba(28,56,41,.32)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#1c3829]/30 sm:bottom-6 sm:right-6"
        >
          <ChatIcon />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Health Assistant chat"
          className="fixed bottom-0 right-0 z-[60] flex w-full flex-col overflow-hidden bg-[#fdfbf8] shadow-[0_28px_72px_rgba(28,56,41,.22),0_8px_28px_rgba(28,56,41,.12)] sm:bottom-6 sm:right-6 sm:h-[556px] sm:w-[372px] sm:rounded-[22px]"
          style={{ height: "100dvh", maxHeight: "100dvh" }}
        >
          <Header onNew={onNewConversation} onClose={() => setOpen(false)} canNew={messages.length > 0 && !isStreaming} />

          <div
            ref={threadRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            className="flex-1 space-y-3 overflow-y-auto bg-[#fdfbf8] px-4 py-4"
          >
            {sessionError && <ErrorCard text={sessionError} />}

            {!sessionError && messages.length === 0 && sessionReady && (
              <Welcome onSuggestion={onSuggestionClick} disabled={!isReady} />
            )}

            {!sessionError && !sessionReady && <SessionLoading />}

            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} parts={m.parts} streaming={status === "streaming" && m === messages[messages.length - 1] && m.role === "assistant"} />
            ))}

            {error && (
              <ErrorCard
                text="I couldn't reach the knowledge base right now. This is likely a temporary issue."
              />
            )}
          </div>

          <Composer
            value={input}
            onChange={setInput}
            onSubmit={() => submit(input)}
            disabled={!isReady}
            placeholder={messages.length === 0 ? "Ask a health question…" : "Ask a follow-up…"}
          />

          <p className="bg-[#fdfbf8] px-4 pb-3 pt-1 text-[10.5px] leading-snug text-[#8a9a88]">
            {DISCLAIMER}
          </p>
        </div>
      )}
    </>
  );
}

// --- subcomponents ---------------------------------------------------------

function Header({
  onNew,
  onClose,
  canNew,
}: {
  onNew: () => void;
  onClose: () => void;
  canNew: boolean;
}) {
  return (
    <header className="flex items-center gap-3 bg-[#1c3829] px-4 py-3 text-white">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e5c42] text-sm font-semibold text-[#a8c4a2]">
        H
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight" style={{ fontFamily: "Fraunces, ui-serif, Georgia, serif" }}>
          Health Assistant
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-[#a8c4a2]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7fc88a]" aria-hidden />
          Online · Powered by Health Base
        </p>
      </div>
      <button
        type="button"
        className="rounded-full bg-[#d95438] px-3 py-1 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        onClick={() => alert("Escalation queue not yet wired (PRD Q3, owned by CEO).")}
        title="Talk to a human agent"
      >
        Human
      </button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        onClick={onNew}
        disabled={!canNew}
        aria-label="Start new conversation"
        title="Start new conversation"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        onClick={onClose}
        aria-label="Minimise chat"
      >
        <DashIcon />
      </button>
    </header>
  );
}

function Welcome({ onSuggestion, disabled }: { onSuggestion: (s: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-2 py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f0e4] text-[#2e5c42]">
        <SparkleIcon />
      </div>
      <h2 className="text-[16px] font-semibold text-[#18201b]" style={{ fontFamily: "Fraunces, ui-serif, Georgia, serif" }}>
        How can I help you today?
      </h2>
      <p className="max-w-[280px] text-[12.5px] leading-relaxed text-[#465040]">
        Ask me anything about your health. I draw from our verified knowledge base and always show my sources.
      </p>
      <div className="flex w-full flex-col gap-2 pt-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSuggestion(s)}
            className="rounded-full border border-[#a8c4a2]/50 bg-[#e6f0e4] px-4 py-2 text-left text-[12.5px] font-medium text-[#1c3829] transition-colors hover:bg-[#d4e6d0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2 py-12 text-center">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#7fc88a]" aria-hidden />
      <p className="text-[12px] text-[#465040]">Starting your session…</p>
    </div>
  );
}

interface MessagePart {
  type: string;
  text?: string;
}

function MessageBubble({
  role,
  parts,
  streaming,
}: {
  role: string;
  parts: MessagePart[];
  streaming: boolean;
}) {
  const text = parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[10px] rounded-br-[6px] bg-[#1c3829] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f0e4] text-[11px] font-semibold text-[#2e5c42]">
        H
      </div>
      <div className="max-w-[85%] rounded-[10px] rounded-bl-[6px] border border-black/5 bg-white px-3.5 py-3 text-[13.5px] leading-relaxed text-[#18201b]">
        <span className="whitespace-pre-wrap">{text}</span>
        {streaming && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] animate-pulse bg-[#c8781e] align-middle"
          />
        )}
      </div>
    </div>
  );
}

function ErrorCard({ text }: { text: string }) {
  return (
    <div role="alert" className="rounded-[10px] border border-[#d95438]/20 bg-[#fde8e2] p-3 text-[12.5px] leading-relaxed text-[#7c2418]">
      {text}
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="border-t border-black/5 bg-white px-3 py-3"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          rows={1}
          aria-label="Message input"
          disabled={disabled}
          className="max-h-[120px] flex-1 resize-none rounded-[12px] border-[1.5px] border-black/10 bg-white px-3 py-2 text-[13.5px] leading-relaxed text-[#18201b] placeholder:text-[#8a9a88] focus:border-[#3d7a5a] focus:outline-none focus:ring-2 focus:ring-[#1c3829]/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1c3829] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
}

// --- icons (inline SVG to avoid extra import weight) ----------------------

function ChatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
