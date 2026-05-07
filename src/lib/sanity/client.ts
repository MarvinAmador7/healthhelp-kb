import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

// GROQ queries ---------------------------------------------------------------

export const CATEGORIES_QUERY = /* groq */ `
  *[_type == "category"] | order(order asc) {
    title,
    "slug": slug.current,
    description,
    icon,
    "articleCount": count(*[_type == "article" && references(^._id)])
  }
`;

export const POPULAR_ARTICLES_QUERY = /* groq */ `
  *[_type == "article"] | order(helpfulCount desc) [0..7] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    readTimeMinutes,
    updatedAt,
    helpfulCount,
    totalFeedbackCount,
    clinicallyReviewed,
    "category": category->{ title, "slug": slug.current }
  }
`;

export const ARTICLE_BY_SLUG_QUERY = /* groq */ `
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    body,
    excerpt,
    publishedAt,
    updatedAt,
    readTimeMinutes,
    clinicallyReviewed,
    helpfulCount,
    totalFeedbackCount,
    articleType,
    seoDescription,
    "author": author->{ name, "slug": slug.current, bio },
    "category": category->{ title, "slug": slug.current, description },
    "tags": tags[]->{ title, "slug": slug.current }
  }
`;

export const ARTICLES_BY_CATEGORY_QUERY = /* groq */ `
  *[_type == "article" && category->slug.current == $categorySlug] | order(updatedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    readTimeMinutes,
    updatedAt,
    helpfulCount,
    totalFeedbackCount,
    articleType
  }
`;

export const RELATED_ARTICLES_QUERY = /* groq */ `
  *[_type == "article" && slug.current != $currentSlug && count(tags[@._ref in $tagIds]) > 0]
    | order(helpfulCount desc) [0..3] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    readTimeMinutes,
    "category": category->{ title, "slug": slug.current }
  }
`;
