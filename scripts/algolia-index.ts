/**
 * Algolia bulk-index script — re-run any time you want to sync Sanity → Algolia.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
 *   NEXT_PUBLIC_SANITY_DATASET=production \
 *   ALGOLIA_APP_ID=xxx \
 *   ALGOLIA_ADMIN_KEY=xxx \
 *   ALGOLIA_INDEX_NAME=healthhelp_articles \
 *   bun scripts/algolia-index.ts
 */
import { createClient } from "@sanity/client";
import { algoliasearch } from "algoliasearch";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? "healthhelp_articles";

const ALL_ARTICLES_QUERY = `*[_type == "article"] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  articleType,
  clinicallyReviewed,
  readTimeMinutes,
  publishedAt,
  updatedAt,
  helpfulCount,
  totalFeedbackCount,
  "category": category->{ title, "slug": slug.current },
  "tags": tags[]->{ title, "slug": slug.current },
  "author": author->{ name },
  body
}`;

type SanityBlock = {
  _type: string;
  children?: { text?: string }[];
};

type SanityArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  articleType: string;
  clinicallyReviewed: boolean;
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  helpfulCount: number;
  totalFeedbackCount: number;
  category: { title: string; slug: string } | null;
  tags: { title: string; slug: string }[] | null;
  author: { name: string } | null;
  body: SanityBlock[];
};

function extractPlainText(body: SanityBlock[]): string {
  if (!Array.isArray(body)) return "";
  return body
    .filter((b) => b._type === "block")
    .flatMap((b) => (b.children ?? []).map((c) => c.text ?? ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

async function main() {
  console.log("📦 Fetching all articles from Sanity...");
  const articles: SanityArticle[] = await sanity.fetch(ALL_ARTICLES_QUERY);
  console.log(`  Found ${articles.length} articles\n`);

  const objects = articles.map((a) => ({
    objectID: a._id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: extractPlainText(a.body),
    articleType: a.articleType,
    clinicallyReviewed: a.clinicallyReviewed ?? false,
    readTimeMinutes: a.readTimeMinutes ?? 0,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    helpfulCount: a.helpfulCount ?? 0,
    totalFeedbackCount: a.totalFeedbackCount ?? 0,
    categoryTitle: a.category?.title ?? null,
    categorySlug: a.category?.slug ?? null,
    tags: (a.tags ?? []).map((t) => t.title),
    authorName: a.author?.name ?? null,
  }));

  console.log(`🔼 Uploading ${objects.length} records to Algolia index "${INDEX_NAME}"...`);
  await algolia.saveObjects({ indexName: INDEX_NAME, objects });
  console.log("  ✓ Records saved");

  console.log("⚙️  Configuring index settings...");
  await algolia.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        "title",
        "excerpt",
        "content",
        "tags",
        "categoryTitle",
        "authorName",
      ],
      attributesForFaceting: [
        "filterOnly(categoryTitle)",
        "filterOnly(articleType)",
        "filterOnly(clinicallyReviewed)",
        "tags",
      ],
      customRanking: ["desc(helpfulCount)", "desc(publishedAt)"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
      hitsPerPage: 10,
    },
  });
  console.log("  ✓ Index settings applied");

  console.log("\n✅ Algolia index sync complete!");
}

main().catch((err) => {
  console.error("Indexing failed:", err);
  process.exit(1);
});
