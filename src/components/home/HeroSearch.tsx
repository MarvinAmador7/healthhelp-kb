"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = [
  "medication dosage",
  "symptoms of diabetes",
  "blood pressure",
  "vaccine schedule",
  "mental health resources",
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section
      className="bg-[var(--color-primary)] text-white py-16 px-4 sm:px-6 lg:px-8"
      aria-label="Knowledge base search"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
          How can we help you?
        </h1>
        <p className="text-lg text-white/80 mb-8">
          Trusted, clinically reviewed health information at your fingertips.
        </p>

        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search the knowledge base"
          className="relative"
        >
          <input
            type="search"
            placeholder="Search for symptoms, medications, conditions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "w-full h-[58px] pl-6 pr-16 rounded-full bg-white text-[var(--color-text-primary)]",
              "text-base placeholder:text-[var(--color-text-tertiary)]",
              "shadow-[var(--shadow-lg)]",
              "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
            )}
            aria-label="Search query"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "w-11 h-11 min-w-[44px] min-h-[44px] rounded-full",
              "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white",
              "flex items-center justify-center transition-colors duration-150"
            )}
          >
            <Search size={18} aria-hidden="true" />
          </button>
        </form>

        {/* Popular searches */}
        <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Popular searches">
          <span className="text-sm text-white/60 mr-1 self-center">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              className={cn(
                "text-sm px-3 py-1.5 rounded-full min-h-[36px]",
                "bg-white/15 hover:bg-white/25 text-white",
                "transition-colors duration-150"
              )}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
