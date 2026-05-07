import type { Metadata } from "next";
import Link from "next/link";
import { client, CATEGORIES_QUERY, POPULAR_ARTICLES_QUERY } from "@/lib/sanity/client";
import type { Category, Article } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryCard from "@/components/home/CategoryCard";
import ContactCallout from "@/components/home/ContactCallout";
import { formatDate, helpfulPercent } from "@/lib/utils";
import { CheckCircle, Clock, ThumbsUp } from "lucide-react";

export const metadata: Metadata = {
  title: "HealthHelp — Patient Knowledge Base",
  description:
    "Find trusted, clinically reviewed answers to your health questions. Browse articles on symptoms, medications, conditions, and more.",
};

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function HomePage() {
  const [categories, popularArticles] = await Promise.all([
    client.fetch<Category[]>(CATEGORIES_QUERY).catch(() => [] as Category[]),
    client.fetch<Article[]>(POPULAR_ARTICLES_QUERY).catch(() => [] as Article[]),
  ]);

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero search */}
        <HeroSearch />

        {/* Categories */}
        <section
          aria-labelledby="categories-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <h2
            id="categories-heading"
            className="text-2xl font-bold text-[var(--color-text-primary)] mb-6"
          >
            Browse by category
          </h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-text-secondary)] text-sm">
              Categories coming soon.
            </p>
          )}
        </section>

        {/* Most helpful articles */}
        {popularArticles.length > 0 && (
          <section
            aria-labelledby="popular-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
          >
            <h2
              id="popular-heading"
              className="text-2xl font-bold text-[var(--color-text-primary)] mb-6"
            >
              Most helpful articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularArticles.map((article) => {
                const pct = helpfulPercent(
                  article.helpfulCount,
                  article.totalFeedbackCount
                );
                return (
                  <Link
                    key={article._id}
                    href={`/articles/${article.slug}`}
                    className="group flex flex-col gap-2 bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-primary)]">
                        {article.category?.title}
                      </span>
                      {article.clinicallyReviewed && (
                        <span className="flex items-center gap-1 text-[11px] text-[var(--color-accent)] font-medium">
                          <CheckCircle size={11} aria-hidden="true" />
                          Clinically reviewed
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] leading-snug transition-colors duration-150">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-tertiary)] mt-auto">
                      <span className="flex items-center gap-1">
                        <Clock size={11} aria-hidden="true" />
                        {article.readTimeMinutes} min
                      </span>
                      {pct > 0 && (
                        <span className="flex items-center gap-1 bg-[var(--color-success-light)] text-[var(--color-success)] px-2 py-0.5 rounded-full">
                          <ThumbsUp size={10} aria-hidden="true" />
                          {pct}% helpful
                        </span>
                      )}
                      <span>{formatDate(article.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Contact callout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <ContactCallout />
        </div>
      </main>
      <Footer />
    </>
  );
}
