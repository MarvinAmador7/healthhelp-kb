import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { algoliasearch } from "algoliasearch";

// Protect with SANITY_WEBHOOK_SECRET (already required env var — no new secret needed).
// Call: POST /api/seed  -H "Authorization: Bearer <SANITY_WEBHOOK_SECRET>"
function authorized(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  return !!secret && !!token && token === secret;
}

const CATEGORIES = [
  { title: "Medications", icon: "💊", order: 1, description: "Dosage, side effects, interactions, and refills" },
  { title: "Symptoms & Conditions", icon: "🌡️", order: 2, description: "Understanding symptoms and what they mean" },
  { title: "Appointments & Care", icon: "📅", order: 3, description: "Scheduling, preparing for visits, and follow-up care" },
  { title: "Lab Results & Tests", icon: "🔬", order: 4, description: "Reading and understanding your test results" },
  { title: "Mental Health", icon: "🧠", order: 5, description: "Emotional wellbeing, stress, and mental health support" },
  { title: "Nutrition & Lifestyle", icon: "🥗", order: 6, description: "Diet, exercise, and healthy habits" },
  { title: "Insurance & Billing", icon: "📄", order: 7, description: "Coverage, claims, and billing questions" },
  { title: "Prevention & Wellness", icon: "🛡️", order: 8, description: "Vaccines, screenings, and staying healthy" },
];

const SAMPLE_TAGS = [
  "blood pressure", "diabetes", "medication", "mental health",
  "nutrition", "exercise", "sleep", "pain management", "chronic condition", "prevention",
];

