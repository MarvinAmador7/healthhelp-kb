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
  { title: "Getting Started", icon: "🚀", order: 9, description: "Account setup, device pairing, and first steps" },
  { title: "Using the Product", icon: "📱", order: 10, description: "Tracking activity, metrics, medications, and sharing" },
  { title: "Privacy & Security", icon: "🔒", order: 11, description: "How your data is protected and your privacy rights" },
  { title: "Troubleshooting", icon: "🔧", order: 12, description: "Fix connection issues, sync problems, and login errors" },
  { title: "FAQ", icon: "❓", order: 13, description: "Answers to the most common questions" },
];

const ALL_TAGS = [
  "blood pressure", "diabetes", "medication", "mental health",
  "nutrition", "exercise", "sleep", "pain management", "chronic condition", "prevention",
  "privacy", "HIPAA", "security", "getting started", "troubleshooting",
];

// Old sample article IDs to remove before loading real content
const LEGACY_ARTICLE_IDS = [
  "article-how-to-read-your-blood-pressure-numbers",
  "article-what-to-expect-at-your-first-appointment",
  "article-understanding-your-hba1c-test-results",
  "article-managing-medication-side-effects",
  "article-how-to-improve-your-sleep-quality",
  // GLO-7 batch with title-derived IDs (now replaced by slug-based IDs)
  "article-setting-up-your-health-profile",
  "article-understanding-your-health-dashboard",
  "article-setting-your-first-health-goals",
  "article-reading-your-health-metrics-spo-and-hrv",
  "article-monitoring-vital-signs",
  "article-setting-medication-reminders",
  "article-interpreting-trends-over-time",
];

