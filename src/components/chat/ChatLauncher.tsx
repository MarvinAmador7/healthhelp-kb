"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ChatPanel = dynamic(
  () => import("./ChatWidget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false }
);

export function ChatLauncher() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Health Assistant chat"
        className="fixed bottom-6 right-6 z-[60] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#1c3829] text-white shadow-[0_8px_28px_rgba(28,56,41,.32)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#1c3829]/30"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    );
  }

  return <ChatPanel onClose={() => setOpen(false)} />;
}
