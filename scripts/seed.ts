/**
 * Seed script — loads the 20 approved KB articles into Sanity (GLO-20).
 *
 * Drafts authored under GLO-5; clinical review (Articles 2, 4, 5, 6, 8, 9, 11)
 * signed off in GLO-7; legal review (Articles 12, 13, 20) signed off in GLO-8;
 * board approval received.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
 *   NEXT_PUBLIC_SANITY_DATASET=production \
 *   SANITY_WRITE_TOKEN=xxx \
 *   bun scripts/seed.ts
 *
 * Article content is shared with /api/seed via src/lib/sanity/articles-data.ts.
 */
import { createClient } from "@sanity/client";
import {
  ARTICLES,
  CATEGORIES,
  SYSTEM_AUTHOR,
  TAGS,
} from "../src/lib/sanity/articles-data";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN!,
  useCdn: false,
});

async function main() {
  console.log("🌱 GLO-20 backfill — loading 20 approved KB articles into Sanity\n");

  // 1. Author
  console.log("Creating editorial author...");
  await client.createOrReplace(SYSTEM_AUTHOR);
  console.log(`  ✓ Author: ${SYSTEM_AUTHOR.name}`);

  // 2. Tags
  console.log("\nCreating tags...");
  const tagIds: Record<string, string> = {};
  for (const tag of TAGS) {
    const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = `tag-${slug}`;
    await client.createOrReplace({
      _type: "tag",
      _id: id,
      title: tag,
      slug: { current: slug },
    });
    tagIds[tag] = id;
    console.log(`  ✓ Tag: ${tag}`);
  }

  // 3. Categories
  console.log("\nCreating categories...");
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const id = `category-${cat.slug}`;
    await client.createOrReplace({
      _type: "category",
      _id: id,
      title: cat.title,
      slug: { current: cat.slug },
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
    });
    categoryIds[cat.slug] = id;
    console.log(`  ✓ Category: ${cat.title} (/${cat.slug})`);
  }

  // 4. Drop legacy articles + categories not part of the canonical set
  console.log("\nCleaning legacy content...");
  const keepArticleIds = new Set(ARTICLES.map((a) => `article-${a.slug}`));
  const keepCategoryIds = new Set(Object.values(categoryIds));
  const existingArticleIds: string[] = await client.fetch(`*[_type == "article"]._id`);
  const existingCategoryIds: string[] = await client.fetch(`*[_type == "category"]._id`);

  for (const id of existingArticleIds.filter((x) => !keepArticleIds.has(x))) {
    await client.delete(id);
    console.log(`  ✗ Deleted legacy article: ${id}`);
  }
  for (const id of existingCategoryIds.filter((x) => !keepCategoryIds.has(x))) {
    const refs: string[] = await client.fetch(
      `*[_type == "article" && references($id)]._id`,
      { id },
    );
    if (refs.length === 0) {
      await client.delete(id);
      console.log(`  ✗ Deleted legacy category: ${id}`);
    } else {
      console.log(`  ⚠ Skipped legacy category ${id}: still referenced by ${refs.length} article(s)`);
    }
  }

  // 5. Articles
  console.log("\nCreating 20 approved articles...");
  const now = new Date().toISOString();
  for (const art of ARTICLES) {
    const catId = categoryIds[art.category];
    if (!catId) throw new Error(`Unknown category for article ${art.num}: ${art.category}`);
    const tagRefs = art.tags
      .map((t) => tagIds[t])
      .filter(Boolean)
      .map((id) => ({ _type: "reference" as const, _ref: id, _key: `tagref-${id}` }));

    const body = art.body.map((b, i) => ({
      ...b,
      _key: b._key ?? `block-${i}`,
    }));

    await client.createOrReplace({
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
    console.log(`  ✓ Article ${art.num}: ${art.title}  (/articles/${art.slug})`);
  }

  console.log(
    `\n✅ Seeded ${ARTICLES.length} articles, ${CATEGORIES.length} categories, ${TAGS.length} tags`,
  );
  console.log("Next: run `bun scripts/algolia-index.ts` to sync to Algolia search.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
