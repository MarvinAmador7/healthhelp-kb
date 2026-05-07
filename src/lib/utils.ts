import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function helpfulPercent(helpful: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((helpful / total) * 100);
}

/** Replace < with unicode escape to prevent XSS in JSON-LD */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
