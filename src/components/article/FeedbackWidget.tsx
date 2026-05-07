"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";

const NOT_HELPFUL_REASONS = [
  "Information was unclear",
  "Information was incomplete",
  "Information was incorrect",
  "I have a different question",
];

interface Props {
  articleSlug: string;
}

export default function FeedbackWidget({ articleSlug }: Props) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [reason, setReason] = useState("");
  const [freeText, setFreeText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submitFeedback(helpful: boolean, reasonText?: string, free?: string) {
    events.feedbackSubmit(articleSlug, helpful);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleSlug, helpful, reason: reasonText, freeText: free }),
    }).catch(() => {});
  }

  async function handleYes() {
    setVoted("yes");
    await submitFeedback(true);
    setSubmitted(true);
  }

  async function handleNoSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitFeedback(false, reason, freeText);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-[var(--color-success)] text-sm font-medium py-4"
      >
        <ThumbsUp size={16} aria-hidden="true" />
        Thanks for letting us know! 🙏
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--color-border)] pt-6 mt-8" aria-label="Article feedback">
      {voted === null && (
        <>
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Was this article helpful?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleYes}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full min-h-[44px] min-w-[44px]",
                "border border-[var(--color-border-strong)] text-sm text-[var(--color-text-secondary)]",
                "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]",
                "transition-colors duration-150"
              )}
            >
              <ThumbsUp size={15} aria-hidden="true" />
              Yes, it helped
            </button>
            <button
              type="button"
              onClick={() => setVoted("no")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full min-h-[44px] min-w-[44px]",
                "border border-[var(--color-border-strong)] text-sm text-[var(--color-text-secondary)]",
                "hover:border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)]",
                "transition-colors duration-150"
              )}
            >
              <ThumbsDown size={15} aria-hidden="true" />
              Not quite
            </button>
          </div>
        </>
      )}

      {voted === "no" && (
        <form onSubmit={handleNoSubmit} aria-label="Negative feedback form">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            What could be improved?
          </p>
          <fieldset className="space-y-2 mb-4">
            <legend className="sr-only">Reason for negative feedback</legend>
            {NOT_HELPFUL_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-[var(--color-primary)]"
                />
                {r}
              </label>
            ))}
          </fieldset>
          <label className="block text-sm text-[var(--color-text-secondary)] mb-1" htmlFor="feedback-text">
            Anything else? <span className="text-[var(--color-text-tertiary)]">(optional)</span>
          </label>
          <textarea
            id="feedback-text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Your feedback helps us improve…"
            className={cn(
              "w-full text-sm p-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)]",
              "bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] resize-none"
            )}
          />
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1 mb-3">
            {500 - freeText.length} characters remaining
          </p>
          <button
            type="submit"
            className={cn(
              "px-5 py-2.5 rounded-full min-h-[44px] text-sm font-semibold",
              "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white",
              "transition-colors duration-150"
            )}
          >
            Send feedback
          </button>
        </form>
      )}
    </div>
  );
}
