import { defineType, defineField, defineArrayMember } from "sanity";

export const articleSchema = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Imperative or noun phrase, max 60 chars",
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "articleType",
      title: "Article type",
      type: "string",
      options: {
        list: [
          { title: "How-to", value: "how-to" },
          { title: "Explainer", value: "explainer" },
          { title: "FAQ", value: "faq" },
          { title: "Reference", value: "reference" },
        ],
        layout: "radio",
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Shown in search results and article header. Max 200 chars.",
      validation: (R) => R.required().max(200),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        }),
        defineArrayMember({
          name: "callout",
          title: "Callout",
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Info", value: "info" },
                  { title: "Warning", value: "warning" },
                  { title: "Medical caution", value: "caution" },
                  { title: "Success", value: "success" },
                ],
                layout: "radio",
              },
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
            }),
          ],
          preview: {
            select: { title: "type", subtitle: "text" },
          },
        }),
      ],
    }),
    defineField({
      name: "clinicallyReviewed",
      title: "Clinically reviewed",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "readTimeMinutes",
      title: "Read time (minutes)",
      type: "number",
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Last updated",
      type: "datetime",
    }),
    defineField({
      name: "helpfulCount",
      title: "Helpful votes",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "totalFeedbackCount",
      title: "Total feedback count",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO meta description",
      type: "text",
      rows: 2,
      description: "Overrides excerpt for <meta name=description>. Max 155 chars.",
      validation: (R) => R.max(155),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.title",
      media: "category.icon",
    },
  },
  orderings: [
    {
      title: "Recently updated",
      name: "updatedAtDesc",
      by: [{ field: "updatedAt", direction: "desc" }],
    },
    {
      title: "Most helpful",
      name: "helpfulCountDesc",
      by: [{ field: "helpfulCount", direction: "desc" }],
    },
  ],
});
