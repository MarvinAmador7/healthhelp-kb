import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s — HealthHelp",
    default: "HealthHelp — Patient Knowledge Base",
  },
  description:
    "Find answers to your health questions with our trusted, clinically reviewed knowledge base.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://project-sxpkl.vercel.app"
  ),
  openGraph: {
    type: "website",
    siteName: "HealthHelp",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <ChatWidget />
        <GoogleAnalyticsScript />
      </body>
    </html>
  );
}

function GoogleAnalyticsScript() {
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!gaId) return null;
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
        }}
      />
    </>
  );
}