const ALL_ARTICLES = [
  // ── GETTING STARTED (Articles 1–5) ──────────────────────────────────────
  {
    id: "article-create-account",
    title: "Creating Your Account",
    slug: "create-account",
    categoryTitle: "Getting Started",
    articleType: "how-to",
    tags: ["getting started"],
    excerpt: "Set up your health account in under two minutes. Step-by-step guide to registration, email verification, and your first login.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Creating your account is the first step to tracking your health in one place. You'll need an email address and a password — that's it." }] },
      { _type: "block", _key: "h-signup", style: "h2", children: [{ _type: "span", text: "Step 1: Open the sign-up page" }] },
      { _type: "block", _key: "signup", style: "normal", children: [{ _type: "span", text: "Go to the app or visit our website and tap Sign up. You'll see a short registration form asking for your email address, a password (at least 8 characters with one number and one symbol), and your date of birth." }] },
      { _type: "callout", _key: "tip1", type: "info", text: "Use a personal email address rather than a work one. Health data is private, and personal email accounts are generally not monitored by employers." },
      { _type: "block", _key: "h-verify", style: "h2", children: [{ _type: "span", text: "Step 2: Verify your email" }] },
      { _type: "block", _key: "verify", style: "normal", children: [{ _type: "span", text: "Check your inbox for a verification email. Click the Confirm email button. If you don't see it within five minutes, check your spam folder or tap Resend verification email on the sign-up screen." }] },
      { _type: "callout", _key: "security", type: "info", text: "Security tip: Never share your password with anyone, including support staff. Our team will never ask for your password." },
    ],
  },
  {
    id: "article-health-profile",
    title: "Setting Up Your Health Profile",
    slug: "health-profile",
    categoryTitle: "Getting Started",
    articleType: "how-to",
    tags: ["getting started", "prevention"],
    excerpt: "Complete your health profile so the platform can personalise your metrics, goals, and recommendations.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Your health profile tells the platform your baseline — age, height, weight, and other key details. The more complete your profile, the more relevant your metrics and goal recommendations will be." }] },
      { _type: "block", _key: "h-required", style: "h2", children: [{ _type: "span", text: "Required fields" }] },
      { _type: "block", _key: "required", style: "normal", children: [{ _type: "span", text: "These four fields are needed to calculate core metrics: date of birth (age-adjusted health ranges), biological sex (baseline metric calibration), height (BMI and body composition), and weight (calorie and activity calculations). If you prefer not to share your biological sex, select 'Prefer not to say' — some metric ranges may be less precise." }] },
      { _type: "block", _key: "h-optional", style: "h2", children: [{ _type: "span", text: "Optional fields" }] },
      { _type: "block", _key: "optional", style: "normal", children: [{ _type: "span", text: "Adding optional details makes your experience more personalised: health conditions, medications, activity level, and an emergency contact (used only if you enable the safety check-in feature)." }] },
      { _type: "callout", _key: "health-note", type: "info", text: "Health note: Entering accurate baseline data improves the accuracy of your metrics. If you have questions about which conditions or medications to list, speak with your healthcare provider." },
      { _type: "block", _key: "disclaimer", style: "normal", children: [{ _type: "span", text: "HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before making changes to your health routine or treatment plan." }] },
    ],
  },
  {
    id: "article-connect-device",
    title: "Connecting Your Device or Wearable",
    slug: "connect-device",
    categoryTitle: "Getting Started",
    articleType: "how-to",
    tags: ["getting started"],
    excerpt: "Connect your wearable or health device to start automatic data syncing. Supports Apple Watch, Fitbit, Garmin, and more.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Connecting a wearable means your steps, heart rate, sleep, and other metrics flow into the platform without you having to log anything manually. Most devices pair in under a minute." }] },
      { _type: "block", _key: "h-supported", style: "h2", children: [{ _type: "span", text: "Supported devices" }] },
      { _type: "block", _key: "supported", style: "normal", children: [{ _type: "span", text: "We support: Apple Watch (Series 4+, via Apple Health), Fitbit (all models from 2018 onwards), Garmin (Forerunner, Fenix, Venu, Vivoactive), Google Pixel Watch (via Google Fit), Withings (ScanWatch, Body+ scales), and Oura Ring (Generation 3 and 4)." }] },
      { _type: "block", _key: "h-connect", style: "h2", children: [{ _type: "span", text: "How to connect" }] },
      { _type: "block", _key: "connect", style: "normal", children: [{ _type: "span", text: "Go to Settings → Devices, tap Add device, select your device brand, and follow the on-screen pairing instructions. On Android, location permission is required for Bluetooth scanning — this does not track your GPS location." }] },
      { _type: "callout", _key: "tip", type: "info", text: "Make sure Bluetooth is enabled and keep your phone and device within 30 cm of each other during pairing." },
      { _type: "block", _key: "h-manual", style: "h2", children: [{ _type: "span", text: "No wearable? Use manual entry" }] },
      { _type: "block", _key: "manual", style: "normal", children: [{ _type: "span", text: "You can log activities, weight, and other metrics manually using the Log tab. You can also connect Apple Health or Google Fit to pull in data from other apps on your phone." }] },
    ],
  },
  {
    id: "article-dashboard-overview",
    title: "Understanding Your Dashboard",
    slug: "dashboard-overview",
    categoryTitle: "Getting Started",
    articleType: "explainer",
    tags: ["getting started", "prevention"],
    excerpt: "A tour of your health dashboard — what each metric card means and how to read your daily, weekly, and trend views.",
    readTimeMinutes: 3,
    clinicallyReviewed: true,
    body: [
      { _type: "callout", _key: "disclaimer", type: "warning", text: "Important: The metrics on your dashboard are for personal wellness tracking and are not a substitute for professional medical advice, diagnosis, or treatment. If you have concerns about any reading, speak with a qualified healthcare provider. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease." },
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "The dashboard brings together your key health metrics in one place so you can see how you're doing today, this week, and over time. Each metric appears as a card — tap any card to see a detailed view with history and trends." }] },
      { _type: "block", _key: "h-cards", style: "h2", children: [{ _type: "span", text: "Metric cards" }] },
      { _type: "block", _key: "cards", style: "normal", children: [{ _type: "span", text: "Cards include: Steps (daily count vs. your goal), Heart rate (current resting heart rate), Sleep (last night's duration and quality score), Activity (active minutes and calories burned today), Weight (most recent log), and Blood oxygen/SpO₂ (latest reading, device-dependent)." }] },
      { _type: "block", _key: "h-dates", style: "h2", children: [{ _type: "span", text: "Date range selector" }] },
      { _type: "block", _key: "dates", style: "normal", children: [{ _type: "span", text: "Switch between Today, Week (7-day rolling view), Month (30-day trends), or a Custom date range using the selector at the top of the dashboard." }] },
      { _type: "block", _key: "h-custom", style: "h2", children: [{ _type: "span", text: "Customising your view" }] },
      { _type: "block", _key: "custom", style: "normal", children: [{ _type: "span", text: "Tap the Edit icon (pencil) on the dashboard to reorder or hide metric cards. Drag cards to reorder them, toggle any card to hide it, then tap Done." }] },
    ],
  },
  {
    id: "article-set-health-goals",
    title: "Setting Your First Health Goals",
    slug: "set-health-goals",
    categoryTitle: "Getting Started",
    articleType: "how-to",
    tags: ["getting started", "prevention"],
    excerpt: "Set personalised health goals — steps, sleep, heart rate — and let the platform track your progress automatically.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    body: [
      { _type: "callout", _key: "medical-note", type: "caution", text: "If you have a medical condition or are recovering from illness or surgery, consult your doctor before setting health targets — especially for heart rate, activity intensity, or weight. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before making changes to your health routine or treatment plan." },
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Setting a goal gives the platform something to measure your progress against and lets it celebrate milestones with you. Available goal types: daily steps, active minutes, sleep duration, weight, resting heart rate, and water intake." }] },
      { _type: "block", _key: "h-set", style: "h2", children: [{ _type: "span", text: "Setting a goal" }] },
      { _type: "block", _key: "set", style: "normal", children: [{ _type: "span", text: "Tap Goals in the bottom navigation (or go to Profile → My goals), then tap + Add goal. Choose a goal type, enter your target value, choose a timeframe (daily, weekly, or ongoing), and tap Save goal. Your new goal will appear on the dashboard as a progress ring or bar." }] },
      { _type: "block", _key: "h-edit", style: "h2", children: [{ _type: "span", text: "Editing or pausing a goal" }] },
      { _type: "block", _key: "edit", style: "normal", children: [{ _type: "span", text: "Go to Goals, tap the goal you want to change, then select Edit goal to change the target or Pause goal to suspend tracking temporarily. Pausing removes it from your dashboard without deleting your history." }] },
    ],
  },

  // ── USING THE PRODUCT (Articles 6–11) ───────────────────────────────────
  {
    id: "article-health-metrics",
    title: "Reading Your Health Metrics",
    slug: "health-metrics",
    categoryTitle: "Using the Product",
    articleType: "explainer",
    tags: ["blood pressure", "chronic condition"],
    excerpt: "Understand what each health metric on your dashboard means — from resting heart rate to sleep stages and blood oxygen.",
    readTimeMinutes: 5,
    clinicallyReviewed: true,
    body: [
      { _type: "callout", _key: "disclaimer", type: "warning", text: "Important: The ranges below are general population averages. Your normal range may differ based on age, fitness level, medications, and health conditions. Always discuss unusual readings with your healthcare provider — do not use this app to self-diagnose. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease." },
      { _type: "block", _key: "h-rhr", style: "h2", children: [{ _type: "span", text: "Resting heart rate" }] },
      { _type: "block", _key: "rhr", style: "normal", children: [{ _type: "span", text: "Your resting heart rate (RHR) is the number of times your heart beats per minute at rest. Athletes: 40–60 bpm. Typical adults: 60–100 bpm. Above 100 bpm is considered elevated. A consistently lower RHR generally indicates better cardiovascular fitness." }] },
      { _type: "block", _key: "h-spo2", style: "h2", children: [{ _type: "span", text: "Blood oxygen (SpO₂)" }] },
      { _type: "block", _key: "spo2", style: "normal", children: [{ _type: "span", text: "SpO₂ measures the percentage of oxygen in your blood. Normal SpO₂ for healthy adults is 95–100%." }] },
      { _type: "callout", _key: "spo2-warn", type: "warning", text: "An SpO₂ reading below 92% may indicate a medical issue. Seek medical attention promptly if you see a reading this low, especially if accompanied by shortness of breath, chest pain, or confusion." },
      { _type: "block", _key: "h-hrv", style: "h2", children: [{ _type: "span", text: "Heart rate variability (HRV)" }] },
      { _type: "block", _key: "hrv", style: "normal", children: [{ _type: "span", text: "HRV measures the variation in time between heartbeats. Higher HRV generally indicates better recovery and cardiovascular health. HRV is highly individual — track your personal trend rather than comparing to population averages." }] },
      { _type: "block", _key: "h-sleep", style: "h2", children: [{ _type: "span", text: "Sleep duration and quality" }] },
      { _type: "block", _key: "sleep", style: "normal", children: [{ _type: "span", text: "Most adults need 7–9 hours of sleep per night. The quality score weighs consistency, deep sleep percentage, and interruptions. Use weight trends over time rather than daily readings as your reference — weight naturally fluctuates 1–3 kg throughout the day." }] },
    ],
  },
  {
    id: "article-track-activity",
    title: "Tracking Daily Activity",
    slug: "track-activity",
    categoryTitle: "Using the Product",
    articleType: "how-to",
    tags: ["exercise", "nutrition"],
    excerpt: "Track steps, workouts, and calories automatically or log activities manually. Keep your activity history in one place.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "If you've connected a wearable, steps, active minutes, and calories are tracked automatically. The app syncs every 15 minutes when open, and hourly in the background." }] },
      { _type: "block", _key: "h-manual", style: "h2", children: [{ _type: "span", text: "Logging a workout manually" }] },
      { _type: "block", _key: "manual", style: "normal", children: [{ _type: "span", text: "Tap the Log tab, then + Log activity. Choose your activity type (running, cycling, strength training, yoga, etc.), enter the duration and optionally distance or calories, add a note, and tap Save." }] },
      { _type: "block", _key: "h-history", style: "h2", children: [{ _type: "span", text: "Activity history" }] },
      { _type: "block", _key: "history", style: "normal", children: [{ _type: "span", text: "Tap History from the Log tab to see a chronological list of all logged and synced workouts. Every Monday the app sends a weekly summary notification with your total steps, active minutes, and most active day." }] },
      { _type: "callout", _key: "tip", type: "info", text: "Tip: Log activities within 24 hours for best accuracy. Retroactive entries are supported but affect streak calculations." },
    ],
  },
  {
    id: "article-monitor-vitals",
    title: "Monitoring Vital Signs",
    slug: "monitor-vitals",
    categoryTitle: "Using the Product",
    articleType: "how-to",
    tags: ["blood pressure", "chronic condition"],
    excerpt: "Monitor your heart rate, blood oxygen, and other vital signs in real time or on demand — and know when to seek medical care.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    body: [
      { _type: "callout", _key: "device-disclaimer", type: "warning", text: "Important: This platform is a wellness tool, not a medical device. Readings from consumer wearables have a margin of error. Do not use them to diagnose or treat a medical condition. Always confirm abnormal readings with a clinician using a calibrated medical device. HealthHelp is not intended to diagnose, treat, cure, or prevent any disease." },
      { _type: "block", _key: "supported", style: "normal", children: [{ _type: "span", text: "Supported vitals depend on your device: heart rate (most wearables), blood oxygen/SpO₂ (Apple Watch Series 6+, Fitbit Sense/Versa 3+, Garmin Fenix 6+), resting heart rate (most wearables), and heart rate variability (Apple Watch, Garmin, Oura Ring)." }] },
      { _type: "block", _key: "h-reading", style: "h2", children: [{ _type: "span", text: "Taking an on-demand reading" }] },
      { _type: "block", _key: "reading", style: "normal", children: [{ _type: "span", text: "Go to Vitals in the bottom navigation, tap the metric you want to measure, follow on-screen instructions (stay still, keep device snug on your wrist), and wait 30–60 seconds." }] },
      { _type: "block", _key: "h-seek", style: "h2", children: [{ _type: "span", text: "When to seek medical advice" }] },
      { _type: "block", _key: "seek", style: "normal", children: [{ _type: "span", text: "Contact a healthcare provider if you notice: resting heart rate consistently above 100 bpm or below 40 bpm; SpO₂ consistently below 95%; sudden unexplained changes in your readings; or any reading accompanied by chest pain, dizziness, or shortness of breath." }] },
    ],
  },
  {
    id: "article-medication-reminders",
    title: "Setting Medication Reminders",
    slug: "medication-reminders",
    categoryTitle: "Using the Product",
    articleType: "how-to",
    tags: ["medication"],
    excerpt: "Never miss a dose. Set up medication reminders with custom schedules, dosage notes, and refill alerts.",
    readTimeMinutes: 3,
    clinicallyReviewed: true,
    body: [
      { _type: "callout", _key: "prescription-caveat", type: "warning", text: "Important: This app is a reminder tool only. Always follow your prescriber's exact instructions. If you have questions about your medication, dosage, or interactions, contact your doctor or pharmacist — do not rely on this app for clinical guidance. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease." },
      { _type: "block", _key: "h-add", style: "h2", children: [{ _type: "span", text: "Adding a medication" }] },
      { _type: "block", _key: "add", style: "normal", children: [{ _type: "span", text: "Go to Health → Medications and tap + Add medication. Enter the name (search or manual), dosage (e.g. 10 mg), frequency (once daily, twice daily, etc.), reminder time(s), and optional notes such as 'take with food'. Tap Save. You'll receive a push notification at each scheduled time." }] },
      { _type: "block", _key: "h-refill", style: "h2", children: [{ _type: "span", text: "Setting a refill reminder" }] },
      { _type: "block", _key: "refill", style: "normal", children: [{ _type: "span", text: "On the medication detail page, toggle on Refill reminder and enter your current supply quantity. The app alerts you when you have a 7-day supply remaining." }] },
      { _type: "block", _key: "h-log", style: "h2", children: [{ _type: "span", text: "Logging a dose" }] },
      { _type: "block", _key: "log", style: "normal", children: [{ _type: "span", text: "When you receive a reminder, tap Taken to log the dose or Skip to dismiss it. Your adherence history is recorded on the medication detail page." }] },
    ],
  },
  {
    id: "article-share-with-care-team",
    title: "Sharing Data with Your Care Team",
    slug: "share-with-care-team",
    categoryTitle: "Using the Product",
    articleType: "how-to",
    tags: ["prevention"],
    excerpt: "Share your health data securely with your doctor, specialist, or caregiver — with full control over what they can see.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Sharing gives someone a read-only view of a summary of your health metrics. They cannot edit your data or access your account. Shared data is encrypted in transit and at rest. Permissions can be revoked at any time." }] },
      { _type: "block", _key: "h-invite", style: "h2", children: [{ _type: "span", text: "Inviting a provider or caregiver" }] },
      { _type: "block", _key: "invite", style: "normal", children: [{ _type: "span", text: "Go to Settings → Sharing, tap Invite someone, enter their email, choose what they can see (Summary view or Full view), and tap Send invitation. They'll receive a secure link to set up a read-only access account." }] },
      { _type: "block", _key: "h-revoke", style: "h2", children: [{ _type: "span", text: "Revoking access" }] },
      { _type: "block", _key: "revoke", style: "normal", children: [{ _type: "span", text: "Go to Settings → Sharing, tap the person's name, tap Revoke access and confirm. Access is removed immediately." }] },
    ],
  },
  {
    id: "article-health-trends",
    title: "Interpreting Trends Over Time",
    slug: "health-trends",
    categoryTitle: "Using the Product",
    articleType: "explainer",
    tags: ["chronic condition", "prevention"],
    excerpt: "See how your health metrics change over days, weeks, and months — and understand what improving or declining trends mean.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    body: [
      { _type: "callout", _key: "wellness-caveat", type: "info", text: "Trend data is informational and for personal wellness tracking only. Discuss significant or sustained changes in your metrics with a qualified healthcare provider before drawing conclusions or changing your health routine. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease." },
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "A single data point is just a snapshot. Trends reveal the direction your health is moving over time. The app shows trends for all major metrics across three windows: 7 days, 30 days, and 90 days." }] },
      { _type: "block", _key: "h-positive", style: "h2", children: [{ _type: "span", text: "What a positive trend looks like" }] },
      { _type: "block", _key: "positive", style: "normal", children: [{ _type: "span", text: "Positive trends include: steps increasing week-over-week; resting heart rate gradually decreasing over months; sleep duration moving toward your target range; and weight tracking toward your goal at a healthy rate (0.5–1 kg per week)." }] },
      { _type: "block", _key: "h-concerning", style: "h2", children: [{ _type: "span", text: "Detecting concerning patterns" }] },
      { _type: "block", _key: "concerning", style: "normal", children: [{ _type: "span", text: "Pay attention to: a sustained upward trend in resting heart rate over 2+ weeks; sleep duration consistently below 6 hours; SpO₂ trending below 95%; or any metric showing a sudden sharp change. Discuss these patterns with a healthcare provider." }] },
      { _type: "block", _key: "h-export", style: "h2", children: [{ _type: "span", text: "Exporting your trend report" }] },
      { _type: "block", _key: "export", style: "normal", children: [{ _type: "span", text: "Open the metric's trend chart, tap the Share icon (top right), and choose Export as PDF or Share link. Bringing trend charts to appointments gives your provider weeks of data at a glance — far more context than a single in-office reading." }] },
    ],
  },

  // ── PRIVACY & SECURITY (Articles 12–14) ─────────────────────────────────
  {
    id: "article-data-protection",
    title: "How We Protect Your Health Data",
    slug: "data-protection",
    categoryTitle: "Privacy & Security",
    articleType: "explainer",
    tags: ["privacy", "security", "HIPAA"],
    excerpt: "Learn how HealthHelp protects your personal health information with encryption, access controls, and industry-standard security practices.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "Your health data is among the most sensitive personal information you have. HealthHelp is built with security-first principles to keep your data private, protected, and in your control." }] },
      { _type: "callout", _key: "data-notice", type: "info", text: "Data Notice: Information in this article reflects our current practices as of the date published. For the most up-to-date information, refer to our Privacy Policy and Terms of Service." },
      { _type: "block", _key: "h-encryption", style: "h2", children: [{ _type: "span", text: "Encryption at every step" }] },
      { _type: "block", _key: "encryption", style: "normal", children: [{ _type: "span", text: "All health data is protected by encryption: in transit using TLS 1.2 or higher; at rest using AES-256; and on your device using iOS Keychain or Android Keystore." }] },
      { _type: "block", _key: "h-access", style: "h2", children: [{ _type: "span", text: "Access controls" }] },
      { _type: "block", _key: "access", style: "normal", children: [{ _type: "span", text: "You are the only person who can see your full profile and health data by default. Care team members see only what you explicitly grant them. HealthHelp staff access individual records only for support or legal compliance. Third parties do not receive your personal health data without your consent, except as required by law." }] },
      { _type: "block", _key: "h-auth", style: "h2", children: [{ _type: "span", text: "Authentication and account security" }] },
      { _type: "block", _key: "auth", style: "normal", children: [{ _type: "span", text: "We require email verification on signup, support biometric login (Face ID, fingerprint), offer two-factor authentication in Settings > Security, and rate-limit failed login attempts." }] },
      { _type: "block", _key: "h-breach", style: "h2", children: [{ _type: "span", text: "Data breach response" }] },
      { _type: "block", _key: "breach", style: "normal", children: [{ _type: "span", text: "In the event of a security incident affecting your data, HealthHelp will notify affected users as required by applicable law (within 72 hours of discovery for GDPR; promptly under HIPAA), describe what data was involved, and provide guidance on protective actions." }] },
      { _type: "block", _key: "h-compliance", style: "h2", children: [{ _type: "span", text: "Certifications and compliance" }] },
      { _type: "block", _key: "compliance", style: "normal", children: [{ _type: "span", text: "HealthHelp undergoes regular third-party security audits and operates in compliance with applicable data protection laws, including HIPAA (for applicable health data) and GDPR (for EU users)." }] },
    ],
  },
  {
    id: "article-hipaa-explained",
    title: "HIPAA: What It Means for You",
    slug: "hipaa-explained",
    categoryTitle: "Privacy & Security",
    articleType: "explainer",
    tags: ["HIPAA", "privacy", "security"],
    excerpt: "Understand HIPAA and how it applies to your health data in HealthHelp. Learn your rights and how federal law protects your personal health information.",
    readTimeMinutes: 5,
    clinicallyReviewed: false,
    body: [
      { _type: "callout", _key: "legal-note", type: "info", text: "This article provides general educational information about HIPAA. It is not legal advice. For specific questions about your rights, consult a healthcare attorney or your state's health privacy office." },
      { _type: "block", _key: "h-what", style: "h2", children: [{ _type: "span", text: "What is HIPAA?" }] },
      { _type: "block", _key: "what", style: "normal", children: [{ _type: "span", text: "HIPAA stands for the Health Insurance Portability and Accountability Act, a US federal law enacted in 1996. The Privacy Rule establishes national standards for protecting individuals' medical records and other identifiable health information." }] },
      { _type: "block", _key: "h-who", style: "h2", children: [{ _type: "span", text: "Who does HIPAA cover?" }] },
      { _type: "block", _key: "who", style: "normal", children: [{ _type: "span", text: "HIPAA applies to covered entities (health plans, healthcare clearinghouses, and healthcare providers that transmit health information electronically) and their business associates. Health apps are not automatically covered by HIPAA — it depends on whether the app operates as a business associate of a covered healthcare provider." }] },
      { _type: "block", _key: "h-healthhelp", style: "h2", children: [{ _type: "span", text: "How HealthHelp handles HIPAA" }] },
      { _type: "block", _key: "healthhelp", style: "normal", children: [{ _type: "span", text: "HealthHelp implements the Administrative, Physical, and Technical Safeguards required by the HIPAA Security Rule. When care team sharing involves a covered healthcare provider, we operate under a Business Associate Agreement (BAA). We follow HIPAA's Minimum Necessary principle — only the data needed for the purpose is accessed or shared." }] },
      { _type: "block", _key: "h-rights", style: "h2", children: [{ _type: "span", text: "Your rights under HIPAA" }] },
      { _type: "block", _key: "rights", style: "normal", children: [{ _type: "span", text: "If HIPAA applies to your use of HealthHelp, you have the right to: access your health information (request a copy of your records); request corrections to inaccurate information; know who has accessed your data (request an accounting of disclosures); and file a complaint with the US Department of Health & Human Services (HHS) Office for Civil Rights." }] },
      { _type: "block", _key: "h-beyond", style: "h2", children: [{ _type: "span", text: "Beyond HIPAA: CCPA and GDPR" }] },
      { _type: "block", _key: "beyond", style: "normal", children: [{ _type: "span", text: "California residents have additional rights under CCPA. EU/UK residents have rights under GDPR including data access, portability, and erasure. See Managing Your Data and Privacy Settings for how to exercise these rights within HealthHelp." }] },
    ],
  },
  {
    id: "article-privacy-settings",
    title: "Managing Your Data and Privacy Settings",
    slug: "privacy-settings",
    categoryTitle: "Privacy & Security",
    articleType: "how-to",
    tags: ["privacy", "security"],
    excerpt: "Control how HealthHelp uses and shares your data. Step-by-step guide to privacy settings, data export, account deletion, and your privacy rights.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "callout", _key: "data-notice", type: "info", text: "This article reflects current practices as of the date published. For the most up-to-date policies, see our Privacy Policy and Terms of Service." },
      { _type: "block", _key: "h-settings", style: "h2", children: [{ _type: "span", text: "Privacy settings overview" }] },
      { _type: "block", _key: "settings", style: "normal", children: [{ _type: "span", text: "Access privacy settings via Profile → Settings → Privacy. From here control: notification permissions (turn off marketing emails), analytics opt-out (stop sharing anonymized usage data), care team access, and third-party connections." }] },
      { _type: "block", _key: "h-export", style: "h2", children: [{ _type: "span", text: "Exporting your data" }] },
      { _type: "block", _key: "export", style: "normal", children: [{ _type: "span", text: "Go to Profile > Settings > Privacy > Export My Data, select data types and date range, tap Request Export. You'll receive an email with a secure download link within 24 hours. The export includes a structured JSON file and a human-readable PDF summary." }] },
      { _type: "block", _key: "h-delete", style: "h2", children: [{ _type: "span", text: "Deleting your data" }] },
      { _type: "block", _key: "delete", style: "normal", children: [{ _type: "span", text: "To delete your account and all data: go to Profile > Settings > Privacy > Delete My Account, tap Delete Account and All Data, confirm with your password. Your data is permanently deleted within 30 days." }] },
      { _type: "callout", _key: "delete-warn", type: "warning", text: "Deletion is irreversible. Once confirmed, your health history, profile, and account cannot be recovered. Export your data first if you want a copy." },
      { _type: "block", _key: "h-rights", style: "h2", children: [{ _type: "span", text: "Your legal privacy rights" }] },
      { _type: "block", _key: "rights", style: "normal", children: [{ _type: "span", text: "All users: right to access (export data), right to correction (edit profile), right to deletion (delete account). GDPR/CCPA users: right to portability (export in machine-readable format) and right to opt out of data sale (Settings > Privacy > Do Not Sell My Data). Submit formal privacy requests at privacy@healthhelp.com." }] },
    ],
  },

  // ── TROUBLESHOOTING (Articles 15–17) ─────────────────────────────────────
  {
    id: "article-device-connection-issues",
    title: "Device Connection Issues",
    slug: "device-connection-issues",
    categoryTitle: "Troubleshooting",
    articleType: "how-to",
    tags: ["troubleshooting"],
    excerpt: "Fix device connection problems. Step-by-step troubleshooting for Bluetooth pairing failures, wearable sync errors, and compatibility issues.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "If your fitness tracker, smartwatch, or health device isn't connecting, these steps will help you diagnose and fix the issue." }] },
      { _type: "block", _key: "h-quick", style: "h2", children: [{ _type: "span", text: "Quick checks first" }] },
      { _type: "block", _key: "quick", style: "normal", children: [{ _type: "span", text: "Verify: Bluetooth is on, device is charged, phone and device are within 3 metres, companion app is up to date, and HealthHelp app is up to date." }] },
      { _type: "block", _key: "h-restart", style: "h2", children: [{ _type: "span", text: "Step 1: Restart both devices" }] },
      { _type: "block", _key: "restart", style: "normal", children: [{ _type: "span", text: "Turn your wearable off and back on. Then close and reopen HealthHelp on your phone. This clears temporary connection states." }] },
      { _type: "block", _key: "h-repair", style: "h2", children: [{ _type: "span", text: "Step 2: Remove and re-add the device" }] },
      { _type: "block", _key: "repair", style: "normal", children: [{ _type: "span", text: "Go to Settings > Connected Devices, tap the device and select Disconnect. On your wearable, remove the pairing. In your phone's Bluetooth settings, forget the device. Then re-pair from Settings > Connected Devices > Add Device." }] },
      { _type: "block", _key: "h-perms", style: "h2", children: [{ _type: "span", text: "Step 3: Check app permissions" }] },
      { _type: "block", _key: "perms", style: "normal", children: [{ _type: "span", text: "On iOS: Settings > Privacy & Security > Bluetooth — allow HealthHelp. On Android: Settings > Apps > HealthHelp > Permissions — enable Bluetooth, Location (required for Bluetooth scanning on Android), and Nearby Devices." }] },
      { _type: "callout", _key: "android-note", type: "info", text: "Android requires Location permission for Bluetooth device scanning, even if you're not sharing GPS data. This is an Android system requirement, not a HealthHelp choice." },
    ],
  },
  {
    id: "article-data-not-syncing",
    title: "Data Not Syncing",
    slug: "data-not-syncing",
    categoryTitle: "Troubleshooting",
    articleType: "how-to",
    tags: ["troubleshooting"],
    excerpt: "Fix health data sync issues. Common causes and step-by-step solutions for data that isn't updating, appearing, or importing correctly.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "intro", style: "normal", children: [{ _type: "span", text: "If your activity data, health metrics, or device readings aren't showing up or updating, here's how to fix it. Common causes: device hasn't synced recently, OS update changed permissions, or time zone change confused timestamps." }] },
      { _type: "block", _key: "h-sync", style: "h2", children: [{ _type: "span", text: "Step 1: Force a manual sync" }] },
      { _type: "block", _key: "sync", style: "normal", children: [{ _type: "span", text: "For a connected wearable: Settings > Connected Devices > tap device > Sync Now. For Apple Health/Google Health Connect: Settings > Connected Devices > tap the platform > Sync Now or Refresh Permissions." }] },
      { _type: "block", _key: "h-perms", style: "h2", children: [{ _type: "span", text: "Step 2: Check app permissions" }] },
      { _type: "block", _key: "perms", style: "normal", children: [{ _type: "span", text: "Data sync often breaks silently after an OS update. On iOS: Settings > Privacy & Security > Health > HealthHelp — verify all data types are set to Read. On Android: Settings > Apps > HealthHelp > Permissions and Google Health Connect > Apps > HealthHelp > verify all data types have Read access." }] },
      { _type: "block", _key: "h-background", style: "h2", children: [{ _type: "span", text: "Step 3: Check background app refresh" }] },
      { _type: "block", _key: "background", style: "normal", children: [{ _type: "span", text: "On iOS: Settings > HealthHelp > Background App Refresh — set to On. On Android: ensure HealthHelp is not in battery saver or sleep mode that prevents background activity." }] },
      { _type: "block", _key: "h-gaps", style: "h2", children: [{ _type: "span", text: "Step 4: Handle data gaps" }] },
      { _type: "block", _key: "gaps", style: "normal", children: [{ _type: "span", text: "If data is missing for a specific date, go to the metric detail view (e.g. Steps), navigate to the missing date, and tap + Add Entry to log manually. Manual entries are clearly marked as manually added." }] },
    ],
  },
  {
    id: "article-login-problems",
    title: "Account Access and Login Problems",
    slug: "login-problems",
    categoryTitle: "Troubleshooting",
    articleType: "how-to",
    tags: ["troubleshooting"],
    excerpt: "Can't log in? Fix forgotten passwords, two-factor authentication issues, account lockouts, and other login problems.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "h-forgot", style: "h2", children: [{ _type: "span", text: "Forgot your password" }] },
      { _type: "block", _key: "forgot", style: "normal", children: [{ _type: "span", text: "On the sign-in screen, tap Forgot password? Enter your account email, tap Send Reset Link. Check your inbox (and spam) for the reset email — the link is valid for 1 hour. Enter your new password and sign in." }] },
      { _type: "block", _key: "h-2fa", style: "h2", children: [{ _type: "span", text: "Two-factor authentication issues" }] },
      { _type: "block", _key: "2fa", style: "normal", children: [{ _type: "span", text: "If you can't access 2FA codes, use one of the backup codes from Settings > Security > Two-Factor Authentication > View Backup Codes. If codes aren't accepted, make sure your phone's time is set to automatic — authenticator apps rely on time sync." }] },
      { _type: "block", _key: "h-locked", style: "h2", children: [{ _type: "span", text: "Account locked" }] },
      { _type: "block", _key: "locked", style: "normal", children: [{ _type: "span", text: "After multiple failed login attempts, the account is temporarily locked for 15 minutes. After waiting, use Forgot password to reset credentials. If you didn't initiate the attempts, change your password immediately and review Settings > Security > Recent Activity." }] },
      { _type: "block", _key: "h-social", style: "h2", children: [{ _type: "span", text: "Signing in with Apple or Google" }] },
      { _type: "block", _key: "social", style: "normal", children: [{ _type: "span", text: "Tap Sign in with Apple or Sign in with Google on the login screen. Use the same account you used during registration. You cannot merge separate accounts after creation." }] },
    ],
  },

  // ── FAQ (Articles 18–20) ─────────────────────────────────────────────────
  {
    id: "article-account-billing-faq",
    title: "Account and Billing FAQ",
    slug: "account-billing-faq",
    categoryTitle: "FAQ",
    articleType: "faq",
    tags: [],
    excerpt: "Answers to the most common questions about your account, subscription plans, billing, and cancellation.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "h-change", style: "h2", children: [{ _type: "span", text: "How do I change my subscription plan?" }] },
      { _type: "block", _key: "change", style: "normal", children: [{ _type: "span", text: "Go to Settings → Subscription and tap Change plan. Changes take effect at the start of your next billing cycle — you won't lose access to your current plan's features until then." }] },
      { _type: "block", _key: "h-cancel", style: "h2", children: [{ _type: "span", text: "How do I cancel my subscription?" }] },
      { _type: "block", _key: "cancel", style: "normal", children: [{ _type: "span", text: "Go to Settings → Subscription → Cancel subscription and confirm. You'll keep access to paid features until the end of your current billing period. Your data is never deleted on cancellation." }] },
      { _type: "callout", _key: "cancel-note", type: "info", text: "If you subscribed through the Apple App Store or Google Play, cancel directly through those stores, not through the app." },
      { _type: "block", _key: "h-trial", style: "h2", children: [{ _type: "span", text: "Will I be charged during my free trial?" }] },
      { _type: "block", _key: "trial", style: "normal", children: [{ _type: "span", text: "No. You won't be charged until your trial ends. You'll receive a reminder email three days before expiry. Cancel before the trial ends and you won't be billed." }] },
      { _type: "block", _key: "h-delete", style: "h2", children: [{ _type: "span", text: "How do I delete my account?" }] },
      { _type: "block", _key: "deleteacct", style: "normal", children: [{ _type: "span", text: "Go to Settings → Account → Delete account and confirm. Deleting your account permanently removes all your health data within 30 days. Download your data first if you want to keep a copy." }] },
    ],
  },
  {
    id: "article-product-features-faq",
    title: "Product Features FAQ",
    slug: "product-features-faq",
    categoryTitle: "FAQ",
    articleType: "faq",
    tags: [],
    excerpt: "Quick answers to the most-asked questions about what the platform can and can't do.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "h-wearables", style: "h2", children: [{ _type: "span", text: "Which wearables are supported?" }] },
      { _type: "block", _key: "wearables", style: "normal", children: [{ _type: "span", text: "We currently support Apple Watch (Series 4+), Fitbit, Garmin, Google Pixel Watch, Withings, and Oura Ring. See Connecting Your Device or Wearable for pairing steps." }] },
      { _type: "block", _key: "h-offline", style: "h2", children: [{ _type: "span", text: "Does the app work offline?" }] },
      { _type: "block", _key: "offline", style: "normal", children: [{ _type: "span", text: "The app works offline for viewing recently synced data and logging new entries. Data syncs automatically when you reconnect. Live features like real-time heart rate monitoring require an internet connection." }] },
      { _type: "block", _key: "h-refresh", style: "h2", children: [{ _type: "span", text: "How often does my data refresh?" }] },
      { _type: "block", _key: "refresh", style: "normal", children: [{ _type: "span", text: "Data syncs every 15 minutes when the app is open, and once per hour in the background. Pull down on the dashboard to trigger a manual sync." }] },
      { _type: "block", _key: "h-doctor", style: "h2", children: [{ _type: "span", text: "Can my doctor access my data?" }] },
      { _type: "block", _key: "doctor", style: "normal", children: [{ _type: "span", text: "Only if you explicitly invite them. Go to Settings → Sharing → Invite provider, enter their email, and they'll receive a read-only invitation. You can revoke access at any time." }] },
      { _type: "block", _key: "h-export", style: "h2", children: [{ _type: "span", text: "Can I export my data?" }] },
      { _type: "block", _key: "export", style: "normal", children: [{ _type: "span", text: "Yes. Go to Settings → Privacy → Download my data. You'll receive an email with a downloadable CSV and JSON export within 24 hours." }] },
    ],
  },
  {
    id: "article-data-privacy-faq",
    title: "Data and Privacy FAQ",
    slug: "data-privacy-faq",
    categoryTitle: "FAQ",
    articleType: "faq",
    tags: ["privacy", "HIPAA", "security"],
    excerpt: "Everything you want to know about how your health data is collected, stored, used, and protected.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    body: [
      { _type: "block", _key: "h-sell", style: "h2", children: [{ _type: "span", text: "Does the app sell my health data?" }] },
      { _type: "block", _key: "sell", style: "normal", children: [{ _type: "span", text: "No. We never sell, rent, or trade your personal health data to third parties. Your data is used only to provide you with the service." }] },
      { _type: "block", _key: "h-who", style: "h2", children: [{ _type: "span", text: "Who can see my health information?" }] },
      { _type: "block", _key: "who", style: "normal", children: [{ _type: "span", text: "Only you — and anyone you explicitly invite through the sharing feature. Authorised staff may access individual records only when necessary for support or legal compliance, and only with proper controls in place." }] },
      { _type: "block", _key: "h-hipaa", style: "h2", children: [{ _type: "span", text: "Is the app HIPAA-compliant?" }] },
      { _type: "block", _key: "hipaa", style: "normal", children: [{ _type: "span", text: "HealthHelp implements the Administrative, Physical, and Technical Safeguards required by the HIPAA Security Rule when operating as a Business Associate of covered healthcare providers. When care team sharing involves a covered provider, we operate under a Business Associate Agreement (BAA). For a full explanation of how HIPAA applies to your data, see HIPAA: What It Means for You." }] },
      { _type: "block", _key: "h-retention", style: "h2", children: [{ _type: "span", text: "How long do you keep my data?" }] },
      { _type: "block", _key: "retention", style: "normal", children: [{ _type: "span", text: "We keep your health data for as long as your account is active. If you delete your account, your data is permanently removed within 30 days. Anonymised aggregate data with no personal identifiers may be retained for service improvement." }] },
      { _type: "block", _key: "h-delete", style: "h2", children: [{ _type: "span", text: "What happens to my data if I delete my account?" }] },
      { _type: "block", _key: "delete", style: "normal", children: [{ _type: "span", text: "Your personal data is permanently deleted within 30 days. You'll receive a confirmation email when deletion is complete. This is irreversible — download your data first if you want a record." }] },
      { _type: "block", _key: "h-analytics", style: "h2", children: [{ _type: "span", text: "Can I opt out of analytics?" }] },
      { _type: "block", _key: "analytics", style: "normal", children: [{ _type: "span", text: "Yes. Go to Settings → Privacy and toggle off Usage analytics. This stops us from collecting data about how you use the app. Data needed to run the service (syncing your metrics) cannot be disabled." }] },
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

  const results: Record<string, number> = { authors: 0, tags: 0, categories: 0, articles: 0, deleted: 0 };

  // Remove legacy placeholder articles
  for (const id of LEGACY_ARTICLE_IDS) {
    try {
      await sanity.delete(id);
      results.deleted++;
    } catch {
      // Article may not exist; ignore
    }
  }

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
  for (const tag of ALL_TAGS) {
    const slug = slugify(tag);
    const doc = await sanity.createOrReplace({ _type: "tag", _id: `tag-${slug}`, title: tag, slug: { current: slug } });
    tagIds[tag] = doc._id;
  }
  results.tags = ALL_TAGS.length;

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
  for (const art of ALL_ARTICLES) {
    const catId = categoryIds[art.categoryTitle];
    const tagRefs = art.tags.map((t) => tagIds[t]).filter(Boolean).map((id) => ({ _type: "reference" as const, _ref: id, _key: id }));
    await sanity.createOrReplace({
      _type: "article", _id: art.id,
      title: art.title, slug: { current: art.slug },
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
  results.articles = ALL_ARTICLES.length;

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
        attributesForFaceting: ["categoryTitle", "category", "articleType", "filterOnly(clinicallyReviewed)", "tags"],
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
