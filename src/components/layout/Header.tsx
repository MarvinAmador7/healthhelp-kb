"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-[var(--color-primary)] font-bold text-lg leading-none"
          aria-label="HealthHelp home"
        >
          HealthHelp
        </Link>

        {/* Header search — desktop */}
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Site search"
          className="hidden sm:flex flex-1 max-w-md relative"
        >
          <input
            type="search"
            placeholder="Search articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-4 pr-10 rounded-full border border-[var(--color-border-strong)]",
              "bg-[var(--color-surface-alt)] text-sm text-[var(--color-text-primary)]",
              "placeholder:text-[var(--color-text-tertiary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            )}
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Nav links — desktop */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 ml-auto">
          <Link
            href="/search"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-150"
          >
            All topics
          </Link>
          <span className="text-sm text-[var(--color-text-tertiary)]">
            For Providers <span className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-0.5 rounded-full ml-1">Coming soon</span>
          </span>
          <a
            href="mailto:support@healthco.com"
            className="text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-4 py-2 rounded-full transition-colors duration-150"
          >
            Contact support
          </a>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="ml-auto md:hidden p-2 text-[var(--color-text-secondary)] min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} role="search" aria-label="Mobile site search" className="relative">
            <input
              type="search"
              placeholder="Search articles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-4 pr-12 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-alt)] text-base"
            />
            <button type="submit" aria-label="Submit search" className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              <Search size={18} />
            </button>
          </form>
          <Link href="/search" className="block py-2 text-[var(--color-text-secondary)]" onClick={() => setMobileMenuOpen(false)}>All topics</Link>
          <a href="mailto:support@healthco.com" className="block py-2 text-[var(--color-primary)] font-medium">Contact support</a>
        </div>
      )}
    </header>
  );
}
