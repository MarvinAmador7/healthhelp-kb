"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

export const events = {
  searchQuery: (query: string, resultCount: number) =>
    trackEvent("search", { search_term: query, result_count: resultCount }),

  articleView: (slug: string, title: string, category: string) =>
    trackEvent("article_view", { slug, title, category }),

  feedbackSubmit: (slug: string, helpful: boolean) =>
    trackEvent("article_feedback", { slug, helpful }),

  contactClick: (source: string) =>
    trackEvent("contact_click", { source }),
};
