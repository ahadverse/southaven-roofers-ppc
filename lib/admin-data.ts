import "server-only";
import { ObjectId, type WithId } from "mongodb";
import { revalidatePath } from "next/cache";
import { isIconName } from "@/components/Icon";
import { CONTENT_COLLECTIONS, readRawFromFiles, type Collection, type DocStatus, type Faq, type RawDoc, type Source } from "@/lib/content";
import { COLLECTIONS, getDb, isDbConfigured } from "@/lib/db";
import { isImageKey } from "@/lib/images";
import { normalizeUsPhone, type StoredSettings } from "@/lib/settings";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type StoredDoc = RawDoc & { createdAt: Date; updatedAt: Date };

/** A document as the admin panel sees it (string id, ISO timestamps). */
export type AdminDoc = RawDoc & { id: string; createdAt: string; updatedAt: string };

export type AdminDocSummary = Pick<RawDoc, "collection" | "slug" | "status" | "title" | "navLabel" | "order" | "date" | "updated"> & {
  id: string;
  updatedAt: string;
};

/** Editable fields sent from the editor form. `collection` is fixed per document. */
export type DocInput = {
  slug: string;
  status: DocStatus;
  title: string;
  metaTitle: string;
  description: string;
  navLabel: string;
  excerpt: string;
  image: string;
  icon?: string;
  order?: number;
  date?: string;
  category?: string;
  faqs: Faq[];
  related: string[];
  sources: Source[];
  body: string;
};

export type SaveResult =
  | { ok: true; id: string; warnings: string[] }
  | { ok: false; errors: Record<string, string>; warnings: string[] };

/** Collections whose documents can be created and deleted in the admin. Legal pages are edit-only. */
export const CREATABLE: Record<Collection, boolean> = { services: true, guides: true, blog: true, legal: false };

export const COLLECTION_LABELS: Record<Collection, { plural: string; singular: string }> = {
  services: { plural: "Service pages", singular: "Service page" },
  guides: { plural: "Guides", singular: "Guide" },
  blog: { plural: "Blog posts", singular: "Blog post" },
  legal: { plural: "Legal pages", singular: "Legal page" },
};

