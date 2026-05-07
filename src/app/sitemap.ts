import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity/client";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://project-sxpkl.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await client
    .fetch<{ slug: string; updatedAt: string }[]>(
      `*[_type == "article"] { "slug": slug.current, updatedAt }`
    )
    .catch(() => []);

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.6 },
    ...articleEntries,
  ];
}