const SAMPLE_ARTICLES = [
  {
    title: "How to read your blood pressure numbers",
    categoryTitle: "Symptoms & Conditions",
    articleType: "explainer",
    tags: ["blood pressure"],
    excerpt: "Learn what systolic and diastolic numbers mean, what's considered normal, and when to contact your doctor.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Blood pressure is measured in two numbers: systolic (top) and diastolic (bottom). Understanding these numbers helps you monitor your health." }] },
      { _type: "callout", _key: "caution1", type: "caution", text: "If your blood pressure is consistently above 180/120 mmHg, seek emergency care immediately." },
      { _type: "block", _key: "h1", style: "h2", children: [{ _type: "span", text: "What is normal blood pressure?" }] },
      { _type: "block", _key: "normal", style: "normal", children: [{ _type: "span", text: "Normal blood pressure for adults is less than 120/80 mmHg. 120–129 systolic with under 80 diastolic is considered elevated." }] },
    ],
  },
  {
    title: "What to expect at your first appointment",
    categoryTitle: "Appointments & Care",
    articleType: "how-to",
    tags: [],
    excerpt: "A step-by-step guide to preparing for your first visit, what questions to ask, and what to bring.",
    readTimeMinutes: 5,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Your first appointment is a chance for your care team to learn about your health history and goals. Being prepared helps you get the most out of your visit." }] },
      { _type: "callout", _key: "tip1", type: "info", text: "Bring a list of all current medications, including supplements and over-the-counter drugs, with dosages." },
    ],
  },
  {
    title: "Understanding your HbA1c test results",
    categoryTitle: "Lab Results & Tests",
    articleType: "explainer",
    tags: ["diabetes"],
    excerpt: "The HbA1c test shows your average blood sugar over the past 2–3 months. Here's what your number means.",
    readTimeMinutes: 6,
    clinicallyReviewed: true,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "HbA1c measures the percentage of hemoglobin with glucose attached, reflecting your average blood sugar over two to three months." }] },
      { _type: "callout", _key: "info1", type: "info", text: "Under 5.7% is normal. 5.7%–6.4% indicates prediabetes. 6.5% or above indicates diabetes." },
    ],
  },
  {
    title: "Managing medication side effects",
    categoryTitle: "Medications",
    articleType: "how-to",
    tags: ["medication"],
    excerpt: "Common strategies for managing side effects, when to call your doctor, and how to track how you're feeling.",
    readTimeMinutes: 5,
    clinicallyReviewed: true,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Most medications come with some side effects. Many are mild and temporary, but some require medical attention." }] },
      { _type: "callout", _key: "warning1", type: "warning", text: "Never stop taking a prescription medication without talking to your doctor first, even if you're experiencing side effects." },
    ],
  },
  {
    title: "How to improve your sleep quality",
    categoryTitle: "Mental Health",
    articleType: "how-to",
    tags: ["sleep", "mental health"],
    excerpt: "Evidence-based tips for better sleep: schedule, environment, and habits that actually work.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Poor sleep affects your physical and mental health. Consistent habits — a regular schedule, a dark room, and limiting screens — make a significant difference." }] },
      { _type: "callout", _key: "info1", type: "info", text: "Most adults need 7–9 hours per night. Sleeping less is linked to higher risks of heart disease, diabetes, and depression." },
    ],
  },
];

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractText(body: { _type: string; children?: { text?: string }[] }[]): string {
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

  const results: Record<string, number> = { authors: 0, tags: 0, categories: 0, articles: 0 };

  // Author
  await sanity.createOrReplace({
    _type: "author", _id: "system-author",
    name: "HealthHelp Medical Team",
    slug: { current: "healthhelp-medical-team" },
    bio: "Our clinical team reviews all articles for medical accuracy.",
    role: "Clinical Editorial Team",
  });
  results.authors = 1;

  // Tags
  const tagIds: Record<string, string> = {};
  for (const tag of SAMPLE_TAGS) {
    const slug = slugify(tag);
    const doc = await sanity.createOrReplace({ _type: "tag", _id: `tag-${slug}`, title: tag, slug: { current: slug } });
    tagIds[tag] = doc._id;
  }
  results.tags = SAMPLE_TAGS.length;

  // Categories
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.title);
    const id = `category-${slug}`;
    await sanity.createOrReplace({ _type: "category", _id: id, title: cat.title, slug: { current: slug }, description: cat.description, icon: cat.icon, order: cat.order });
    categoryIds[cat.title] = id;
  }
  results.categories = CATEGORIES.length;

  // Articles
  const now = new Date().toISOString();
  for (const art of SAMPLE_ARTICLES) {
    const slug = slugify(art.title);
    const catId = categoryIds[art.categoryTitle];
    const tagRefs = art.tags.map((t) => tagIds[t]).filter(Boolean).map((id) => ({ _type: "reference" as const, _ref: id, _key: id }));
    await sanity.createOrReplace({
      _type: "article", _id: `article-${slug}`,
      title: art.title, slug: { current: slug },
      articleType: art.articleType,
      category: { _type: "reference", _ref: catId },
      author: { _type: "reference", _ref: "system-author" },
      tags: tagRefs, excerpt: art.excerpt,
      body: art.body.map((b, i) => ({ ...b, _key: b._key ?? `block-${i}` })),
      clinicallyReviewed: art.clinicallyReviewed,
      readTimeMinutes: art.readTimeMinutes,
      publishedAt: now, updatedAt: now,
      helpfulCount: 0, totalFeedbackCount: 0,
    });
  }
  results.articles = SAMPLE_ARTICLES.length;

  // Algolia bulk index
  let algoliaIndexed = 0;
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;

  if (appId && adminKey) {
    const allArticles = await sanity.fetch<{
      _id: string; title: string; slug: string; excerpt: string;
      articleType: string; clinicallyReviewed: boolean; readTimeMinutes: number;
      publishedAt: string; updatedAt: string; helpfulCount: number;
      totalFeedbackCount: number; categoryTitle: string | null;
      categorySlug: string | null; tags: string[]; authorName: string | null;
      body: { _type: string; children?: { text?: string }[] }[];
    }[]>(`*[_type == "article"] {
      _id, title, "slug": slug.current, excerpt, articleType, clinicallyReviewed,
      readTimeMinutes, publishedAt, updatedAt, helpfulCount, totalFeedbackCount,
      "categoryTitle": category->title, "categorySlug": category->slug.current,
      "tags": tags[]->title, "authorName": author->name, body
    }`);

    const algolia = algoliasearch(appId, adminKey);
    const objects = allArticles.map((a) => ({
      objectID: a._id,
      title: a.title, slug: a.slug, excerpt: a.excerpt,
      content: extractText(a.body),
      articleType: a.articleType, clinicallyReviewed: a.clinicallyReviewed ?? false,
      readTimeMinutes: a.readTimeMinutes ?? 0,
      publishedAt: a.publishedAt, updatedAt: a.updatedAt,
      helpfulCount: a.helpfulCount ?? 0, totalFeedbackCount: a.totalFeedbackCount ?? 0,
      category: a.categorySlug, categoryTitle: a.categoryTitle,
      tags: a.tags ?? [], authorName: a.authorName,
    }));
    await algolia.saveObjects({ indexName: "articles", objects });
    await algolia.setSettings({
      indexName: "articles",
      indexSettings: {
        searchableAttributes: ["title", "excerpt", "content", "tags", "categoryTitle", "authorName"],
        attributesForFaceting: ["category", "articleType", "filterOnly(clinicallyReviewed)", "tags"],
        customRanking: ["desc(helpfulCount)", "desc(publishedAt)"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        hitsPerPage: 10,
      },
    });
    algoliaIndexed = objects.length;
  }

  return NextResponse.json({ seeded: results, algoliaIndexed, message: "Seed complete" });
}
