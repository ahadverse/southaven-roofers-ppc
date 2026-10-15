import "server-only";
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
import { COLLECTIONS, getDb, isDbConfigured } from "@/lib/db";
import { isImageKey, type ImageKey } from "@/lib/images";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { site, siteUrl } from "@/lib/site";

export const CONTENT_COLLECTIONS = ["services", "guides", "blog", "legal"] as const;
export type Collection = (typeof CONTENT_COLLECTIONS)[number];
export const isCollection = (value: string): value is Collection => (CONTENT_COLLECTIONS as readonly string[]).includes(value);

export type Faq = { q: string; a: string };
export type Source = { label: string; url: string };
export type Heading = { id: string; text: string };
export type DocStatus = "published" | "draft";

/** The shape stored in MongoDB (and parsed from the starter markdown files). */
export type RawDoc = {
  collection: Collection;
  slug: string;
  status: DocStatus;
  title: string;
  metaTitle: string;
  description: string;
  navLabel: string;
  excerpt: string;
  image: string;
  icon?: string;
  order: number;
  /** YYYY-MM-DD */
  date: string;
  /** YYYY-MM-DD */
  updated: string;
  category?: string;
  faqs: Faq[];
  related: string[];
  sources: Source[];
  /** Markdown body. Supports [[cta]] / [[cta|Headline]] and [[image:key|Caption]] markers. */
  body: string;
};

/**
 * Body segments: plain HTML, a call-to-action box ([[cta]] in markdown),
 * or a figure ([[image:key|optional caption]] in markdown).
 */
export type Segment =
  | { kind: "html"; html: string }
  | { kind: "cta"; text?: string }
  | { kind: "image"; key: ImageKey; caption?: string };

export type Doc = Omit<RawDoc, "body" | "image"> & {
  href: string;
  image: ImageKey;
  segments: Segment[];
  headings: Heading[];
  readingMinutes: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const DEFAULT_IMAGE: ImageKey = "roofer-nail-gun-shingles";

export const hrefFor = (collection: Collection, slug: string) => (collection === "blog" ? `/blog/${slug}` : `/${slug}`);

/* ------------------------------------------------------------------ */
/* Markdown → HTML segments                                            */
/* ------------------------------------------------------------------ */

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

function toSegments(html: string): Segment[] {
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
      // Unknown image keys are skipped rather than breaking the page.
      if (isImageKey(key)) segments.push({ kind: "image", key, caption: extra?.trim() || undefined });
    }
    last = (match.index ?? 0) + match[0].length;
  }
  const rest = html.slice(last);
  if (rest.trim()) segments.push({ kind: "html", html: rest });
  return segments;
}

/** Turns a markdown body into renderable segments plus the h2 table of contents. */
export function renderMarkdown(markdown: string, settings: SiteSettings): { segments: Segment[]; headings: Heading[] } {
  const content = markdown
    .replaceAll("{{phone}}", settings.phone.display)
    .replaceAll("{{siteName}}", site.name)
    .replaceAll("{{contactEmail}}", settings.contactEmail)
    .replaceAll("{{siteUrl}}", siteUrl);
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
  return { segments: toSegments(html), headings };
}

function processRaw(raw: RawDoc, settings: SiteSettings): Doc {
  const { body, image, ...rest } = raw;
  const { segments, headings } = renderMarkdown(body, settings);
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    ...rest,
    href: hrefFor(raw.collection, raw.slug),
    image: isImageKey(image) ? image : DEFAULT_IMAGE,
    segments,
    headings,
    readingMinutes: Math.max(1, Math.round(words / 230)),
  };
}

/* ------------------------------------------------------------------ */
/* Sources: MongoDB (admin-managed) or the starter markdown files      */
/* ------------------------------------------------------------------ */

const toDate = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ""));

/** Parse the starter markdown files in /content (used for seeding and as a fallback). */
export function readRawFromFiles(collection: Collection): RawDoc[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return {
        collection,
        slug: file.replace(/\.md$/, ""),
        status: "published",
        title: data.title,
        metaTitle: data.metaTitle,
        description: data.description,
        navLabel: data.navLabel ?? data.title,
        excerpt: data.excerpt ?? data.description,
        image: String(data.image ?? DEFAULT_IMAGE),
        icon: data.icon,
        order: Number(data.order ?? 99),
        date: toDate(data.date ?? data.updated),
        updated: toDate(data.updated ?? data.date),
        category: data.category,
        faqs: data.faqs ?? [],
        related: data.related ?? [],
        sources: data.sources ?? [],
        body: content.trim(),
      } satisfies RawDoc;
    });
}

/** True once the admin database holds content (otherwise the markdown files are served). */
const dbHasContent = cache(async (): Promise<boolean> => {
  if (!isDbConfigured()) return false;
  const db = await getDb();
  return (await db.collection(COLLECTIONS.docs).estimatedDocumentCount()) > 0;
});

const loadRaw = cache(async (collection: Collection): Promise<RawDoc[]> => {
  if (!(await dbHasContent())) return readRawFromFiles(collection);
  const db = await getDb();
  return db
    .collection<RawDoc>(COLLECTIONS.docs)
    .find({ collection, status: "published" }, { projection: { _id: 0 } })
    .toArray();
});

const sortDocs = (collection: Collection, docs: Doc[]) =>
  docs.sort((a, b) =>
    collection === "blog" ? b.date.localeCompare(a.date) : a.order - b.order || a.title.localeCompare(b.title)
  );

export const getCollection = cache(async (collection: Collection): Promise<Doc[]> => {
  const [raw, settings] = await Promise.all([loadRaw(collection), getSettings()]);
  return sortDocs(
    collection,
    raw.map((r) => processRaw(r, settings))
  );
});

export async function getDoc(collection: Collection, slug: string): Promise<Doc | undefined> {
  return (await getCollection(collection)).find((d) => d.slug === slug);
}

/** Services, guides and legal pages share top-level URLs (/roof-repair, /privacy-policy). */
export async function getPageDoc(slug: string): Promise<Doc | undefined> {
  return (await getDoc("services", slug)) ?? (await getDoc("guides", slug));
}

/** Resolve a `related` slug from any collection. */
export async function findBySlug(slug: string): Promise<Doc | undefined> {
  return (await getPageDoc(slug)) ?? (await getDoc("blog", slug));
}

export async function getRelated(doc: Doc, limit = 3): Promise<Doc[]> {
  const found = await Promise.all(doc.related.map(findBySlug));
  return found.filter((d): d is Doc => Boolean(d) && d!.slug !== doc.slug).slice(0, limit);
}
