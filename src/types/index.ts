export interface Author {
  name: string;
  slug: string;
  bio?: string;
  image?: string;
}

export interface Tag {
  title: string;
  slug: string;
}

export interface Category {
  title: string;
  slug: string;
  description?: string;
  icon: string;
  articleCount?: number;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  author: Author;
  tags: Tag[];
  excerpt: string;
  body: unknown; // Portable Text / Sanity block content
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  clinicallyReviewed: boolean;
  helpfulCount: number;
  totalFeedbackCount: number;
  articleType: "how-to" | "explainer" | "faq" | "reference";
  seoDescription?: string;
  canonicalUrl?: string;
}

export interface SearchHit {
  objectID: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  articleType: string;
  readTimeMinutes: number;
  updatedAt: string;
  helpfulPercent: number;
  _highlightResult?: {
    title?: { value: string };
    excerpt?: { value: string };
  };
}

export interface FeedbackPayload {
  articleSlug: string;
  helpful: boolean;
  reason?: string;
  freeText?: string;
}