/** Top-level URLs already used by the site (services and guides live at /{slug}). */
const RESERVED_SLUGS = new Set([
  "admin", "api", "blog", "services", "how-it-works", "contact", "faq", "privacy-policy",
  "terms-and-disclosure", "sitemap.xml", "robots.txt", "icon.svg", "apple-icon.png", "og-default.jpg", "_next",
]);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Phrases that would misrepresent a referral service as the roofing contractor (shown as warnings). */
const HONESTY_PATTERNS: RegExp[] = [
  /\bour (crew|crews|roofers|installers|technicians)\b/i,
  /\bwe (install|replace|repair|inspect)\b/i,
  /\byears in business\b/i,
  /\b\d+\+? years of experience\b/i,
  /\bfive[- ]star\b/i,
  /\bguarantee(d)?\b/i,
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let indexesReady: Promise<void> | null = null;

async function docsCollection() {
  const db = await getDb();
  const col = db.collection<StoredDoc>(COLLECTIONS.docs);
  indexesReady ??= Promise.all([
    col.createIndex({ collection: 1, slug: 1 }, { unique: true }),
    col.createIndex({ collection: 1, status: 1 }),
    db.collection(COLLECTIONS.events).createIndex({ createdAt: -1 }),
  ]).then(() => undefined);
  await indexesReady;
  return col;
}

const toAdminDoc = (d: WithId<StoredDoc>): AdminDoc => {
  const { _id, createdAt, updatedAt, ...rest } = d;
  return { ...rest, id: _id.toHexString(), createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() };
};

/** Today's date in Southaven (America/Chicago) as YYYY-MM-DD. */
export function todayInSouthaven(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

const parseId = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

/** Invalidate every prerendered page so edits appear on the next visit. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export async function dbStatus(): Promise<{ configured: boolean; connected: boolean; docCount: number; error?: string }> {
  if (!isDbConfigured()) return { configured: false, connected: false, docCount: 0 };
  try {
    const col = await docsCollection();
    return { configured: true, connected: true, docCount: await col.countDocuments() };
  } catch (err) {
    return { configured: true, connected: false, docCount: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

export async function listDocs(collection: Collection): Promise<AdminDocSummary[]> {
  const col = await docsCollection();
  const rows = await col
    .find({ collection }, { projection: { body: 0, faqs: 0, sources: 0, related: 0 } })
    .sort(collection === "blog" ? { date: -1 } : { order: 1, title: 1 })
    .toArray();
  return rows.map((d) => ({
    id: d._id.toHexString(),
    collection: d.collection,
    slug: d.slug,
    status: d.status,
    title: d.title,
    navLabel: d.navLabel,
    order: d.order,
    date: d.date,
    updated: d.updated,
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function getDocById(id: string): Promise<AdminDoc | null> {
  const _id = parseId(id);
  if (!_id) return null;
  const col = await docsCollection();
  const doc = await col.findOne({ _id });
  return doc ? toAdminDoc(doc) : null;
}

/** All slugs, for the "related articles" picker. */
export async function listAllSlugs(): Promise<{ slug: string; title: string; collection: Collection }[]> {
  const col = await docsCollection();
  const rows = await col
    .find({ collection: { $in: ["services", "guides", "blog"] } }, { projection: { slug: 1, title: 1, collection: 1 } })
    .toArray();
  return rows.map((r) => ({ slug: r.slug, title: r.title, collection: r.collection }));
}

/* ------------------------------------------------------------------ */
/* Validate + write                                                    */
/* ------------------------------------------------------------------ */

const clean = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export async function validateDoc(
  collection: Collection,
  input: DocInput,
  currentId?: string
): Promise<{ errors: Record<string, string>; warnings: string[] }> {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!SLUG.test(input.slug)) errors.slug = "Use lowercase letters, numbers and single hyphens (e.g. roof-repair-tips).";
  if (collection !== "blog" && RESERVED_SLUGS.has(input.slug) && collection !== "legal") errors.slug = "This URL is already used by the site.";
  if (!input.title) errors.title = "Title is required.";
  if (!input.metaTitle) errors.metaTitle = "SEO title is required.";
  else if (input.metaTitle.length > 70) errors.metaTitle = "Keep the SEO title under 70 characters (60 is ideal).";
  else if (input.metaTitle.length > 60) warnings.push(`SEO title is ${input.metaTitle.length} characters; Google usually shows about 60.`);
  if (!input.description) errors.description = "Meta description is required.";
  else if (input.description.length > 170) errors.description = "Keep the meta description under 170 characters (120–158 is ideal).";
  else if (input.description.length < 110 || input.description.length > 158)
    warnings.push(`Meta description is ${input.description.length} characters; 120–158 works best.`);
  if (!isImageKey(input.image)) errors.image = "Pick an image from the library.";
  if (input.icon && !isIconName(input.icon)) errors.icon = "Unknown icon.";
  if (collection === "blog" && !/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? "")) errors.date = "Publish date is required (YYYY-MM-DD).";
  if (!input.body || input.body.split(/\s+/).length < 50) errors.body = "The article body is too short.";
  if (/^# /m.test(input.body)) errors.body = "Don't use a top-level heading (# ...). The title is already the page heading; start sections with ##.";
  input.faqs.forEach((f, i) => {
    if (!f.q || !f.a) errors[`faqs.${i}`] = "Each FAQ needs a question and an answer.";
  });
  input.sources.forEach((s, i) => {
    if (!s.label || !/^https:\/\//.test(s.url)) errors[`sources.${i}`] = "Each source needs a label and an https:// URL.";
  });

  for (const re of HONESTY_PATTERNS) {
    const m = input.body.match(re) ?? input.excerpt.match(re);
    if (m) warnings.push(`Wording check: "${m[0]}" can make the site sound like the roofing contractor. Prefer "a local roofer" / "your contractor".`);
  }
  const words = input.body.split(/\s+/).filter(Boolean).length;
  if (collection !== "legal" && words < 800) warnings.push(`The article is ${words} words. Longer, genuinely useful pages (1,200+) tend to rank better.`);

  // Slug must be unique: blog has its own /blog/ namespace; services, guides and legal share the top level.
  if (!errors.slug) {
    const col = await docsCollection();
    const namespace: Collection[] = collection === "blog" ? ["blog"] : ["services", "guides", "legal"];
    const clash = await col.findOne({ slug: input.slug, collection: { $in: namespace } }, { projection: { _id: 1 } });
    if (clash && clash._id.toHexString() !== currentId) errors.slug = "Another page already uses this URL.";
  }

  const known = new Set((await listAllSlugs()).map((s) => s.slug));
  const missing = input.related.filter((r) => !known.has(r));
  if (missing.length) warnings.push(`Related links not found: ${missing.join(", ")}.`);

  return { errors, warnings };
}

export function normalizeInput(raw: Partial<DocInput>): DocInput {
  return {
    slug: clean(raw.slug).toLowerCase(),
    status: raw.status === "draft" ? "draft" : "published",
    title: clean(raw.title),
    metaTitle: clean(raw.metaTitle),
    description: clean(raw.description),
    navLabel: clean(raw.navLabel),
    excerpt: clean(raw.excerpt),
    image: clean(raw.image),
    icon: clean(raw.icon) || undefined,
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 99,
    date: clean(raw.date) || undefined,
    category: clean(raw.category) || undefined,
    faqs: (raw.faqs ?? []).map((f) => ({ q: clean(f.q), a: clean(f.a) })).filter((f) => f.q || f.a),
    related: [...new Set((raw.related ?? []).map(clean).filter(Boolean))],
    sources: (raw.sources ?? []).map((s) => ({ label: clean(s.label), url: clean(s.url) })).filter((s) => s.label || s.url),
    body: typeof raw.body === "string" ? raw.body.replace(/\r\n/g, "\n").trim() : "",
  };
}

/** Create (no id) or update a document. Validates first; never writes invalid data. */
export async function saveDoc(collection: Collection, rawInput: Partial<DocInput>, id?: string): Promise<SaveResult> {
  const input = normalizeInput(rawInput);
  const existing = id ? await getDocById(id) : null;
  if (id && !existing) return { ok: false, errors: { form: "This document no longer exists." }, warnings: [] };
  if (existing && existing.collection !== collection) return { ok: false, errors: { form: "Wrong content type." }, warnings: [] };
  if (!id && !CREATABLE[collection]) return { ok: false, errors: { form: "New pages of this type can't be created." }, warnings: [] };
  // Legal pages keep their fixed URLs.
  if (collection === "legal" && existing) input.slug = existing.slug;

  const { errors, warnings } = await validateDoc(collection, input, id);
  if (Object.keys(errors).length) return { ok: false, errors, warnings };

  const now = new Date();
  const today = todayInSouthaven();
  const fields: RawDoc = {
    collection,
    ...input,
    navLabel: input.navLabel || input.title,
    excerpt: input.excerpt || input.description,
    order: input.order ?? 99,
    date: input.date ?? existing?.date ?? today,
    updated: today,
  };

  const col = await docsCollection();
  if (existing) {
    await col.updateOne({ _id: new ObjectId(existing.id) }, { $set: { ...fields, updatedAt: now } });
    revalidateSite();
    return { ok: true, id: existing.id, warnings };
  }
  const res = await col.insertOne({ ...fields, createdAt: now, updatedAt: now });
  revalidateSite();
  return { ok: true, id: res.insertedId.toHexString(), warnings };
}

export async function deleteDoc(id: string): Promise<{ ok: boolean; error?: string }> {
  const doc = await getDocById(id);
  if (!doc) return { ok: false, error: "Not found." };
  if (!CREATABLE[doc.collection]) return { ok: false, error: "This page can't be deleted." };
  const col = await docsCollection();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidateSite();
  return { ok: true };
}

/**
 * Copy the starter markdown files into MongoDB.
 * Existing documents (same collection + slug) are kept unless `overwrite` is true.
 */
export async function importStarterContent(overwrite = false): Promise<{ inserted: number; updated: number; skipped: number }> {
  const col = await docsCollection();
  const now = new Date();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  for (const collection of CONTENT_COLLECTIONS) {
    for (const raw of readRawFromFiles(collection)) {
      const found = await col.findOne({ collection, slug: raw.slug }, { projection: { _id: 1 } });
      if (found && !overwrite) {
        skipped++;
        continue;
      }
      if (found) {
        await col.updateOne({ _id: found._id }, { $set: { ...raw, updatedAt: now } });
        updated++;
      } else {
        await col.insertOne({ ...raw, createdAt: now, updatedAt: now });
        inserted++;
      }
    }
  }
  revalidateSite();
  return { inserted, updated, skipped };
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export type SettingsInput = { phoneNumber: string; callHours: string; contactEmail: string };

export async function saveSettings(
  input: SettingsInput
): Promise<{ ok: true; settings: StoredSettings } | { ok: false; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};
  const phoneNumber = input.phoneNumber.trim() ? normalizeUsPhone(input.phoneNumber) : "";
  if (phoneNumber === null) errors.phoneNumber = "Enter a 10-digit US number, e.g. (662) 555-0100 or +16625550100.";
  const contactEmail = input.contactEmail.trim();
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) errors.contactEmail = "Enter a valid email address.";
  const callHours = input.callHours.trim().slice(0, 80);
  if (Object.keys(errors).length) return { ok: false, errors };

  const db = await getDb();
  const settings: StoredSettings = { phoneNumber: phoneNumber || "", callHours, contactEmail, updatedAt: new Date() };
  await db
    .collection<StoredSettings & { _id: string }>(COLLECTIONS.settings)
    .updateOne({ _id: "site" }, { $set: settings }, { upsert: true });
  revalidateSite();
  return { ok: true, settings };
}
