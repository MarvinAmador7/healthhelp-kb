import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Callout from "./Callout";

type CalloutBlock = {
  _type: "callout";
  _key?: string;
  type: "info" | "warning" | "caution" | "success";
  text: string;
};

type Props = {
  // Sanity portable-text body — block + callout + image arrays.
  // Typed as unknown[] because Sanity emits heterogeneous block types and the
  // PortableText components below narrow per-_type at render time.
  body: unknown[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const components: PortableTextComponents = {
  types: {
    callout: ({ value }: { value: CalloutBlock }) => (
      <Callout type={value.type} text={value.text} />
    ),
  },
  block: {
    h2: ({ children }) => {
      const text = Array.isArray(children) ? children.join("") : String(children ?? "");
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="text-xl font-bold text-[var(--color-text-primary)] mt-8 mb-3 scroll-mt-24"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = Array.isArray(children) ? children.join("") : String(children ?? "");
      const id = slugify(text);
      return (
        <h3
          id={id}
          className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2 scroll-mt-24"
        >
          {children}
        </h3>
      );
    },
    normal: ({ children }) => (
      <p className="text-[var(--color-text-secondary)] leading-[1.78] mt-4">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--color-primary-medium)] pl-4 italic text-[var(--color-text-secondary)] my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mt-3 mb-3 space-y-1.5 text-[var(--color-text-secondary)] leading-[1.7]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mt-3 mb-3 space-y-1.5 text-[var(--color-text-secondary)] leading-[1.7]">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const isExternal = /^https?:/.test(href);
      return (
        <a
          href={href}
          className="text-[var(--color-primary)] underline underline-offset-2 hover:no-underline"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default function ArticleBody({ body }: Props) {
  if (!body || body.length === 0) {
    return (
      <p className="text-[var(--color-text-tertiary)] italic mt-6">
        This article has no content yet.
      </p>
    );
  }
  return (
    <div className="prose prose-base max-w-none">
      <PortableText value={body as Parameters<typeof PortableText>[0]["value"]} components={components} />
    </div>
  );
}
