/**
 * Seed script — run once after provisioning Sanity.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
 *   NEXT_PUBLIC_SANITY_DATASET=production \
 *   SANITY_WRITE_TOKEN=xxx \
 *   bun scripts/seed.ts
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN!,
  useCdn: false,
});

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

const SYSTEM_AUTHOR = {
  name: "HealthHelp Medical Team",
  slug: { current: "healthhelp-medical-team" },
  bio: "Our clinical team reviews all articles for medical accuracy.",
  role: "Clinical Editorial Team",
};

const SAMPLE_TAGS = [
  "blood pressure",
  "diabetes",
  "medication",
  "mental health",
  "nutrition",
  "exercise",
  "sleep",
  "pain management",
  "chronic condition",
  "prevention",
];

async function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding HealthHelp knowledge base...\n");

  // 1. Create system author
  console.log("Creating system author...");
  const authorDoc = await client.createOrReplace({
    _type: "author",
    _id: "system-author",
    ...SYSTEM_AUTHOR,
  });
  console.log(`  ✓ Author: ${authorDoc.name}`);

  // 2. Create tags
  console.log("\nCreating tags...");
  const tagIds: Record<string, string> = {};
  for (const tag of SAMPLE_TAGS) {
    const slug = await slugify(tag);
    const doc = await client.createOrReplace({
      _type: "tag",
      _id: `tag-${slug}`,
      title: tag,
      slug: { current: slug },
    });
    tagIds[tag] = doc._id;
    console.log(`  ✓ Tag: ${tag}`);
  }

  // 3. Create categories
  console.log("\nCreating categories...");
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const slug = await slugify(cat.title);
    const id = `category-${slug}`;
    await client.createOrReplace({
      _type: "category",
      _id: id,
      title: cat.title,
      slug: { current: slug },
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
    });
    categoryIds[cat.title] = id;
    console.log(`  ✓ Category: ${cat.title}`);
  }

  // 4. Create sample articles
  console.log("\nCreating sample articles...");
  const SAMPLE_ARTICLES = [
    {
      title: "How to read your blood pressure numbers",
      categoryTitle: "Symptoms & Conditions",
      articleType: "explainer",
      tags: ["blood pressure"],
      excerpt:
        "Learn what systolic and diastolic numbers mean, what's considered normal, and when to contact your doctor.",
      readTimeMinutes: 4,
      clinicallyReviewed: true,
      body: [
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Blood pressure is measured in two numbers: systolic (the top number) and diastolic (the bottom number). Understanding what these numbers mean helps you monitor your health effectively.",
            },
          ],
        },
        {
          _type: "callout",
          _key: "caution1",
          type: "caution",
          text: "If your blood pressure is consistently above 180/120 mmHg, seek emergency medical care immediately.",
        },
        {
          _type: "block",
          _key: "normal",
          style: "h2",
          children: [{ _type: "span", text: "What is normal blood pressure?" }],
        },
        {
          _type: "block",
          _key: "normal-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Normal blood pressure for adults is less than 120/80 mmHg. Elevated blood pressure is 120–129 systolic with less than 80 diastolic.",
            },
          ],
        },
      ],
    },
    {
      title: "What to expect at your first appointment",
      categoryTitle: "Appointments & Care",
      articleType: "how-to",
      tags: [],
      excerpt:
        "A step-by-step guide to preparing for your first visit, what questions to ask, and what information to bring.",
      readTimeMinutes: 5,
      clinicallyReviewed: false,
      body: [
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Your first appointment is a chance for your care team to learn about your health history and goals. Being prepared helps you get the most out of your visit.",
            },
          ],
        },
        {
          _type: "callout",
          _key: "tip1",
          type: "info",
          text: "Bring a list of all current medications, including supplements and over-the-counter drugs, with dosages.",
        },
      ],
    },
    {
      title: "Understanding your HbA1c test results",
      categoryTitle: "Lab Results & Tests",
      articleType: "explainer",
      tags: ["diabetes"],
      excerpt:
        "The HbA1c test shows your average blood sugar over the past 2–3 months. Here's what your number means.",
      readTimeMinutes: 6,
      clinicallyReviewed: true,
      body: [
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "HbA1c (glycated hemoglobin) measures the percentage of hemoglobin that has glucose attached to it, reflecting your average blood sugar over the past two to three months.",
            },
          ],
        },
        {
          _type: "callout",
          _key: "info1",
          type: "info",
          text: "An HbA1c below 5.7% is considered normal. Between 5.7% and 6.4% indicates prediabetes. 6.5% or above indicates diabetes.",
        },
      ],
    },
    {
      title: "Managing medication side effects",
      categoryTitle: "Medications",
      articleType: "how-to",
      tags: ["medication"],
      excerpt:
        "Common strategies for managing side effects, when to call your doctor, and how to track how you're feeling.",
      readTimeMinutes: 5,
      clinicallyReviewed: true,
      body: [
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Most medications come with some side effects. Many are mild and temporary, but some require medical attention. Knowing the difference helps you stay safe.",
            },
          ],
        },
        {
          _type: "callout",
          _key: "warning1",
          type: "warning",
          text: "Never stop taking a prescription medication without talking to your doctor first, even if you're experiencing side effects.",
        },
      ],
    },
    {
      title: "How to improve your sleep quality",
      categoryTitle: "Mental Health",
      articleType: "how-to",
      tags: ["sleep", "mental health"],
      excerpt:
        "Evidence-based tips for better sleep: schedule, environment, and habits that actually work.",
      readTimeMinutes: 4,
      clinicallyReviewed: false,
      body: [
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Poor sleep affects your physical and mental health. The good news is that consistent habits — a regular schedule, a dark room, and limiting screens — make a significant difference for most people.",
            },
          ],
        },
        {
          _type: "callout",
          _key: "info1",
          type: "info",
          text: "Most adults need 7–9 hours of sleep per night. Consistently sleeping less is linked to higher risks of heart disease, diabetes, and depression.",
        },
      ],
    },
  ];

  const now = new Date().toISOString();
  for (const art of SAMPLE_ARTICLES) {
    const slug = await slugify(art.title);
    const catId = categoryIds[art.categoryTitle];
    const tagRefs = art.tags
      .map((t) => tagIds[t])
      .filter(Boolean)
      .map((id) => ({ _type: "reference" as const, _ref: id, _key: id }));

    await client.createOrReplace({
      _type: "article",
      _id: `article-${slug}`,
      title: art.title,
      slug: { current: slug },
      articleType: art.articleType,
      category: { _type: "reference", _ref: catId },
      author: { _type: "reference", _ref: "system-author" },
      tags: tagRefs,
      excerpt: art.excerpt,
      body: art.body.map((b, i) => ({ ...b, _key: b._key ?? `block-${i}` })),
      clinicallyReviewed: art.clinicallyReviewed,
      readTimeMinutes: art.readTimeMinutes,
      publishedAt: now,
      updatedAt: now,
      helpfulCount: 0,
      totalFeedbackCount: 0,
    });
    console.log(`  ✓ Article: ${art.title}`);
  }

  console.log("\n✅ Seed complete! Next: run the Algolia indexing script.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
