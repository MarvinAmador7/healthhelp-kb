import { NextRequest, NextResponse } from "next/server";
import { algoliasearch } from "algoliasearch";
import { createClient } from "@sanity/client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("sanity-webhook-signature") ?? "";
  const secret = process.env.SANITY_WEBHOOK_SECRET ?? "";
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: { _type: string; _id: string; slug?: { current: string } } = JSON.parse(body);

  if (payload._type !== "article" || !payload.slug?.current) {
    return NextResponse.json({ skipped: true });
  }

  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    useCdn: false,
  });

  const article = await sanity.fetch(
    `*[_type == "article" && _id == $_id][0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      "category": category->title,
      "categorySlug": category->slug.current,
      articleType,
      readTimeMinutes,
      updatedAt,
      helpfulCount,
      totalFeedbackCount
    }`,
    { _id: payload._id }
  );

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const helpfulPercent =
    article.totalFeedbackCount > 0
      ? Math.round((article.helpfulCount / article.totalFeedbackCount) * 100)
      : 0;

  const algolia = algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_API_KEY!
  );

  await algolia.saveObject({
    indexName: "articles",
    body: {
      objectID: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      categorySlug: article.categorySlug,
      articleType: article.articleType,
      readTimeMinutes: article.readTimeMinutes,
      updatedAt: article.updatedAt,
      helpfulPercent,
    },
  });

  return NextResponse.json({ indexed: article.slug });
}
