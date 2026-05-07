/**
 * Canonical 20 KB articles approved by the board (GLO-20).
 *
 * Drafts authored under GLO-5; clinical review (Articles 2, 4, 5, 6, 8, 9, 11)
 * signed off in GLO-7; legal review (Articles 12, 13, 20) signed off in GLO-8;
 * board approval received and CMS backfill executed via this seed.
 *
 * This module is the single source of truth for both the local
 * `scripts/seed.ts` runner and the production-callable `/api/seed` route.
 */

export type Block = { _type: string; _key: string; [k: string]: unknown };

function p(key: string, text: string): Block {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    children: [{ _type: "span", _key: `${key}-s`, text }],
    markDefs: [],
  };
}

function h(key: string, level: 2 | 3, text: string): Block {
  return {
    _type: "block",
    _key: key,
    style: `h${level}`,
    children: [{ _type: "span", _key: `${key}-s`, text }],
    markDefs: [],
  };
}

function callout(
  key: string,
  type: "info" | "warning" | "caution" | "success",
  text: string,
): Block {
  return { _type: "callout", _key: key, type, text };
}

export const CATEGORIES = [
  {
    title: "Getting Started",
    slug: "getting-started",
    icon: "🚀",
    order: 1,
    description: "Set up your account, profile, devices, and first goals.",
  },
  {
    title: "Using the Product",
    slug: "using-the-product",
    icon: "📱",
    order: 2,
    description:
      "Day-to-day features — metrics, activity, vitals, reminders, and trends.",
  },
  {
    title: "Privacy & Security",
    slug: "privacy-security",
    icon: "🔐",
    order: 3,
    description: "How we protect your health data and your rights as a user.",
  },
  {
    title: "Troubleshooting",
    slug: "troubleshooting",
    icon: "🛠️",
    order: 4,
    description: "Step-by-step fixes for connection, sync, and login problems.",
  },
  {
    title: "FAQ",
    slug: "faq",
    icon: "❓",
    order: 5,
    description: "Quick answers to the most common questions.",
  },
];

export const TAGS = [
  "account",
  "profile",
  "device",
  "wearable",
  "dashboard",
  "goals",
  "metrics",
  "activity",
  "vitals",
  "medication",
  "sharing",
  "trends",
  "privacy",
  "security",
  "hipaa",
  "troubleshooting",
  "billing",
  "faq",
];

export const SYSTEM_AUTHOR = {
  _id: "system-author",
  _type: "author" as const,
  name: "HealthHelp Editorial Team",
  slug: { current: "healthhelp-editorial-team" },
  bio: "Our clinical and editorial team reviews all articles for accuracy.",
  role: "Editorial Team",
};

export type ArticleSeed = {
  num: number;
  title: string;
  slug: string;
  category: string;
  articleType: "how-to" | "explainer" | "faq" | "reference";
  excerpt: string;
  seoDescription?: string;
  readTimeMinutes: number;
  clinicallyReviewed: boolean;
  tags: string[];
  body: Block[];
};

