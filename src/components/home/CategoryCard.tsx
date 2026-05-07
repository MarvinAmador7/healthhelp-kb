import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={`/search?category=${encodeURIComponent(category.title)}`}
      className={cn(
        "group flex flex-col items-center text-center p-6 bg-white rounded-[var(--radius-lg)]",
        "border-[1.5px] border-[var(--color-border)]",
        "transition-all duration-150 ease-out",
        "hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] focus-visible:border-[var(--color-primary)]",
        "active:bg-[var(--color-primary-light)] active:border-[var(--color-primary)] active:translate-y-0 active:shadow-[var(--shadow-sm)]"
      )}
      aria-label={`${category.title} — ${category.articleCount ?? 0} articles`}
    >
      <span
        className="text-4xl mb-3 block w-11 h-11 flex items-center justify-center"
        aria-hidden="true"
      >
        {category.icon}
      </span>
      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-primary)] transition-colors duration-150">
        {category.title}
      </h3>
      {category.articleCount !== undefined && (
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          {category.articleCount} article{category.articleCount !== 1 ? "s" : ""}
        </p>
      )}
    </Link>
  );
}
