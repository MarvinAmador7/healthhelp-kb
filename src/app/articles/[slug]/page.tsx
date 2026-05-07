import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  client,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
  RELATED_ARTICLES_QUERY,
} from "@/lib/sanity/client";
import type { Article } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TableOfContents, { type TocEntry } from "@/components/article/TableOfContents";
import ContactSupportCta from "@/components/article/ContactSupportCta";
import FeedbackWidget from "@/components/article/FeedbackWidget";
import ArticleBody from "@/components/article/ArticleBody";
import { formatDate, formatReadTime, helpfulPercent, safeJsonLd } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  ThumbsUp,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await client.fetch<Article>(ARTICLE_BY_SLUG_QUERY, { slug });
  if (!article) return { title: "Article not found" };

  const description = article.seoDescription ?? article.excerpt;
  return {
    title: article.title,
    description,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      section: article.category.title,
    },
  };
}

export const revalidate = 300;

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await client.fetch<Article>(ARTICLE_BY_SLUG_QUERY, { slug });
  if (!article) notFound();

  const [sidebarArticles, relatedArticles] = await Promise.all([
    client
      .fetch<Article[]>(ARTICLES_BY_CATEGORY_QUERY, {
        categorySlug: article.category.slug,
      })
      .catch(() => [] as Article[]),
    client
      .fetch<Article[]>(RELATED_ARTICLES_QUERY, {
        currentSlug: slug,
        tagIds: article.tags.map((t) => t.slug),
      })
      .catch(() => [] as Article[]),
  ]);

  const pct = helpfulPercent(article.helpfulCount, article.totalFeedbackCount);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription ?? article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "HealthHelp",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://help.healthco.com",
    },
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://help.healthco.com"}/articles/${slug}`,
    articleSection: article.category.title,
  };

  // TOC entries — extracted from H2/H3 headings in the article body.
  type SanityBlock = {
    _type: string;
    style?: string;
    children?: { text?: string }[];
  };
  function slugifyHeading(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  const toc: TocEntry[] = ((article.body as SanityBlock[] | undefined) ?? [])
    .filter((b) => b._type === "block" && (b.style === "h2" || b.style === "h3"))
    .map((b) => {
      const text = (b.children ?? []).map((c) => c.text ?? "").join("");
      return {
        id: slugifyHeading(text),
        text,
        level: b.style === "h3" ? 3 : 2,
      };
    });

  return (
    <>
      <Header />
      <main id="main-content">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
        >
          <ol className="flex items-center gap-1 text-sm text-[var(--color-text-tertiary)]" role="list">
            <li>
              <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} /></li>
            <li>
              <Link
                href={`/search?category=${article.category.slug}`}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {article.category.title}
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} /></li>
            <li className="text-[var(--color-text-secondary)] truncate max-w-[200px]" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* 3-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex gap-6">
            {/* Left sidebar — category nav */}
            <aside
              aria-label="Category navigation"
              className="hidden lg:block w-[236px] flex-shrink-0"
            >
              <nav className="sticky top-[68px]" aria-label="Articles in this category">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3 px-2">
                  {article.category.title}
                </p>
                <ul role="list" className="space-y-0.5">
                  {sidebarArticles.slice(0, 12).map((a) => (
                    <li key={a._id}>
                      <Link
                        href={`/articles/${a.slug}`}
                        aria-current={a.slug === slug ? "page" : undefined}
                        className={cn(
                          "block px-2 py-2 rounded-[var(--radius-md)] text-sm leading-snug transition-colors duration-150",
                          a.slug === slug
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                        )}
                      >
                        {a.slug === slug && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mr-2 mb-0.5"
                            aria-hidden="true"
                          />
                        )}
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[var(--color-border)] mt-4 pt-4">
                  <Link
                    href={`/search?category=${article.category.slug}`}
                    className="text-sm text-[var(--color-primary)] hover:underline px-2"
                  >
                    All {article.category.title} articles →
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Main content */}
            <article className="flex-1 min-w-0 bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 sm:p-8">
              {/* Article header */}
              <header>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-primary)]">
                    {article.category.title}
                  </span>
                  {article.clinicallyReviewed && (
                    <span className="flex items-center gap-1 text-[11px] text-[var(--color-accent)] font-medium bg-[var(--color-accent-light)] px-2 py-0.5 rounded-full">
                      <CheckCircle size={11} aria-hidden="true" />
                      Clinically reviewed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] leading-tight mb-3">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-tertiary)] mb-2">
                  <span className="flex items-center gap-1">
                    <Clock size={13} aria-hidden="true" />
                    {formatReadTime(article.readTimeMinutes)}
                  </span>
                  <span>Updated {formatDate(article.updatedAt)}</span>
                  {pct > 0 && (
                    <span className="flex items-center gap-1 bg-[var(--color-success-light)] text-[var(--color-success)] px-2 py-0.5 rounded-full text-[11px]">
                      <ThumbsUp size={10} aria-hidden="true" />
                      {pct}% found this helpful
                    </span>
                  )}
                </div>
                {article.author && (
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    By <span className="text-[var(--color-text-secondary)]">{article.author.name}</span>
                  </p>
                )}
              </header>

              {/* Mobile TOC */}
              <div className="lg:hidden mt-4 mb-6 bg-[var(--color-surface-alt)] rounded-[var(--radius-md)] p-4">
                <TableOfContents entries={toc} />
              </div>

              {/* Excerpt / lead */}
              <p className="mt-5 text-[var(--color-text-secondary)] text-base leading-relaxed border-l-4 border-[var(--color-primary-medium)] pl-4 italic">
                {article.excerpt}
              </p>

              {/* Body — Sanity portable text */}
              <div className="mt-6">
                <ArticleBody body={(article.body as unknown[] | undefined) ?? []} />
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/search?q=${encodeURIComponent(tag.title)}`}
                      className="text-[11px] font-medium px-3 py-1 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors duration-150"
                    >
                      {tag.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Feedback widget */}
              <FeedbackWidget articleSlug={slug} />
            </article>

            {/* Right column — TOC + Contact CTA */}
            <aside
              aria-label="Article navigation and support"
              className="hidden lg:block w-[212px] flex-shrink-0"
            >
              <div className="sticky top-[68px] space-y-4">
                {toc.length > 0 && (
                  <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
                      In this article
                    </p>
                    <TableOfContents entries={toc} />
                  </div>
                )}
                <ContactSupportCta />
              </div>
            </aside>
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <section
              aria-labelledby="related-heading"
              className="mt-10"
            >
              <h2
                id="related-heading"
                className="text-lg font-bold text-[var(--color-text-primary)] mb-4"
              >
                Related articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedArticles.map((a) => (
                  <Link
                    key={a._id}
                    href={`/articles/${a.slug}`}
                    className="block bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all duration-150 group"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-primary)] mb-1">
                      {a.category?.title}
                    </p>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] leading-snug transition-colors duration-150">
                      {a.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1 flex items-center gap-1">
                      <Clock size={10} aria-hidden="true" />
                      {a.readTimeMinutes} min
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Mobile sticky support bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] px-4 py-3 flex gap-3 z-30">
            <a
              href="mailto:support@healthco.com"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-full py-3 min-h-[44px]"
            >
              <MessageCircle size={15} aria-hidden="true" />
              Contact support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