export const ARTICLES: ArticleSeed[] = [
  // ───────────────── Getting Started (1–5) ─────────────────
  {
    num: 1,
    title: "Creating your account",
    slug: "create-account",
    category: "getting-started",
    articleType: "how-to",
    excerpt:
      "Set up your HealthHelp account in under two minutes. Step-by-step guide to registration, email verification, and your first login.",
    seoDescription:
      "Create your HealthHelp account: registration, email verification, and your first login in under two minutes.",
    readTimeMinutes: 2,
    clinicallyReviewed: false,
    tags: ["account"],
    body: [
      p(
        "intro",
        "Creating your account is the first step to tracking your health in one place. You'll need an email address and a password — that's it.",
      ),
      h("h-step1", 2, "Step 1: Open the sign-up page"),
      p(
        "step1",
        "Open the HealthHelp app or visit our website and tap Sign up. You'll see a short registration form.",
      ),
      h("h-step2", 2, "Step 2: Fill in your details"),
      p(
        "step2",
        "Enter your email address (use a personal email rather than a work one), a password (at least 8 characters with one number and one symbol), and your date of birth (used to personalise your health ranges).",
      ),
      callout(
        "tip-personal-email",
        "info",
        "Use a personal email address rather than a work one. Health data is private, and personal email accounts are generally not monitored by employers.",
      ),
      h("h-step3", 2, "Step 3: Verify your email"),
      p(
        "step3",
        "Check your inbox for a verification email from HealthHelp. Tap Confirm email inside the message. If you don't see it within five minutes, check your spam folder or tap Resend verification email on the sign-up screen.",
      ),
      h("h-step4", 2, "Step 4: Log in for the first time"),
      p(
        "step4",
        "Once your email is confirmed, return to the app and log in. You'll be taken through a short setup flow to complete your health profile.",
      ),
      callout(
        "security-tip",
        "warning",
        "Never share your password with anyone, including support staff. The HealthHelp team will never ask for your password.",
      ),
      h("h-next", 2, "What's next?"),
      p(
        "next",
        "Now that your account is ready, set up your health profile so HealthHelp can personalise your metrics and goals.",
      ),
    ],
  },
  {
    num: 2,
    title: "Setting up your health profile",
    slug: "health-profile",
    category: "getting-started",
    articleType: "how-to",
    excerpt:
      "Complete your health profile so HealthHelp can personalise your metrics, goals, and recommendations.",
    seoDescription:
      "Complete your HealthHelp profile to personalise metrics, goals, and recommendations. Required and optional fields explained.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    tags: ["profile"],
    body: [
      p(
        "intro",
        "Your health profile tells HealthHelp your baseline — age, height, weight, and other key details. The more complete your profile, the more relevant your metrics and goal recommendations will be.",
      ),
      h("h-required", 2, "Required fields"),
      p(
        "required",
        "Four fields are needed to calculate core metrics like BMI, calorie burn estimates, and age-adjusted heart rate zones: date of birth, biological sex, height, and weight. If you prefer not to share your biological sex, you can select \"Prefer not to say\" — some metric ranges may be less precise as a result.",
      ),
      h("h-optional", 2, "Optional fields"),
      p(
        "optional",
        "Adding optional details makes your experience more personalised: health conditions (flags relevant content and adjusts certain metric ranges), medications (helps with reminders and interaction context), activity level (sets a starting baseline for daily step and calorie goals), and an emergency contact (used only if you enable the safety check-in feature).",
      ),
      callout(
        "health-note",
        "info",
        "Entering accurate baseline data improves the accuracy of your metrics. If you have questions about which conditions or medications to list, speak with your healthcare provider.",
      ),
      h("h-how", 2, "How to complete your profile"),
      p(
        "how",
        "Tap your profile icon in the top right corner, select Health profile, fill in the required fields and any optional fields you're comfortable sharing, then tap Save. You can edit your profile at any time — your metrics will update automatically.",
      ),
      callout(
        "med-disclaimer",
        "warning",
        "HealthHelp is a wellness tool, not a medical device, and is not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before making changes to your health routine or treatment plan.",
      ),
    ],
  },
  {
    num: 3,
    title: "Connecting your device or wearable",
    slug: "connect-device",
    category: "getting-started",
    articleType: "how-to",
    excerpt:
      "Connect your wearable to start automatic data syncing. Supports Apple Watch, Fitbit, Garmin, Pixel Watch, Withings, and Oura Ring.",
    seoDescription:
      "Connect a wearable to HealthHelp for automatic syncing — supported devices, iOS/Android setup, and manual entry option.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    tags: ["device", "wearable"],
    body: [
      p(
        "intro",
        "Connecting a wearable means your steps, heart rate, sleep, and other metrics flow into HealthHelp without you having to log anything manually. Most devices pair in under a minute.",
      ),
      h("h-supported", 2, "Supported devices"),
      p(
        "supported",
        "HealthHelp supports Apple Watch (Series 4 and later, via Apple Health), Fitbit (all models from 2018 onwards), Garmin (Forerunner, Fenix, Venu, and Vivoactive series), Google Pixel Watch (via Google Fit), Withings (ScanWatch, Body+ scales), and Oura Ring (Generation 3 and 4). Don't see your device? You can still log data manually or import from Apple Health or Google Fit.",
      ),
      h("h-ios", 2, "Connect on iOS (iPhone)"),
      p(
        "ios",
        "Open the app and go to Settings → Devices, tap Add device, select your device brand, and follow the on-screen pairing instructions. You may be redirected to your device's companion app to grant permissions. Return to HealthHelp and your data will begin syncing within a few minutes.",
      ),
      callout(
        "tip-bt",
        "info",
        "Make sure Bluetooth is enabled on your phone before starting, and keep the phone and device within 30 cm of each other during pairing.",
      ),
      h("h-android", 2, "Connect on Android"),
      p(
        "android",
        "Open the app, go to Settings → Devices, tap Add device, select your device brand, grant the requested permissions (location is required for Bluetooth scanning on Android — this does not track your location), and follow the on-screen pairing instructions.",
      ),
      h("h-manual", 2, "Manual data entry"),
      p(
        "manual",
        "No wearable? Go to the Log tab in the bottom navigation, tap the + button, choose the type of data to log, enter the details, and tap Save.",
      ),
      h("h-fail", 2, "Troubleshooting a failed connection"),
      p(
        "fail",
        "If pairing fails: turn Bluetooth off and back on, force-close and reopen the app, or forget the device in your phone's Bluetooth settings and restart the pairing process. Still stuck? See \"Sync issues and reconnecting your device\" in Troubleshooting.",
      ),
    ],
  },
  {
    num: 4,
    title: "Understanding your dashboard",
    slug: "dashboard-overview",
    category: "getting-started",
    articleType: "explainer",
    excerpt:
      "A tour of your health dashboard — what each metric card means and how to read your daily, weekly, and trend views.",
    seoDescription:
      "Tour of the HealthHelp dashboard: metric cards, date range selector, notifications panel, and how to customise your view.",
    readTimeMinutes: 3,
    clinicallyReviewed: true,
    tags: ["dashboard", "metrics"],
    body: [
      callout(
        "med-disclaimer",
        "warning",
        "Important: The metrics on your dashboard are for personal wellness tracking and are not a substitute for professional medical advice, diagnosis, or treatment. If you have concerns about any reading, speak with a qualified healthcare provider. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
      ),
      p(
        "intro",
        "The dashboard is the first thing you see when you open the app. It brings together your key health metrics in one place so you can see how you're doing today, this week, and over time.",
      ),
      h("h-cards", 2, "Metric cards"),
      p(
        "cards",
        "Each metric appears as a card. Tap any card to see a detailed view with history and trends. Cards include: Steps (daily count vs. your goal), Heart rate (current resting heart rate), Sleep (last night's duration and quality score), Activity (active minutes and calories burned today), Weight (most recent log), and Blood oxygen / SpO₂ (latest reading, device-dependent).",
      ),
      h("h-dates", 2, "Date range selector"),
      p(
        "dates",
        "Switch between Today (current day's data), Week (7-day rolling view with daily bars), Month (30-day trends), or Custom (any date range) using the selector at the top of the dashboard.",
      ),
      h("h-notifications", 2, "Notifications panel"),
      p(
        "notifications",
        "Tap the bell icon in the top right to see alerts — such as unusually high or low readings, medication reminders, and goal milestones.",
      ),
      h("h-customise", 2, "Customising your view"),
      p(
        "customise",
        "Tap the Edit (pencil) icon on the dashboard, drag cards to reorder them, toggle the switch on any card to hide it, then tap Done.",
      ),
    ],
  },
  {
    num: 5,
    title: "Setting your first health goals",
    slug: "set-health-goals",
    category: "getting-started",
    articleType: "how-to",
    excerpt:
      "Set personalised health goals — steps, sleep, heart rate — and let HealthHelp track your progress automatically.",
    seoDescription:
      "Set personalised goals in HealthHelp — steps, sleep, heart rate, weight — and track progress with milestones.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    tags: ["goals"],
    body: [
      callout(
        "med-disclaimer",
        "caution",
        "If you have a medical condition or are recovering from illness or surgery, consult your doctor before setting health targets — especially for heart rate, activity intensity, or weight. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
      ),
      p(
        "intro",
        "Tracking a metric without a target is like driving without a destination. Setting a goal gives HealthHelp something to measure your progress against and lets it celebrate milestones with you.",
      ),
      h("h-types", 2, "Available goal types"),
      p(
        "types",
        "Daily steps, active minutes, sleep duration, weight (with optional weekly milestone), resting heart rate (target range, e.g. below 65 bpm), and water intake.",
      ),
      h("h-set", 2, "Setting a goal"),
      p(
        "set",
        "Tap Goals in the bottom navigation (or go to Profile → My goals), tap + Add goal, choose a goal type, enter your target value, choose a timeframe (daily, weekly, or ongoing), and tap Save goal. Your new goal will appear on the dashboard as a progress ring or bar.",
      ),
      h("h-edit", 2, "Editing or pausing a goal"),
      p(
        "edit",
        "Go to Goals, tap the goal you want to change, then select Edit goal to change the target or Pause goal to suspend tracking temporarily. Pausing a goal removes it from your dashboard without deleting your history.",
      ),
      h("h-milestones", 2, "Celebrating milestones"),
      p(
        "milestones",
        "When you hit 7, 30, or 90 consecutive days of reaching a goal, the app sends you a milestone notification. These streaks are visible on your Goals page.",
      ),
    ],
  },

  // ───────────────── Using the Product (6–11) ─────────────────
  {
    num: 6,
    title: "Reading your health metrics — SpO₂ and HRV ranges",
    slug: "health-metrics",
    category: "using-the-product",
    articleType: "explainer",
    excerpt:
      "Understand each health metric on your dashboard — resting heart rate, blood oxygen (SpO₂), heart rate variability (HRV), sleep, and weight.",
    seoDescription:
      "Understand health metrics in HealthHelp: resting heart rate, SpO₂, HRV, sleep duration, and weight ranges explained.",
    readTimeMinutes: 5,
    clinicallyReviewed: true,
    tags: ["metrics", "vitals"],
    body: [
      callout(
        "med-disclaimer",
        "warning",
        "Important: The ranges below are general population averages. Your normal range may differ based on age, fitness level, medications, and health conditions. Always discuss unusual readings with your healthcare provider — do not use this app to self-diagnose. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
      ),
      h("h-rhr", 2, "Resting heart rate"),
      p(
        "rhr",
        "Your resting heart rate (RHR) is the number of times your heart beats per minute when you're at rest, best measured first thing in the morning. For athletes, 40–60 bpm is typical. For most adults, 60–100 bpm is normal. A rate consistently above 100 bpm is considered elevated. A consistently lower RHR generally indicates better cardiovascular fitness. A sudden increase may indicate stress, illness, or dehydration.",
      ),
      h("h-spo2", 2, "Blood oxygen (SpO₂)"),
      p(
        "spo2",
        "SpO₂ measures the percentage of oxygen in your blood. Normal SpO₂ for healthy adults is 95–100%.",
      ),
      callout(
        "spo2-warning",
        "warning",
        "An SpO₂ reading below 92% may indicate a medical issue. Seek medical attention promptly if you see a reading this low, especially if accompanied by shortness of breath, chest pain, or confusion.",
      ),
      h("h-hrv", 2, "Heart rate variability (HRV)"),
      p(
        "hrv",
        "HRV measures the variation in time between heartbeats. Higher HRV generally indicates better recovery and cardiovascular health. HRV is highly individual — track your personal trend rather than comparing to population averages. Age, fitness level, and overall health all influence your baseline HRV.",
      ),
      h("h-sleep", 2, "Sleep duration and quality"),
      p(
        "sleep",
        "Most adults need 7–9 hours of sleep per night. The quality score weighs consistency, deep sleep percentage, and interruptions.",
      ),
      h("h-weight", 2, "Weight"),
      p(
        "weight",
        "Weight is logged manually or synced from a connected scale. Use it to track trends over time, not as a daily judgement — weight naturally fluctuates by 1–3 kg throughout the day.",
      ),
    ],
  },
  {
    num: 7,
    title: "Tracking daily activity",
    slug: "track-activity",
    category: "using-the-product",
    articleType: "how-to",
    excerpt:
      "Track steps, workouts, and calories automatically or log activities manually. Keep your activity history in one place.",
    seoDescription:
      "Track steps, workouts, and calories automatically with a wearable or log manually in HealthHelp's Log tab.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    tags: ["activity"],
    body: [
      h("h-auto", 2, "Automatic tracking"),
      p(
        "auto",
        "If you've connected a wearable, steps, active minutes, and calories are tracked automatically throughout the day. The app syncs every 15 minutes when open and hourly in the background.",
      ),
      h("h-manual", 2, "Logging a workout manually"),
      p(
        "manual",
        "Tap the Log tab, tap + Log activity, choose your activity type (running, cycling, strength training, yoga, etc.), enter the duration and — if known — distance or calories, add an optional note, and tap Save. The logged workout appears in your activity history and contributes to your daily totals.",
      ),
      h("h-history", 2, "Activity history"),
      p(
        "history",
        "Tap History from the Log tab to see a chronological list of all logged and synced workouts. Tap any entry to see full details, edit it, or delete it.",
      ),
      h("h-summary", 2, "Weekly summary"),
      p(
        "summary",
        "Every Monday, the app sends a weekly summary notification with your total steps, active minutes, and most active day. View it any time in History → Weekly view.",
      ),
      h("h-sync", 2, "Syncing with Apple Health or Google Fit"),
      p(
        "sync",
        "Go to Settings → Connections, tap Apple Health or Google Fit, and grant the requested permissions to pull in activities logged in other apps.",
      ),
      callout(
        "tip-24h",
        "info",
        "Log activities within 24 hours for best accuracy. Retroactive entries are supported but affect streak calculations.",
      ),
    ],
  },
  {
    num: 8,
    title: "Monitoring vital signs",
    slug: "monitor-vitals",
    category: "using-the-product",
    articleType: "how-to",
    excerpt:
      "Monitor your heart rate, blood oxygen, and other vital signs in real time or on demand — and know when to seek medical care.",
    seoDescription:
      "Monitor heart rate, SpO₂, and HRV with your wearable in HealthHelp. Includes guidance on when to seek medical advice.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    tags: ["vitals"],
    body: [
      callout(
        "device-disclaimer",
        "warning",
        "Important: HealthHelp is a wellness tool, not a medical device. Readings from consumer wearables have a margin of error. Do not use them to diagnose or treat a medical condition. Always confirm abnormal readings with a clinician using a calibrated medical device. HealthHelp is not intended to diagnose, treat, cure, or prevent any disease.",
      ),
      h("h-supported", 2, "Supported vitals"),
      p(
        "supported",
        "The vitals available depend on your connected device. Heart rate (most wearables), blood oxygen / SpO₂ (Apple Watch Series 6+, Fitbit Sense/Versa 3+, Garmin Fenix 6+), resting heart rate (most wearables), heart rate variability (Apple Watch, Garmin, Oura Ring), and weight (Withings Body+ or manual log).",
      ),
      h("h-on-demand", 2, "Taking an on-demand reading"),
      p(
        "on-demand",
        "For heart rate and SpO₂: go to Vitals in the bottom navigation, tap the metric you want to measure, follow the on-screen instructions (stay still, keep the device snug on your wrist), and wait 30–60 seconds for the reading.",
      ),
      h("h-continuous", 2, "Continuous monitoring"),
      p(
        "continuous",
        "Some devices support continuous heart rate monitoring throughout the day. Enable it in Settings → Device → Continuous heart rate. Continuous monitoring increases battery drain.",
      ),
      h("h-history", 2, "Reading history"),
      p(
        "rdg-history",
        "Tap any vital to see a chart of your readings over time. Filter by day, week, or month.",
      ),
      h("h-seek", 2, "When to seek medical advice"),
      p(
        "seek",
        "Contact a healthcare provider if you notice: resting heart rate consistently above 100 bpm or below 40 bpm; SpO₂ consistently below 95%; sudden unexplained changes in your normal readings; or any reading accompanied by symptoms such as chest pain, dizziness, or shortness of breath.",
      ),
    ],
  },
  {
    num: 9,
    title: "Setting medication reminders",
    slug: "medication-reminders",
    category: "using-the-product",
    articleType: "how-to",
    excerpt:
      "Never miss a dose. Set up medication reminders with custom schedules, dosage notes, and refill alerts.",
    seoDescription:
      "Set medication reminders, refill alerts, and dose logging in HealthHelp. Reminder tool only — follow your prescriber.",
    readTimeMinutes: 3,
    clinicallyReviewed: true,
    tags: ["medication"],
    body: [
      callout(
        "prescription-caveat",
        "warning",
        "Important: This app is a reminder tool only. Always follow your prescriber's exact instructions. If you have questions about your medication, dosage, or interactions, contact your doctor or pharmacist — do not rely on this app for clinical guidance. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
      ),
      h("h-add", 2, "Adding a medication"),
      p(
        "add",
        "Go to Health → Medications, tap + Add medication, enter the medication name (search the database or enter manually), the dosage (e.g. 10 mg), the frequency (once daily, twice daily, every 8 hours, etc.), the time(s) for reminders, and any optional notes such as \"take with food\". Tap Save. You'll receive a push notification at each scheduled reminder time.",
      ),
      h("h-refill", 2, "Setting a refill reminder"),
      p(
        "refill",
        "On the medication detail page, toggle on Refill reminder and enter your current supply quantity. The app will alert you when you have a 7-day supply remaining.",
      ),
      h("h-log", 2, "Logging a dose"),
      p(
        "log",
        "When you receive a reminder, tap Taken to log the dose or Skip to dismiss it. Your adherence history is recorded on the medication detail page.",
      ),
      h("h-edit", 2, "Editing or removing a medication"),
      p(
        "edit",
        "Go to Health → Medications, tap the medication, then tap Edit to change details or Remove medication to delete it. Removing a medication deletes future reminders but keeps your logged dose history.",
      ),
    ],
  },
  {
    num: 10,
    title: "Sharing data with your care team",
    slug: "share-with-care-team",
    category: "using-the-product",
    articleType: "how-to",
    excerpt:
      "Share your health data securely with your doctor, specialist, or caregiver — with full control over what they can see.",
    seoDescription:
      "Share HealthHelp data securely with providers and caregivers. Read-only invites, granular permissions, revoke any time.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    tags: ["sharing", "privacy"],
    body: [
      h("h-how", 2, "How sharing works"),
      p(
        "how",
        "You control who sees your data. Sharing gives someone a read-only view of a summary of your health metrics — they cannot edit your data or access your account. Shared data is encrypted in transit and at rest. Sharing permissions can be revoked at any time.",
      ),
      h("h-invite", 2, "Inviting a provider or caregiver"),
      p(
        "invite",
        "Go to Settings → Sharing, tap Invite someone, enter their email address, choose what they can see (Summary view: daily metrics, goals, recent activity; or Full view: all metric history, medication log, trend charts), and tap Send invitation. They'll receive an email with a secure link to set up a read-only access account.",
      ),
      h("h-see", 2, "What they'll see"),
      p(
        "see",
        "The person you invite sees a dedicated view of your data, clearly labelled as read-only. They cannot see your account settings, billing details, or any data you haven't included in their permission level.",
      ),
      h("h-revoke", 2, "Revoking access"),
      p(
        "revoke",
        "Go to Settings → Sharing, tap the person's name, tap Revoke access, and confirm. Access is removed immediately. They'll see a message letting them know their access has ended.",
      ),
      h("h-clinical", 2, "Data included in clinical reports"),
      p(
        "clinical",
        "If your care team uses a supported clinical system, they may be able to request a structured data export. Contact our support team to find out if your provider's system is supported.",
      ),
    ],
  },
  {
    num: 11,
    title: "Interpreting trends over time",
    slug: "health-trends",
    category: "using-the-product",
    articleType: "explainer",
    excerpt:
      "See how your health metrics change over days, weeks, and months — and understand what improving or declining trends mean.",
    seoDescription:
      "Read 7-, 30-, and 90-day trends in HealthHelp. Spot positive trends, concerning patterns, and export reports for your doctor.",
    readTimeMinutes: 4,
    clinicallyReviewed: true,
    tags: ["trends", "metrics"],
    body: [
      callout(
        "wellness-caveat",
        "info",
        "Trend data is informational and for personal wellness tracking only. Discuss significant or sustained changes in your metrics with a qualified healthcare provider before drawing conclusions or changing your health routine. HealthHelp is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.",
      ),
      p(
        "intro",
        "A single data point is just a snapshot. Trends reveal the direction your health is moving over time — which is far more useful for understanding your wellbeing. The app shows trends for all major metrics across three time windows: 7 days, 30 days, and 90 days.",
      ),
      h("h-chart", 2, "Reading a trend chart"),
      p(
        "chart",
        "Trend charts show a line graph of your metric over time, with a trend line (a smoothed average that filters out day-to-day variation), goal markers (horizontal lines showing your targets), and annotation points (notable events such as a new device connected or a goal changed). A rising trend line for steps or sleep is generally positive; a rising trend for resting heart rate warrants attention.",
      ),
      h("h-positive", 2, "What a positive trend looks like"),
      p(
        "positive",
        "Positive trends include: steps increasing week-over-week; resting heart rate gradually decreasing over months; sleep duration moving toward your target range; and weight tracking toward your goal at a healthy rate (0.5–1 kg per week).",
      ),
      h("h-concerning", 2, "Detecting concerning patterns"),
      p(
        "concerning",
        "Pay attention to: a sustained upward trend in resting heart rate over 2 or more weeks; sleep duration consistently below 6 hours; SpO₂ trending below 95%; or any metric showing a sudden sharp change with no obvious explanation (new device, illness, travel). If you notice these patterns, discuss them with a healthcare provider.",
      ),
      h("h-export", 2, "Exporting your trend report"),
      p(
        "export",
        "Open the metric's trend chart, tap the Share icon (top right), and choose Export as PDF or Share link. Bringing trend charts to appointments gives your provider weeks or months of data at a glance — far more context than a single in-office reading.",
      ),
    ],
  },

  // ───────────────── Privacy & Security (12–14) — legal-approved ─────────────────
  {
    num: 12,
    title: "How we protect your health data",
    slug: "data-protection",
    category: "privacy-security",
    articleType: "explainer",
    excerpt:
      "Learn how HealthHelp protects your personal health information with encryption, access controls, and industry-standard security practices.",
    seoDescription:
      "How HealthHelp protects your data: TLS 1.2+ in transit, AES-256 at rest, access controls, breach notification, and HIPAA support.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    tags: ["privacy", "security", "hipaa"],
    body: [
      callout(
        "data-notice",
        "info",
        "Information in this article reflects our current practices as of the date published. For the most up-to-date information, see our Privacy Policy and Terms of Service.",
      ),
      p(
        "intro",
        "Your health data is among the most sensitive personal information you have. HealthHelp is built with security-first principles to keep your data private, protected, and in your control.",
      ),
      h("h-enc", 2, "Encryption at every step"),
      p(
        "enc",
        "All health data you enter or sync in HealthHelp is protected by encryption. In transit: data moving between your device and our servers is encrypted with TLS 1.2 or higher — the same protocol used by banks and government websites. At rest: data stored on our servers is encrypted using AES-256, an industry-standard algorithm. On your device: sensitive data stored locally is protected using your device's secure storage (iOS Keychain or Android Keystore).",
      ),
      h("h-access", 2, "Access controls"),
      p(
        "access",
        "You are the only person who can see your full profile and health data by default. Care team members only see data types you explicitly grant them access to. HealthHelp staff can access your data only for support, security, or legal purposes, and are bound by confidentiality agreements. Third parties do not receive your personal health data without your explicit consent, except as required by law.",
      ),
      h("h-auth", 2, "Authentication and account security"),
      p(
        "auth",
        "We require email verification when you create your account, support biometric login (Face ID, fingerprint) to reduce password exposure, and offer two-factor authentication (2FA) in Settings → Security — we strongly recommend enabling it. Failed login attempts are rate-limited to prevent brute-force attacks.",
      ),
      callout(
        "tip-2fa",
        "info",
        "Enable two-factor authentication for an extra layer of protection. Go to Settings → Security → Two-Factor Authentication.",
      ),
      h("h-breach", 2, "Data breach response"),
      p(
        "breach",
        "In the unlikely event of a security incident affecting your data, HealthHelp will notify affected users as required by applicable law (within 60 days under HIPAA's Breach Notification Rule, and typically within 72 hours of discovery for GDPR), describe what data was involved and the steps we've taken, and provide guidance on any protective actions you should take.",
      ),
      h("h-compliance", 2, "Certifications and compliance"),
      p(
        "compliance",
        "HealthHelp undergoes regular third-party security audits and operates in compliance with applicable data protection laws, including HIPAA (for applicable health data) and GDPR (for EU users). When HealthHelp acts as a Business Associate of a covered healthcare provider, we operate under a signed Business Associate Agreement (BAA). See our HIPAA article for details.",
      ),
      h("h-checklist", 2, "Your security checklist"),
      p(
        "checklist",
        "Enable two-factor authentication. Use a unique, strong password for your HealthHelp account. Review your care team access list regularly (Settings → Care Team). Revoke access for any care team members who no longer need it. Log out of shared or public devices after use.",
      ),
    ],
  },
  {
    num: 13,
    title: "HIPAA — what it means for you",
    slug: "hipaa-explained",
    category: "privacy-security",
    articleType: "explainer",
    excerpt:
      "A plain-English guide to HIPAA and how it applies to your health data when you use HealthHelp. Learn your rights and how federal law protects your information.",
    seoDescription:
      "Plain-English HIPAA guide for HealthHelp users: covered entities, BAAs, your rights, and what HIPAA does and does not cover.",
    readTimeMinutes: 5,
    clinicallyReviewed: false,
    tags: ["hipaa", "privacy"],
    body: [
      callout(
        "data-notice",
        "info",
        "This article provides general educational information about HIPAA. It is not legal advice. For specific questions about your rights, consult a healthcare attorney or your state's health privacy office.",
      ),
      p(
        "intro",
        "You've probably heard the term HIPAA, but what does it actually mean for you as a HealthHelp user? This article explains the basics of HIPAA in plain language and how it applies to your health data.",
      ),
      h("h-what", 2, "What is HIPAA?"),
      p(
        "what",
        "HIPAA stands for the Health Insurance Portability and Accountability Act, a US federal law enacted in 1996. The Privacy Rule under HIPAA establishes national standards for protecting individuals' medical records and other identifiable health information.",
      ),
      h("h-who", 2, "Who does HIPAA cover?"),
      p(
        "who",
        "HIPAA applies to covered entities and their business associates. Covered entities include health plans (insurance companies), healthcare clearinghouses, and healthcare providers that transmit health information electronically. Health apps are not automatically covered by HIPAA. Whether HIPAA applies to HealthHelp depends on the context in which it's used — specifically, whether it's operating as a business associate of a covered healthcare provider.",
      ),
      h("h-how", 2, "How HealthHelp handles HIPAA"),
      p(
        "how",
        "HealthHelp is designed to support HIPAA compliance when used in conjunction with healthcare providers who are covered entities. When care team sharing involves a covered healthcare provider, we operate under a Business Associate Agreement (BAA). We implement the Administrative, Physical, and Technical Safeguards required by the HIPAA Security Rule, and we follow HIPAA's Minimum Necessary principle — only the data needed for the purpose is accessed or shared.",
      ),
      h("h-rights", 2, "Your rights under HIPAA"),
      p(
        "rights",
        "If HIPAA applies to your use of HealthHelp, you have the right to access your health information (request a copy of your records), request corrections (ask that inaccurate information be corrected), know who has accessed your data (request an accounting of disclosures), restrict certain uses and disclosures, receive our Notice of Privacy Practices, and file a complaint with the US Department of Health & Human Services (HHS) Office for Civil Rights.",
      ),
      h("h-not", 2, "What HIPAA does NOT cover"),
      p(
        "not",
        "HIPAA does not cover health data you enter voluntarily into a consumer wellness app without a provider relationship, health information shared with employers, life insurers, or schools, or de-identified data (where individual identity has been removed). For consumer wellness data, HealthHelp provides protections through our Privacy Policy, which applies regardless of HIPAA status.",
      ),
      h("h-beyond", 2, "Beyond HIPAA: CCPA and GDPR"),
      p(
        "beyond",
        "If you are a California resident, the California Consumer Privacy Act (CCPA) gives you additional rights over your personal data. If you are an EU/UK resident, the General Data Protection Regulation (GDPR) applies and gives you rights including data access, portability, and erasure. See \"Managing your data and privacy settings\" for how to exercise these rights within HealthHelp.",
      ),
      h("h-exercise", 2, "How to exercise your rights"),
      p(
        "exercise",
        "To access, correct, or request deletion of your health information, go to Settings → Privacy or contact our privacy team. To file a HIPAA complaint, contact the HHS Office for Civil Rights at hhs.gov/ocr.",
      ),
      h("h-npp", 2, "Our Notice of Privacy Practices"),
      p(
        "npp",
        "Our full Notice of Privacy Practices (NPP) is available from your account at Settings → Privacy → Notice of Privacy Practices. It describes in detail how HealthHelp may use and disclose your protected health information, and your individual rights.",
      ),
    ],
  },
  {
    num: 14,
    title: "Two-factor authentication setup",
    slug: "two-factor-auth",
    category: "privacy-security",
    articleType: "how-to",
    excerpt:
      "Add a second layer of protection to your HealthHelp account. Step-by-step guide to enabling 2FA, saving backup codes, and recovering access.",
    seoDescription:
      "Enable two-factor authentication in HealthHelp using authenticator apps or SMS. Save backup codes and protect your account.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    tags: ["security", "account"],
    body: [
      p(
        "intro",
        "Two-factor authentication (2FA) adds a second step to logging in — your password plus a one-time code. Even if your password is compromised, an attacker can't get into your account without that second factor. We strongly recommend enabling 2FA for any account that holds health data.",
      ),
      h("h-which", 2, "Which 2FA method should I use?"),
      p(
        "which",
        "HealthHelp supports two methods. Authenticator app (recommended): apps such as 1Password, Authy, Google Authenticator, or Microsoft Authenticator generate a 6-digit code that refreshes every 30 seconds — works without cellular signal and is harder for attackers to intercept. SMS: a code is texted to your registered phone number — easier to set up but less secure than an authenticator app, since SMS can be intercepted via SIM-swap attacks.",
      ),
      h("h-enable-app", 2, "Enable an authenticator app"),
      p(
        "enable-app",
        "Go to Settings → Security → Two-Factor Authentication, tap Enable authenticator app, and use your authenticator to scan the QR code (or paste the secret manually). Enter the 6-digit code your app shows to confirm setup, then save your 8-digit backup codes somewhere secure — they're the only way back into your account if you lose your authenticator.",
      ),
      h("h-enable-sms", 2, "Enable SMS"),
      p(
        "enable-sms",
        "Go to Settings → Security → Two-Factor Authentication, tap Enable SMS, enter your phone number, and confirm the 6-digit code we send you. Make sure the number on file stays current — if you lose access to it, recovery requires support verification.",
      ),
      callout(
        "tip-backup",
        "info",
        "Store your backup codes in a password manager or printed in a safe place. If you ever lose access to your authenticator app or phone number, backup codes are the fastest way back in.",
      ),
      h("h-recovery", 2, "Lost access to your second factor?"),
      p(
        "recovery",
        "Use a backup code from the 2FA login screen — tap Use a backup code and enter one of your 8-digit codes. If you don't have backup codes, contact our support team; we'll guide you through identity-verified account recovery. See \"Account and subscription management\" for full recovery steps.",
      ),
      h("h-disable", 2, "Disabling 2FA"),
      p(
        "disable",
        "We recommend keeping 2FA on. If you must turn it off, go to Settings → Security → Two-Factor Authentication and tap Disable. You'll be asked to confirm with your password and a current 2FA code.",
      ),
    ],
  },

  // ───────────────── Troubleshooting (15–19) ─────────────────
  {
    num: 15,
    title: "Sync issues and reconnecting your device",
    slug: "device-connection",
    category: "troubleshooting",
    articleType: "how-to",
    excerpt:
      "Wearable not syncing? Step-by-step troubleshooting for Bluetooth pairing, sync errors, and device compatibility issues.",
    seoDescription:
      "Fix wearable connection problems in HealthHelp: Bluetooth, permissions, firmware, re-pairing, and compatibility checks.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    tags: ["troubleshooting", "device"],
    body: [
      h("h-basics", 2, "Start with the basics"),
      p(
        "basics",
        "Most connection issues are solved by one of these quick checks: confirm Bluetooth is on in your phone's Settings; make sure the device is charged (low battery may disconnect unexpectedly); keep the phone and wearable within 30 cm during troubleshooting; ensure the companion app (Fitbit, Garmin, etc.) is up to date; and verify HealthHelp itself is up to date in the App Store or Google Play.",
      ),
      h("h-step1", 2, "Step 1: Force-quit and reopen the app"),
      p(
        "step1",
        "On iPhone, swipe up from the bottom and swipe HealthHelp away. On Android, use Recent Apps and swipe it away. Reopen the app and check if the device reconnects.",
      ),
      h("h-step2", 2, "Step 2: Toggle Bluetooth off and back on"),
      p(
        "step2",
        "Go to Settings → Bluetooth, toggle it off, wait 5 seconds, and toggle it back on. Then open HealthHelp and see if your device appears.",
      ),
      h("h-step3", 2, "Step 3: Forget and re-pair the device"),
      p(
        "step3",
        "On your phone, go to Settings → Bluetooth, tap (i) next to your device, and tap Forget this device. In HealthHelp, go to Settings → Devices, tap your device, and tap Remove device. Then follow the pairing steps in \"Connecting your device or wearable\" to re-add it.",
      ),
      h("h-step4", 2, "Step 4: Check device firmware"),
      p(
        "step4",
        "An outdated firmware version on your wearable can cause connection issues. Open your device's companion app and check for a firmware update.",
      ),
      h("h-step5", 2, "Step 5: Check app permissions"),
      p(
        "step5",
        "On iOS, go to Settings → Privacy & Security → Bluetooth and confirm HealthHelp is allowed. On Android, go to Settings → Apps → HealthHelp → Permissions and ensure Bluetooth, Location (required for Bluetooth scanning), and Nearby Devices are all allowed.",
      ),
      callout(
        "android-loc",
        "info",
        "Android requires Location permission for Bluetooth device scanning, even if you're not sharing GPS data. This is an Android system requirement, not a HealthHelp choice.",
      ),
      h("h-step6", 2, "Step 6: Restart both devices"),
      p(
        "step6",
        "Restart your phone and your wearable, then try pairing again.",
      ),
      h("h-help", 2, "Still not working?"),
      p(
        "help",
        "Contact our support team via Help → Contact Support and include your device make and model, your phone model and OS version, and a description of what happens when you try to pair.",
      ),
    ],
  },
  {
    num: 16,
    title: "Notification settings",
    slug: "notification-settings",
    category: "troubleshooting",
    articleType: "how-to",
    excerpt:
      "Manage which alerts HealthHelp sends — medication reminders, goal milestones, sync alerts — and how they appear on your phone.",
    seoDescription:
      "Customise HealthHelp notifications — reminder, goal, and alert categories — across iOS and Android, and turn off marketing emails.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    tags: ["troubleshooting", "account"],
    body: [
      h("h-overview", 2, "What HealthHelp can notify you about"),
      p(
        "overview",
        "HealthHelp uses notifications for medication reminders, goal milestones, weekly summaries, sync alerts (when a wearable disconnects or fails to sync), unusual readings (when an enabled metric falls outside your normal range), and care team updates (when someone with shared access leaves a comment). You can enable or disable each category independently.",
      ),
      h("h-in-app", 2, "Adjust notification categories in HealthHelp"),
      p(
        "in-app",
        "Open the app, go to Settings → Notifications, and toggle any category on or off. For medication reminders, you can also set quiet hours so reminders don't fire overnight.",
      ),
      h("h-system-ios", 2, "iOS system settings"),
      p(
        "system-ios",
        "Go to iPhone Settings → Notifications → HealthHelp. From here you can choose Lock Screen / Notification Center / Banners, set the alert sound, group notifications, and pick whether previews show. If you've turned notifications off entirely at the system level, none of the in-app toggles will work — re-enable them here first.",
      ),
      h("h-system-android", 2, "Android system settings"),
      p(
        "system-android",
        "Go to Settings → Apps → HealthHelp → Notifications. You can toggle individual notification channels (e.g. Medication, Goals, Sync) and adjust importance, sound, and vibration per channel.",
      ),
      h("h-email", 2, "Email and marketing notifications"),
      p(
        "email",
        "To unsubscribe from marketing emails, tap the unsubscribe link at the bottom of any HealthHelp marketing email, or go to Settings → Notifications → Email and toggle Marketing emails off. Account-related emails (verification, password resets, billing) cannot be turned off — they're required for account security.",
      ),
      h("h-not-receiving", 2, "Not receiving notifications?"),
      p(
        "not-receiving",
        "Check that notifications are enabled in both HealthHelp's Settings → Notifications and your phone's system settings, that Do Not Disturb / Focus mode is off, that battery optimization isn't blocking background activity (Android), and that you have a working internet connection.",
      ),
    ],
  },
  {
    num: 17,
    title: "Account and subscription management",
    slug: "account-management",
    category: "troubleshooting",
    articleType: "how-to",
    excerpt:
      "Reset a forgotten password, recover from 2FA issues, unlock your account, and manage subscription changes.",
    seoDescription:
      "Reset password, fix 2FA, unlock locked accounts, and manage your HealthHelp subscription — step-by-step recovery.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    tags: ["account", "security"],
    body: [
      h("h-forgot", 2, "Forgotten password"),
      p(
        "forgot",
        "On the login screen, tap Forgot password?, enter your email address, and tap Send reset link. Check your inbox (and spam folder) for a reset email. Click the link in the email and follow the steps to set a new password. Reset links expire after 30 minutes — request a new one from the login screen if yours has expired.",
      ),
      h("h-2fa", 2, "Two-factor authentication (2FA) issues"),
      p(
        "2fa",
        "If you set up 2FA with an authenticator app and no longer have access to it, on the 2FA screen tap Use a backup code and enter one of the 8-digit backup codes you saved when you set up 2FA. If your phone has signal but you didn't receive the SMS code, tap Resend code and wait up to 60 seconds. If your phone number has changed, contact support to update it before regaining access.",
      ),
      callout(
        "tip-backup",
        "info",
        "Store your 2FA backup codes in a secure place (such as a password manager) when you first enable 2FA — they're the only way back into your account if you lose your authenticator.",
      ),
      h("h-locked", 2, "Account locked after failed attempts"),
      p(
        "locked",
        "Your account is temporarily locked after 10 failed login attempts to protect against unauthorised access. Wait 30 minutes and try again, or use the Forgot password? link to reset your credentials and unlock immediately.",
      ),
      h("h-unrecognised", 2, "Email address not recognised"),
      p(
        "unrecognised",
        "If the system doesn't recognise your email, check you're using the exact address you signed up with (look for typos or alternative addresses you may have used). If you signed up via Apple Sign-In or Google Sign-In, you may have a different email associated — try those. Still can't find your account? Contact support with any alternative emails you may have used.",
      ),
      h("h-suspicious", 2, "Suspicious activity on your account"),
      p(
        "suspicious",
        "If you believe someone has accessed your account without permission, change your password immediately using Forgot password?, go to Settings → Security → Active sessions and tap Sign out of all devices, then contact our support team to report the incident.",
      ),
      h("h-subscription", 2, "Subscription changes"),
      p(
        "subscription",
        "To change, pause, or cancel your subscription, go to Settings → Subscription. Plan changes take effect at the start of your next billing cycle — you keep your current plan's features until then. To cancel, go to Settings → Subscription → Cancel subscription and confirm. Your data is never deleted on cancellation. If you subscribed through the Apple App Store or Google Play, cancel directly through those stores.",
      ),
    ],
  },
  {
    num: 18,
    title: "Exporting your data",
    slug: "export-data",
    category: "troubleshooting",
    articleType: "how-to",
    excerpt:
      "Export your full health history as CSV, JSON, or PDF — and learn what's included in each format.",
    seoDescription:
      "Export your HealthHelp history as CSV, JSON, or PDF. What's included, how long requests take, and how to share with your provider.",
    readTimeMinutes: 3,
    clinicallyReviewed: false,
    tags: ["privacy", "account"],
    body: [
      h("h-when", 2, "When to export your data"),
      p(
        "when",
        "Common reasons to export include: bringing your full health history to a provider visit; switching to a new app or device; archiving your records before deleting your account; or exercising your data portability rights under GDPR or CCPA.",
      ),
      h("h-how", 2, "Requesting an export"),
      p(
        "how",
        "Go to Settings → Privacy → Download my data, choose the data types you want included (metrics, activities, medications, sharing history, account info), choose a date range (default: all time), select the formats you want (CSV, JSON, PDF, or all three), and tap Request export. You'll receive an email with a secure download link, usually within 24 hours.",
      ),
      h("h-formats", 2, "What each format includes"),
      p(
        "formats",
        "CSV: one file per data type (e.g. steps.csv, sleep.csv) — easy to open in a spreadsheet. JSON: a single structured file containing all data — best for transferring to another app. PDF: a human-readable summary report with charts and tables — good for sharing with a clinician.",
      ),
      h("h-share", 2, "Sharing your export with a provider"),
      p(
        "share",
        "The PDF summary is designed for clinical review. To share it directly without leaving the app, request the export in PDF format and use your phone's standard share sheet to send it via secure messaging or email.",
      ),
      h("h-retention", 2, "Download retention"),
      p(
        "retention",
        "Download links expire after 7 days. After that, you'll need to request a fresh export. Files are encrypted in transit, and we recommend storing them in a secure location (encrypted cloud drive or password-protected archive).",
      ),
    ],
  },
  {
    num: 19,
    title: "Contacting support",
    slug: "contact-support",
    category: "troubleshooting",
    articleType: "how-to",
    excerpt:
      "How to reach the HealthHelp support team — what info to include, expected response times, and self-service options first.",
    seoDescription:
      "Contact HealthHelp support — channels, response times, and what details to include for faster resolution.",
    readTimeMinutes: 2,
    clinicallyReviewed: false,
    tags: ["account", "troubleshooting"],
    body: [
      h("h-self", 2, "Try self-service first"),
      p(
        "self",
        "Most issues are resolved fastest from this knowledge base. Search for your problem in the Help section, or browse the Troubleshooting category for step-by-step fixes for common issues such as device connections, sync, and login problems.",
      ),
      h("h-channels", 2, "How to contact us"),
      p(
        "channels",
        "From the app: tap Profile → Help → Contact support to open a support conversation in-app. By email: write to support@example-health.com from the email address tied to your account so we can verify your identity quickly. From the website: visit help.example-health.com and use the Contact form.",
      ),
      h("h-include", 2, "What to include"),
      p(
        "include",
        "Help us help you faster by including: a clear description of the problem and what you've already tried; the name and version of HealthHelp (Settings → About); your phone model and OS version; if relevant, your wearable's model and firmware version; the approximate date and time the issue began; screenshots or screen recordings if applicable. Do not include passwords or backup codes.",
      ),
      h("h-times", 2, "Response times"),
      p(
        "times",
        "Standard support: within one business day. Priority support (paid plans): within 4 hours during business hours. Account security or data privacy issues are escalated and answered within 1 hour.",
      ),
      callout(
        "tip-emergency",
        "warning",
        "HealthHelp support is for product help only. If you're experiencing a medical emergency, call your local emergency number or go to the nearest emergency department.",
      ),
    ],
  },

  // ───────────────── FAQ (Article 20 — legally approved) ─────────────────
  {
    num: 20,
    title: "Data and privacy FAQ",
    slug: "data-privacy",
    category: "faq",
    articleType: "faq",
    excerpt:
      "Quick answers to the most-asked questions about how HealthHelp collects, stores, uses, and protects your health data.",
    seoDescription:
      "FAQ on HealthHelp data privacy — selling, access, HIPAA, retention, exports, deletion, and analytics opt-out.",
    readTimeMinutes: 4,
    clinicallyReviewed: false,
    tags: ["privacy", "hipaa", "faq"],
    body: [
      h("h-sell", 2, "Does HealthHelp sell my health data?"),
      p(
        "sell",
        "No. HealthHelp never sells, rents, or trades your personal health data to third parties. Your data is used only to provide you with the service. See our Privacy Policy for full details.",
      ),
      h("h-see", 2, "Who can see my health information?"),
      p(
        "see",
        "Only you — and anyone you explicitly invite through the sharing feature. Authorised HealthHelp staff may access individual records only when necessary for support, security, or legal compliance, and only with proper controls in place.",
      ),
      h("h-hipaa", 2, "Is HealthHelp HIPAA-compliant?"),
      p(
        "hipaa-1",
        "HealthHelp is designed to support HIPAA compliance and operates as a Business Associate under a signed Business Associate Agreement (BAA) when you use the platform with a covered healthcare provider — for example, when you share data with a provider through the care team feature.",
      ),
      p(
        "hipaa-2",
        "When you use HealthHelp on your own as a consumer wellness app — without a provider relationship — HIPAA does not automatically apply. In that case, your data is still protected by our Privacy Policy and applicable consumer privacy laws (such as CCPA in California or GDPR in the EU and UK), and we apply the same Administrative, Physical, and Technical Safeguards from the HIPAA Security Rule across the platform.",
      ),
      p(
        "hipaa-3",
        "For details on covered entities, business associates, and your individual rights, see \"HIPAA — what it means for you\". For our full Notice of Privacy Practices, go to Settings → Privacy → Notice of Privacy Practices.",
      ),
      h("h-retention", 2, "How long do you keep my data?"),
      p(
        "retention",
        "We keep your health data for as long as your account is active. If you delete your account, your data is permanently removed within 30 days. Anonymised aggregate data with no personal identifiers may be retained for service improvement.",
      ),
      h("h-download", 2, "Can I download all my data?"),
      p(
        "download",
        "Yes. Go to Settings → Privacy → Download my data and you'll receive an email with your complete data export (CSV, JSON, and PDF) within 24 hours.",
      ),
      h("h-delete", 2, "What happens to my data if I delete my account?"),
      p(
        "delete",
        "Your personal data is permanently deleted within 30 days. You'll receive a confirmation email when deletion is complete. This is irreversible — download your data first if you want to keep a record.",
      ),
      h("h-analytics", 2, "Can I opt out of analytics?"),
      p(
        "analytics",
        "Yes. Go to Settings → Privacy and toggle off Usage analytics. This stops us from collecting data about how you use the app. Note: the data needed to actually run the service (syncing your metrics) cannot be disabled.",
      ),
    ],
  },
];
