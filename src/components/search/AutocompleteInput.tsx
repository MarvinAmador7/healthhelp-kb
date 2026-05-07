"use client";

import { useRef, useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { InstantSearch, useSearchBox, useHits, Configure } from "react-instantsearch";
import { liteClient } from "algoliasearch/lite";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BaseHit } from "instantsearch.js";

// Lazy singleton — only initialised when env vars are confirmed non-empty.
// Prevents module-level evaluation crash during SSR pre-render builds where
// NEXT_PUBLIC_ vars may be absent.
let _client: ReturnType<typeof buildClient> | null = null;

function buildClient() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
  const key =
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ??
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ??
    "";
  if (!appId || !key) return null;

  const raw = liteClient(appId, key);

  // Prevent empty-query requests from reaching Algolia.
  // react-instantsearch sends the legacy v4 array format: [{indexName, params}]
  return {
    ...raw,
    search(
      requests: Array<{ indexName: string; params?: { query?: string } }>
    ) {
      if (requests.every((r) => !r.params?.query?.trim())) {
        return Promise.resolve({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            page: 0,
            nbPages: 0,
            hitsPerPage: 5,
            processingTimeMS: 0,
            exhaustiveNbHits: true,
            query: "",
            params: "",
          })),
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (raw.search as (r: unknown) => Promise<unknown>)(requests);
    },
  };
}

function getSearchClient() {
  if (!_client) _client = buildClient();
  return _client;
}

interface ArticleHit extends BaseHit {
  title: string;
  slug: string;
  category: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  buttonClassName?: string;
  "aria-label"?: string;
}

// Plain input rendered when Algolia is not configured.
function PlainInput({
  value,
  onChange,
  placeholder = "Search…",
  inputClassName,
  buttonClassName,
  "aria-label": ariaLabel = "Search query",
}: AutocompleteInputProps) {
  return (
    <div className="relative">
      <input
        type="search"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />
      <button type="submit" aria-label="Submit search" className={buttonClassName}>
        <Search size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function AutocompleteInput(props: AutocompleteInputProps) {
  const client = getSearchClient();
  if (!client) return <PlainInput {...props} />;

  return (
    <InstantSearch
      searchClient={client as never}
      indexName="articles"
      future={{ preserveSharedStateOnUnmount: false }}
    >
      <Configure hitsPerPage={5} attributesToRetrieve={["title", "slug", "category"]} />
      <AutocompleteInner {...props} />
    </InstantSearch>
  );
}

function AutocompleteInner({
  value,
  onChange,
  placeholder = "Search…",
  inputClassName,
  buttonClassName,
  "aria-label": ariaLabel = "Search query",
}: AutocompleteInputProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `dismissed` tracks whether the user has explicitly closed the dropdown
  // (Escape key or outside click). Reset to false on each new keystroke.
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { refine } = useSearchBox({
    queryHook(query, search) {
      // Debounce Algolia requests at 280 ms; require ≥ 2 chars.
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        search(query.length >= 2 ? query : "");
      }, 280);
    },
  });

  const { hits } = useHits<ArticleHit>();

  // Computed: avoids storing derived state in effects (no re-render loops).
  const showDropdown = hits.length > 0 && value.length >= 2 && !dismissed;

  // Dismiss on outside click — only this one effect is needed.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setDismissed(true);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);       // update parent (controlled input)
    refine(v);         // trigger Algolia via queryHook (debounced)
    setDismissed(false);
    setActiveIndex(-1);
  }

  function navigate(slug: string) {
    setDismissed(true);
    setActiveIndex(-1);
    router.push(`/articles/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || !hits.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigate(hits[activeIndex].slug);
    } else if (e.key === "Escape") {
      setDismissed(true);
      setActiveIndex(-1);
    }
  }

  const activeOptionId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={activeOptionId}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (hits.length > 0 && value.length >= 2) setDismissed(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />

      <button type="submit" aria-label="Submit search" className={buttonClassName}>
        <Search size={18} aria-hidden="true" />
      </button>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden"
        >
          {hits.map((hit, i) => (
            <li
              key={hit.objectID}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                navigate(hit.slug);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                i === activeIndex
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]"
              )}
            >
              <Search
                size={14}
                aria-hidden="true"
                className={cn(
                  "flex-shrink-0",
                  i === activeIndex
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-tertiary)]"
                )}
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{hit.title}</span>
                <span className="block text-xs text-[var(--color-text-tertiary)] truncate">
                  {hit.category}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
