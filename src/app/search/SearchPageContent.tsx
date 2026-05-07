"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ThumbsUp, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ZeroResults from "@/components/search/ZeroResults";

interface Hit {
  objectID: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  articleType: string;
  readTimeMinutes: number;
  updatedAt: string;
  helpfulPercent: number;
  _highlightResult?: {
    title?: { value: string };
    excerpt?: { value: string };
  };
}

interface SearchResponse {
  hits: Hit[];
  nbHits: number;
  page: number;
  nbPages: number;
  facets?: Record<string, Record<string, number>>;
  query: string;
}

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  "how-to": "How-to",
  explainer: "Explainer",
  faq: "FAQ",
  reference: "Reference",
};

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Most helpful", value: "helpful" },
  { label: "Recently updated", value: "recent" },
];

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") ?? "";
  const categoryFilter = searchParams.get("category") ?? "";
  const typeFilter = searchParams.get("type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, page: String(page) });
      if (categoryFilter) params.set("category", categoryFilter);
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, categoryFilter, typeFilter, page]);

  useEffect(() => {
    setLocalQuery(query);
    fetchResults();
  }, [query, categoryFilter, typeFilter, page, fetchResults]);

  function pushParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("page");
    router.push(`/search?${p}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (localQuery.trim()) pushParam("q", localQuery.trim());
  }

  const hits = results?.hits ?? [];
  const nbHits = results?.nbHits ?? 0;
  const nbPages = results?.nbPages ?? 0;
  const facets = results?.facets ?? {};
  const categoryFacets = facets["category"] ?? {};
  const typeFacets = facets["articleType"] ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} role="search" aria-label="Search articles" className="relative max-w-2xl mb-6">
        <input
          type="search"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search articles…"
          className={cn(
            "w-full h-[50px] pl-5 pr-14 rounded-full border border-[var(--color-border-strong)]",
            "bg-white text-base text-[var(--color-text-primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          )}
          aria-label="Search query"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Result count + breadcrumb */}
      {query && (
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-tertiary)] mb-1">
          <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
          {" "}/{" "}
          <span className="text-[var(--color-text-secondary)]">Search</span>
        </nav>
      )}
      {!loading && results && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-6" aria-live="polite" aria-atomic="true">
          {nbHits === 0
            ? `No results for "${query}"`
            : `${nbHits.toLocaleString()} result${nbHits !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside
          aria-label="Search filters"
          className="hidden lg:block w-[220px] flex-shrink-0 space-y-6"
        >
          {/* Category filter */}
          {Object.keys(categoryFacets).length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2" id="category-filter-label">
                Category
              </p>
              <ul role="list" aria-labelledby="category-filter-label" className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => pushParam("category", "")}
                    className={cn(
                      "w-full text-left text-sm py-1 px-2 rounded transition-colors",
                      !categoryFilter ? "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                    )}
                  >
                    All categories
                  </button>
                </li>
                {Object.entries(categoryFacets).map(([cat, count]) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => pushParam("category", cat)}
                      className={cn(
                        "w-full text-left text-sm py-1 px-2 rounded transition-colors flex justify-between items-center",
                        categoryFilter === cat ? "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                      )}
                    >
                      <span>{cat}</span>
                      <span className="text-[var(--color-text-tertiary)] text-xs">({count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article type filter */}
          {Object.keys(typeFacets).length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2" id="type-filter-label">
                Article type
              </p>
              <ul role="list" aria-labelledby="type-filter-label" className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => pushParam("type", "")}
                    className={cn(
                      "w-full text-left text-sm py-1 px-2 rounded transition-colors",
                      !typeFilter ? "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                    )}
                  >
                    All types
                  </button>
                </li>
                {Object.entries(typeFacets).map(([type, count]) => (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => pushParam("type", type)}
                      className={cn(
                        "w-full text-left text-sm py-1 px-2 rounded transition-colors flex justify-between",
                        typeFilter === type ? "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                      )}
                    >
                      <span>{ARTICLE_TYPE_LABELS[type] ?? type}</span>
                      <span className="text-[var(--color-text-tertiary)] text-xs">({count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sort */}
          <div>
            <label htmlFor="sort-select" className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 block">
              Sort by
            </label>
            <select
              id="sort-select"
              className="w-full text-sm border border-[var(--color-border-strong)] rounded-[var(--radius-md)] px-3 py-2 bg-white text-[var(--color-text-primary)]"
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile filter toggle placeholder */}
          <button
            type="button"
            className="lg:hidden flex items-center gap-2 text-sm text-[var(--color-primary)] border border-[var(--color-primary)] rounded-full px-4 py-2"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filters
          </button>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading results">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && nbHits === 0 && query && <ZeroResults query={query} />}

          {!loading && hits.length > 0 && (
            <ul role="list" className="space-y-3" aria-label="Search results">
              {hits.map((hit) => (
                <li key={hit.objectID}>
                  <Link
                    href={`/articles/${hit.slug}`}
                    className="block bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 hover:border-[var(--color-primary-medium)] hover:shadow-[var(--shadow-sm)] transition-all duration-150 group"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-primary)] mb-2">
                      {hit.category}
                    </p>
                    <h2
                      className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] mb-2 leading-snug transition-colors duration-150"
                      dangerouslySetInnerHTML={{
                        __html: hit._highlightResult?.title?.value ?? hit.title,
                      }}
                    />
                    <p
                      className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: hit._highlightResult?.excerpt?.value ?? hit.excerpt,
                      }}
                    />
                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} aria-hidden="true" />
                        {hit.readTimeMinutes} min
                      </span>
                      {hit.helpfulPercent > 0 && (
                        <span className="flex items-center gap-1 bg-[var(--color-success-light)] text-[var(--color-success)] px-2 py-0.5 rounded-full text-[11px]">
                          <ThumbsUp size={10} aria-hidden="true" />
                          {hit.helpfulPercent}% helpful
                        </span>
                      )}
                      <span>{ARTICLE_TYPE_LABELS[hit.articleType] ?? hit.articleType}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {!loading && nbPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => pushParam("page", String(page - 1))}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(Math.min(nbPages, 7))].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pushParam("page", String(i))}
                  className={cn(
                    "w-11 h-11 rounded-full text-sm font-medium transition-colors",
                    i === page
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                  )}
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === page ? "page" : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= nbPages - 1}
                onClick={() => pushParam("page", String(page + 1))}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
