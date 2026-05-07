import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_CATEGORIES = [
  { title: "Medications", slug: "medications", icon: "💊" },
  { title: "Symptoms", slug: "symptoms", icon: "🌡️" },
  { title: "Conditions", slug: "conditions", icon: "🏥" },
  { title: "Mental health", slug: "mental-health", icon: "🧠" },
  { title: "Nutrition", slug: "nutrition", icon: "🥗" },
  { title: "Prevention", slug: "prevention", icon: "🛡️" },
];

interface Props {
  query: string;
}

export default function ZeroResults({ query }: Props) {
  return (
    <div className="max-w-[600px] mx-auto text-center py-12 px-4">
      <span className="text-6xl mb-6 block" aria-hidden="true">🔍</span>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-[var(--color-text-secondary)] text-sm mb-8">
        We couldn&apos;t find a match. Try a different term, or browse our categories — our
        support team can also answer specific questions.
      </p>

      {/* Popular categories */}
      <div className="text-left mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
          Browse popular categories
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="flex items-center gap-2 p-3 bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-150"
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link
          href="/search"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full min-h-[44px]",
            "border border-[var(--color-border-strong)] text-sm text-[var(--color-text-secondary)]",
            "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-150"
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
            "transition-colors duration-150"
          )}
        >
          <MessageCircle size={15} aria-hidden="true" />
          Contact support
        </a>
      </div>

      {process.env.NEXT_PUBLIC_STATUS_URL && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-6">
          Search not loading?{" "}
          <a
            href={process.env.NEXT_PUBLIC_STATUS_URL}
            target="_blank"
            rel="noopener"
            className="underline hover:text-[var(--color-primary)]"
          >
            Check service status
          </a>
        </p>
      )}
    </div>
  );
}
