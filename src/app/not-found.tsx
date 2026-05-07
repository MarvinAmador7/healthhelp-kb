import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-alt)]">
      <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center px-4 sm:px-8">
        <Link
          href="/"
          className="text-[var(--color-primary)] font-bold text-lg"
        >
          HealthHelp
        </Link>
      </header>

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-16"
      >
        <div className="max-w-[600px] w-full text-center">
          <span className="text-6xl mb-6 block" aria-hidden="true">
            🔍
          </span>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Page not found
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mb-8 max-w-md mx-auto">
            We couldn&apos;t find what you were looking for. Try searching our
            knowledge base or browse by category.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/search"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full min-h-[44px]",
                "border border-[var(--color-border-strong)] text-sm text-[var(--color-text-secondary)]",
                "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              )}
            >
              <Search size={15} aria-hidden="true" />
              Browse all topics
            </Link>
            <a
              href="mailto:support@healthco.com"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full min-h-[44px]",
                "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold",
                "transition-colors"
              )}
            >
              <MessageCircle size={15} aria-hidden="true" />
              Contact support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
