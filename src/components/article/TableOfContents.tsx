"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface Props {
  entries: TocEntry[];
}

export default function TableOfContents({ entries }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [collapsed, setCollapsed] = useState(true); // mobile-first: collapsed

  useEffect(() => {
    if (entries.length === 0) return;
    const observer = new IntersectionObserver(
      (obs) => {
        const visible = obs.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-68px 0px -60% 0px" }
    );
    entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="In this article" className="text-sm">
      {/* Mobile toggle */}
      <button
        type="button"
        className="lg:hidden w-full flex items-center justify-between py-2 font-semibold text-[var(--color-text-primary)] text-sm"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((v) => !v)}
      >
        <span>Jump to section</span>
        <span aria-hidden="true">{collapsed ? "▾" : "▴"}</span>
      </button>

      <ul
        className={cn(
          "space-y-1",
          collapsed ? "hidden lg:block" : "block"
        )}
      >
        {entries.map(({ id, text, level }) => (
          <li key={id} className={cn(level === 3 && "pl-4")}>
            <a
              href={`#${id}`}
              className={cn(
                "block py-1 px-2 rounded text-xs leading-snug transition-all duration-150",
                activeId === id
                  ? "border-l-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium pl-2"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              onClick={() => setCollapsed(true)}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
