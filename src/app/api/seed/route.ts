import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { algoliasearch } from "algoliasearch";
import {
  ARTICLES,
  CATEGORIES,
  SYSTEM_AUTHOR,
  TAGS,
} from "@/lib/sanity/articles-data";

// Auth: accepts either SANITY_WEBHOOK_SECRET or SEED_ADMIN_TOKEN as Bearer.
// SEED_ADMIN_TOKEN is added solely for the GLO-20 backfill so an operator can
// trigger the seed without needing the long-lived Sanity webhook secret.
function authorized(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return false;
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  const admin = process.env.SEED_ADMIN_TOKEN;
  return (!!secret && token === secret) || (!!admin && token === admin);
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractText(
  body: { _type: string; children?: { text?: string }[] }[],
): string {
  return (body ?? [])
    .filter((b) => b._type === "block")
    .flatMap((b) => (b.children ?? []).map((c) => c.text ?? ""))
    .join(" ")
    .slice(0, 5000);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    token: process.env.SANITY_WRITE_TOKEN!,
    useCdn: false,
  });

  const results: Record<string, number> = {
    authors: 0,
    tags: 0,
    categories: 0,
    articles: 0,
    deletedArticles: 0,
    deletedCategories: 0,
  };

  // Author
  await sanity.createOrReplace(SYSTEM_AUTHOR);
  results.authors = 1;

  // Tags
  const tagIds: Record<string, string> = {};
  for (const tag of TAGS) {
    const slug = slugify(tag);
    const id = `tag-${slug}`;
    await sanity.createOrReplace({
      _type: "tag",
      _id: id,
      title: tag,
      slug: { current: slug },
    });
    tagIds[tag] = id;
  }
  results.tags = TAGS.length;

  // Categories
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const id = `category-${cat.slug}`;
    await sanity.createOrReplace({
      _type: "category",
      _id: id,
      title: cat.title,
      slug: { current: cat.slug },
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
    });
    categoryIds[cat.slug] = id;
  }
  results.categories = CATEGORIES.length;

  // Drop legacy articles + categories
  const keepArticleIds = new Set(ARTICLES.map((a) => `article-${a.slug}`));
  const keepCategoryIds = new Set(Object.values(categoryIds));
  const existingArticleIds: string[] = await sanity.fetch(
    `*[_type == "article"]._id`,
  );
  const existingCategoryIds: string[] = await sanity.fetch(
    `*[_type == "category"]._id`,
  );

  for (const id of existingArticleIds.filter((x) => !keepArticleIds.has(x))) {
    try {
      await sanity.delete(id);
      results.deletedArticles++;
    } catch {
      // ignore
    }
  }
  for (const id of existingCategoryIds.filter((x) => !keepCategoryIds.has(x))) {
    const refs: string[] = await sanity.fetch(
      `*[_type == "article" && references($id)]._id`,
      { id },
    );
    if (refs.length === 0) {
      try {
        await sanity.delete(id);
        results.deletedCategories++;
      } catch {
        // ignore
      }
    }
  }

  // Articles
  const now = new Date().toISOString();
  for (const art of ARTICLES) {
    const catId = categoryIds[art.category];
    if (!catId) {
      return NextResponse.json(
        { error: `Unknown category for article ${art.num}: ${art.category}` },
        { status: 500 },
      );
    }
    const tagRefs = art.tags
      .map((t) => tagIds[t])
      .filter(Boolean)
      .map((id) => ({ _type: "reference" as const, _ref: id, _key: `tagref-${id}` }));

    const body = art.body.map((b, i) => ({
      ...b,
      _key: b._key ?? `block-${i}`,
    }));

    await sanity.createOrReplace({
      _type: "article",
      _id: `article-${art.slug}`,
      title: art.title,
      slug: { current: art.slug },
      articleType: art.articleType,
      category: { _type: "reference", _ref: catId },
      author: { _type: "reference", _ref: SYSTEM_AUTHOR._id },
      tags: tagRefs,
      excerpt: art.excerpt,
      seoDescription: art.seoDescription,
      body,
      clinicallyReviewed: art.clinicallyReviewed,
      readTimeMinutes: art.readTimeMinutes,
      publishedAt: now,
      updatedAt: now,
      helpfulCount: 0,
      totalFeedbackCount: 0,
    });
  }
  results.articles = ARTICLES.length;

  // Algolia bulk index
  let algoliaIndexed = 0;
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;

  if (appId && adminKey) {
    type SanityArticleProjection = {
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
      categoryTitle: string | null;
      categorySlug: string | null;
      tags: string[];
      authorName: string | null;
      body: { _type: string; children?: { text?: string }[] }[];
    };

    const allArticles = await sanity.fetch<SanityArticleProjection[]>(
      `*[_type == "article"] {
        _id, title, "slug": slug.current, excerpt, articleType, clinicallyReviewed,
        readTimeMinutes, publishedAt, updatedAt, helpfulCount, totalFeedbackCount,
        "categoryTitle": category->title, "categorySlug": category->slug.current,
        "tags": tags[]->title, "authorName": author->name, body
      }`,
    );

    const algolia = algoliasearch(appId, adminKey);
    const objects = allArticles.map((a) => ({
      objectID: a._id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: extractText(a.body),
      articleType: a.articleType,
      clinicallyReviewed: a.clinicallyReviewed ?? false,
      readTimeMinutes: a.readTimeMinutes ?? 0,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      helpfulCount: a.helpfulCount ?? 0,
      totalFeedbackCount: a.totalFeedbackCount ?? 0,
      category: a.categorySlug,
      categoryTitle: a.categoryTitle,
      tags: a.tags ?? [],
      authorName: a.authorName,
    }));
    await algolia.saveObjects({ indexName: "articles", objects });
    await algolia.setSettings({
      indexName: "articles",
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
          "categoryTitle",
          "category",
          "articleType",
          "filterOnly(clinicallyReviewed)",
          "tags",
        ],
        customRanking: ["desc(helpfulCount)", "desc(publishedAt)"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        hitsPerPage: 10,
      },
    });
    algoliaIndexed = objects.length;
  }

  return NextResponse.json({
    seeded: results,
    algoliaIndexed,
    message: "Seed complete",
  });
}
