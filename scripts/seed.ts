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

    // === Clinically-reviewed articles (GLO-7, board-approved 2026-05-06) ===

    {
      title: "Setting up your health profile",
      categoryTitle: "Prevention & Wellness",
      articleType: "how-to",
      tags: ["prevention"],
      excerpt:
        "Complete your health profile so the platform can personalise your metrics, goals, and recommendations.",
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
              text: "Your health profile tells the platform your baseline — age, height, weight, and other key details. The more complete your profile, the more relevant your metrics and goal recommendations will be.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-required",
          style: "h2",
          children: [{ _type: "span", text: "Required fields" }],
        },
        {
          _type: "block",
          _key: "required-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "These four fields are needed to calculate core metrics like BMI, calorie burn estimates, and age-adjusted heart rate zones: date of birth, biological sex, height, and weight. If you prefer not to share your biological sex, select \"Prefer not to say\" — some metric ranges may be less precise as a result.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-optional",
          style: "h2",
          children: [{ _type: "span", text: "Optional fields" }],
        },
        {
          _type: "block",
          _key: "optional-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Adding optional details makes your experience more personalised: health conditions, medications, activity level, and an emergency contact (used only if you enable the safety check-in feature).",
            },
          ],
        },
        {
          _type: "callout",
          _key: "health-note",
          type: "info",
          text: "Health note: Entering accurate baseline data improves the accuracy of your metrics. If you have questions about which conditions or medications to list, speak with your healthcare provider.",
        },
        {
          _type: "block",
          _key: "h-disclaimer",
          style: "h2",
          children: [{ _type: "span", text: "Medical disclaimer" }],
        },
        {
          _type: "block",
          _key: "disclaimer-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. The information provided is for general wellness and informational purposes only. Always consult a qualified healthcare professional before making changes to your health routine or treatment plan.",
            },
          ],
        },
      ],
    },

    {
      title: "Understanding your health dashboard",
      categoryTitle: "Prevention & Wellness",
      articleType: "explainer",
      tags: ["prevention"],
      excerpt:
        "A tour of your health dashboard — what each metric card means and how to read your daily, weekly, and trend views.",
      readTimeMinutes: 3,
      clinicallyReviewed: true,
      body: [
        {
          _type: "callout",
          _key: "disclaimer",
          type: "warning",
          text: "Important: The metrics on your dashboard are for personal wellness tracking and are not a substitute for professional medical advice, diagnosis, or treatment. If you have concerns about any reading, speak with a qualified healthcare provider. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
        },
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "The dashboard brings together your key health metrics in one place so you can see how you're doing today, this week, and over time. Each metric appears as a card — tap any card to see a detailed view with history and trends.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-metrics",
          style: "h2",
          children: [{ _type: "span", text: "Metric cards" }],
        },
        {
          _type: "block",
          _key: "metrics-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Cards include: Steps (daily count vs. your goal), Heart rate (current resting heart rate), Sleep (last night's duration and quality score), Activity (active minutes and calories burned today), Weight (most recent log), and Blood oxygen/SpO₂ (latest reading, device-dependent).",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-dates",
          style: "h2",
          children: [{ _type: "span", text: "Date range selector" }],
        },
        {
          _type: "block",
          _key: "dates-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Switch between Today, Week (7-day rolling view), Month (30-day trends), or a Custom date range using the selector at the top of the dashboard.",
            },
          ],
        },
      ],
    },

    {
      title: "Setting your first health goals",
      categoryTitle: "Prevention & Wellness",
      articleType: "how-to",
      tags: ["prevention"],
      excerpt:
        "Set personalised health goals — steps, sleep, heart rate — and let the platform track your progress automatically.",
      readTimeMinutes: 4,
      clinicallyReviewed: true,
      body: [
        {
          _type: "callout",
          _key: "medical-note",
          type: "caution",
          text: "If you have a medical condition or are recovering from illness or surgery, consult your doctor before setting health targets — especially for heart rate, activity intensity, or weight. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before making changes to your health routine or treatment plan.",
        },
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Setting a goal gives the platform something to measure your progress against and lets it celebrate milestones with you. Available goal types include: daily steps, active minutes, sleep duration, weight, resting heart rate, and water intake.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-set",
          style: "h2",
          children: [{ _type: "span", text: "Setting a goal" }],
        },
        {
          _type: "block",
          _key: "set-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Tap Goals in the bottom navigation (or go to Profile → My goals), then tap + Add goal. Choose a goal type, enter your target value, choose a timeframe (daily, weekly, or ongoing), and tap Save goal. Your new goal will appear on the dashboard as a progress ring or bar.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-edit",
          style: "h2",
          children: [{ _type: "span", text: "Editing or pausing a goal" }],
        },
        {
          _type: "block",
          _key: "edit-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Go to Goals, tap the goal you want to change, then select Edit goal to change the target or Pause goal to suspend tracking temporarily. Pausing a goal removes it from your dashboard without deleting your history.",
            },
          ],
        },
      ],
    },

    {
      title: "Reading your health metrics (SpO₂ and HRV)",
      categoryTitle: "Symptoms & Conditions",
      articleType: "explainer",
      tags: ["blood pressure"],
      excerpt:
        "Understand what each health metric on your dashboard means — from resting heart rate to blood oxygen (SpO₂) and heart rate variability (HRV).",
      readTimeMinutes: 5,
      clinicallyReviewed: true,
      body: [
        {
          _type: "callout",
          _key: "disclaimer",
          type: "warning",
          text: "Important: The ranges below are general population averages. Your normal range may differ based on age, fitness level, medications, and health conditions. Always discuss unusual readings with your healthcare provider — do not use this app to self-diagnose. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
        },
        {
          _type: "block",
          _key: "h-rhr",
          style: "h2",
          children: [{ _type: "span", text: "Resting heart rate" }],
        },
        {
          _type: "block",
          _key: "rhr-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Your resting heart rate (RHR) is the number of times your heart beats per minute when you're at rest, best measured first thing in the morning. For athletes, 40–60 bpm is typical. For most adults, 60–100 bpm is normal. A rate consistently above 100 bpm is considered elevated. A consistently lower RHR generally indicates better cardiovascular fitness. A sudden increase may indicate stress, illness, or dehydration.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-spo2",
          style: "h2",
          children: [{ _type: "span", text: "Blood oxygen (SpO₂)" }],
        },
        {
          _type: "block",
          _key: "spo2-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "SpO₂ measures the percentage of oxygen in your blood. Normal SpO₂ for healthy adults is 95–100%.",
            },
          ],
        },
        {
          _type: "callout",
          _key: "spo2-warning",
          type: "warning",
          text: "An SpO₂ reading below 92% may indicate a medical issue. Seek medical attention promptly if you see a reading this low, especially if accompanied by shortness of breath, chest pain, or confusion.",
        },
        {
          _type: "block",
          _key: "h-hrv",
          style: "h2",
          children: [{ _type: "span", text: "Heart rate variability (HRV)" }],
        },
        {
          _type: "block",
          _key: "hrv-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "HRV measures the variation in time between heartbeats. Higher HRV generally indicates better recovery and cardiovascular health. HRV is highly individual — track your personal trend rather than comparing to population averages. Age, fitness level, and overall health all influence your baseline HRV.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-sleep",
          style: "h2",
          children: [{ _type: "span", text: "Sleep duration and quality" }],
        },
        {
          _type: "block",
          _key: "sleep-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Most adults need 7–9 hours of sleep per night. The quality score weighs consistency, deep sleep percentage, and interruptions. Weight naturally fluctuates by 1–3 kg throughout the day — use weight trends over time, not daily readings, as your reference.",
            },
          ],
        },
      ],
    },

    {
      title: "Monitoring vital signs",
      categoryTitle: "Symptoms & Conditions",
      articleType: "how-to",
      tags: ["chronic condition"],
      excerpt:
        "Monitor your heart rate, blood oxygen, and other vital signs in real time or on demand — and know when to seek medical care.",
      readTimeMinutes: 4,
      clinicallyReviewed: true,
      body: [
        {
          _type: "callout",
          _key: "device-disclaimer",
          type: "warning",
          text: "Important: This platform is a wellness tool, not a medical device. Readings from consumer wearables have a margin of error. Do not use them to diagnose or treat a medical condition. Always confirm abnormal readings with a clinician using a calibrated medical device. HealthHelp is not intended to diagnose, treat, cure, or prevent any disease.",
        },
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "The vitals available to you depend on your connected device. Supported vitals include: heart rate (most wearables), blood oxygen/SpO₂ (Apple Watch Series 6+, Fitbit Sense/Versa 3+, Garmin Fenix 6+), resting heart rate (most wearables), and heart rate variability (Apple Watch, Garmin, Oura Ring).",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-reading",
          style: "h2",
          children: [{ _type: "span", text: "Taking an on-demand reading" }],
        },
        {
          _type: "block",
          _key: "reading-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "For heart rate and SpO₂: go to Vitals in the bottom navigation, tap the metric you want to measure, follow the on-screen instructions (stay still, keep the device snug on your wrist), and wait 30–60 seconds for the reading.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-seek",
          style: "h2",
          children: [{ _type: "span", text: "When to seek medical advice" }],
        },
        {
          _type: "block",
          _key: "seek-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Contact a healthcare provider if you notice: resting heart rate consistently above 100 bpm or below 40 bpm; SpO₂ consistently below 95%; sudden, unexplained changes in your normal readings; or any reading accompanied by symptoms such as chest pain, dizziness, or shortness of breath.",
            },
          ],
        },
      ],
    },

    {
      title: "Setting medication reminders",
      categoryTitle: "Medications",
      articleType: "how-to",
      tags: ["medication"],
      excerpt:
        "Never miss a dose. Set up medication reminders with custom schedules, dosage notes, and refill alerts.",
      readTimeMinutes: 3,
      clinicallyReviewed: true,
      body: [
        {
          _type: "callout",
          _key: "prescription-caveat",
          type: "warning",
          text: "Important: This app is a reminder tool only. Always follow your prescriber's exact instructions. If you have questions about your medication, dosage, or interactions, contact your doctor or pharmacist — do not rely on this app for clinical guidance. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
        },
        {
          _type: "block",
          _key: "h-add",
          style: "h2",
          children: [{ _type: "span", text: "Adding a medication" }],
        },
        {
          _type: "block",
          _key: "add-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Go to Health → Medications and tap + Add medication. Enter the medication name (type to search or enter manually), dosage (e.g. 10 mg), frequency (once daily, twice daily, every 8 hours, etc.), the time(s) for reminders, and optional notes such as \"take with food\". Tap Save. You'll receive a push notification at each scheduled reminder time.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-refill",
          style: "h2",
          children: [{ _type: "span", text: "Setting a refill reminder" }],
        },
        {
          _type: "block",
          _key: "refill-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "On the medication detail page, toggle on Refill reminder and enter your current supply quantity. The app will alert you when you have a 7-day supply remaining.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-log",
          style: "h2",
          children: [{ _type: "span", text: "Logging a dose" }],
        },
        {
          _type: "block",
          _key: "log-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "When you receive a reminder, tap Taken to log the dose or Skip to dismiss it. Your adherence history is recorded on the medication detail page.",
            },
          ],
        },
      ],
    },

    {
      title: "Interpreting trends over time",
      categoryTitle: "Symptoms & Conditions",
      articleType: "explainer",
      tags: ["chronic condition"],
      excerpt:
        "See how your health metrics change over days, weeks, and months — and understand what improving or declining trends mean.",
      readTimeMinutes: 4,
      clinicallyReviewed: true,
      body: [
        {
          _type: "callout",
          _key: "wellness-caveat",
          type: "info",
          text: "Trend data is informational and for personal wellness tracking only. Discuss significant or sustained changes in your metrics with a qualified healthcare provider before drawing conclusions or changing your health routine. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
        },
        {
          _type: "block",
          _key: "intro",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "A single data point is just a snapshot. Trends reveal the direction your health is moving over time — which is far more useful for understanding your wellbeing. The app shows trends for all major metrics across three time windows: 7 days, 30 days, and 90 days.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-positive",
          style: "h2",
          children: [{ _type: "span", text: "What a positive trend looks like" }],
        },
        {
          _type: "block",
          _key: "positive-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Positive trends include: steps increasing week-over-week; resting heart rate gradually decreasing over months; sleep duration moving toward your target range; and weight tracking toward your goal at a healthy rate (0.5–1 kg per week).",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-concerning",
          style: "h2",
          children: [{ _type: "span", text: "Detecting concerning patterns" }],
        },
        {
          _type: "block",
          _key: "concerning-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "Pay attention to: a sustained upward trend in resting heart rate over 2 or more weeks; sleep duration consistently below 6 hours; SpO₂ trending below 95%; or any metric showing a sudden sharp change with no obvious explanation (new device, illness, travel). If you notice these patterns, discuss them with a healthcare provider.",
            },
          ],
        },
        {
          _type: "block",
          _key: "h-export",
          style: "h2",
          children: [{ _type: "span", text: "Exporting your trend report" }],
        },
        {
          _type: "block",
          _key: "export-body",
          style: "normal",
          children: [
            {
              _type: "span",
              text: "To share a trend report with your doctor: open the metric's trend chart, tap the Share icon (top right), and choose Export as PDF or Share link. Bringing trend charts to appointments gives your provider weeks or months of data at a glance — far more context than a single in-office reading.",
            },
          ],
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
