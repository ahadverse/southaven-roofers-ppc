import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import { isImageKey, type ImageKey } from "@/lib/images";
import { phone, site, siteUrl } from "@/lib/site";

export type Collection = "services" | "guides" | "blog" | "legal";

export type Faq = { q: string; a: string };
export type Source = { label: string; url: string };
export type Heading = { id: string; text: string };

/**
 * Body segments: plain HTML, a call-to-action box ([[cta]] in markdown),
 * or a figure ([[image:key|optional caption]] in markdown).
 */
export type Segment =
  | { kind: "html"; html: string }
  | { kind: "cta"; text?: string }
  | { kind: "image"; key: ImageKey; caption?: string };

export type Doc = {
  collection: Collection;
  slug: string;
  href: string;
  title: string;
  metaTitle: string;
  description: string;
  navLabel: string;
  excerpt: string;
  image: ImageKey;
  icon?: string;
  order: number;
  date: string;
  updated: string;
  category?: string;
  faqs: Faq[];
  related: string[];
  sources: Source[];
  segments: Segment[];
  headings: Heading[];
  readingMinutes: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

const hrefFor = (collection: Collection, slug: string) => (collection === "blog" ? `/blog/${slug}` : `/${slug}`);

type HastNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[]; value?: string };

const textOf = (node: HastNode): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");

/** Collect h2 headings (after rehype-slug has assigned ids) for the table of contents. */
function rehypeCollectHeadings(target: Heading[]) {
  return () => (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "h2" && typeof node.properties?.id === "string") {
        target.push({ id: node.properties.id, text: textOf(node) });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** Wrap tables so they scroll horizontally on small screens instead of breaking the layout. */
function rehypeWrapTables() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      node.children = node.children?.map((child) => {
        if (child.type === "element" && child.tagName === "table") {
          return { type: "element", tagName: "div", properties: { className: ["table-wrap"] }, children: [child] };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}

const MARKER = /<p>\[\[(cta|image:[a-z0-9-]+)(?:\|([^\]]*))?\]\]<\/p>/g;

function toSegments(html: string, file: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of html.matchAll(MARKER)) {
    const before = html.slice(last, match.index);
    if (before.trim()) segments.push({ kind: "html", html: before });
    const [, token, extra] = match;
    if (token === "cta") {
      segments.push({ kind: "cta", text: extra?.trim() || undefined });
    } else {
      const key = token.slice("image:".length);
      if (!isImageKey(key)) throw new Error(`${file}: unknown image key "${key}"`);
      segments.push({ kind: "image", key, caption: extra?.trim() || undefined });
    }
    last = (match.index ?? 0) + match[0].length;
  }
  const rest = html.slice(last);
  if (rest.trim()) segments.push({ kind: "html", html: rest });
  return segments;
}

function readDoc(collection: Collection, file: string): Doc {
  const fullPath = path.join(CONTENT_DIR, collection, file);
  const { data, content: raw } = matter(fs.readFileSync(fullPath, "utf8"));
  const content = raw
    .replaceAll("{{phone}}", phone.display)
    .replaceAll("{{siteName}}", site.name)
    .replaceAll("{{contactEmail}}", site.contactEmail)
    .replaceAll("{{siteUrl}}", siteUrl);
  const slug = file.replace(/\.md$/, "");
  const where = `content/${collection}/${file}`;

  for (const field of ["title", "metaTitle", "description"]) {
    if (!data[field]) throw new Error(`${where}: missing frontmatter "${field}"`);
  }
  const image = String(data.image ?? "roofer-nail-gun-shingles");
  if (!isImageKey(image)) throw new Error(`${where}: unknown image key "${image}"`);

  const headings: Heading[] = [];
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeCollectHeadings(headings))
      .use(rehypeWrapTables)
      .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
      .use(rehypeStringify)
      .processSync(content)
  );

  const toDate = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ""));
  const words = content.split(/\s+/).filter(Boolean).length;

  return {
    collection,
    slug,
    href: hrefFor(collection, slug),
    title: data.title,
    metaTitle: data.metaTitle,
    description: data.description,
    navLabel: data.navLabel ?? data.title,
    excerpt: data.excerpt ?? data.description,
    image,
    icon: data.icon,
    order: Number(data.order ?? 99),
    date: toDate(data.date ?? data.updated),
    updated: toDate(data.updated ?? data.date),
    category: data.category,
    faqs: (data.faqs ?? []) as Faq[],
    related: (data.related ?? []) as string[],
    sources: (data.sources ?? []) as Source[],
    segments: toSegments(html, where),
    headings,
    readingMinutes: Math.max(1, Math.round(words / 230)),
  };
}

export const getCollection = cache((collection: Collection): Doc[] => {
  const dir = path.join(CONTENT_DIR, collection);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readDoc(collection, f))
    .sort((a, b) =>
      collection === "blog" ? b.date.localeCompare(a.date) : a.order - b.order || a.title.localeCompare(b.title)
    );
});

export function getDoc(collection: Collection, slug: string): Doc | undefined {
  return getCollection(collection).find((d) => d.slug === slug);
}

/** Services and guides share top-level URLs (/roof-repair, /roof-replacement-cost-southaven). */
export function getPageDoc(slug: string): Doc | undefined {
  return getDoc("services", slug) ?? getDoc("guides", slug);
}

/** Resolve a `related` slug from any collection. */
export function findBySlug(slug: string): Doc | undefined {
  return getPageDoc(slug) ?? getDoc("blog", slug);
}

export function getRelated(doc: Doc, limit = 3): Doc[] {
  const picked = doc.related.map(findBySlug).filter((d): d is Doc => Boolean(d) && d!.slug !== doc.slug);
  return picked.slice(0, limit);
}
