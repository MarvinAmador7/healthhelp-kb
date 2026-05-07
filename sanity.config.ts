import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { articleSchema } from "@/lib/sanity/schemas/article";
import { categorySchema } from "@/lib/sanity/schemas/category";
import { authorSchema } from "@/lib/sanity/schemas/author";
import { tagSchema } from "@/lib/sanity/schemas/tag";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "healthhelp-kb",
  title: "HealthHelp Knowledge Base",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Articles")
              .child(
                S.documentList()
                  .title("Articles")
                  .filter('_type == "article"')
                  .defaultOrdering([
                    { field: "updatedAt", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Categories")
              .child(
                S.documentList()
                  .title("Categories")
                  .filter('_type == "category"')
                  .defaultOrdering([{ field: "order", direction: "asc" }])
              ),
            S.listItem()
              .title("Authors")
              .child(
                S.documentList()
                  .title("Authors")
                  .filter('_type == "author"')
              ),
            S.listItem()
              .title("Tags")
              .child(
                S.documentList().title("Tags").filter('_type == "tag"')
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: {
    types: [articleSchema, categorySchema, authorSchema, tagSchema],
  },
});
