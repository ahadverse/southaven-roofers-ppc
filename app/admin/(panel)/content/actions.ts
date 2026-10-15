"use server";

import { redirect, RedirectType } from "next/navigation";
import { deleteDoc, getDocById, saveDoc, type DocInput, type SaveResult } from "@/lib/admin-data";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { isCollection, renderMarkdown, type Collection, type Segment } from "@/lib/content";
import { getSettings } from "@/lib/settings";

/*
 * Server actions for the content editor. These are public POST endpoints, so every one checks the
 * session and treats its arguments as untrusted: values are reduced to the expected primitive shapes
 * here, and saveDoc() does the real validation before anything is written.
 */

const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const rows = (v: unknown) => (Array.isArray(v) ? v.filter(isObject) : []);

/** Keep only known fields with the right primitive types (normalizeInput assumes arrays of objects). */
function shapeInput(raw: unknown): Partial<DocInput> {
  const r = isObject(raw) ? raw : {};
  return {
    slug: str(r.slug),
    status: r.status === "draft" ? "draft" : "published",
    title: str(r.title),
    metaTitle: str(r.metaTitle),
    description: str(r.description),
    navLabel: str(r.navLabel),
    excerpt: str(r.excerpt),
    image: str(r.image),
    icon: str(r.icon),
    order: typeof r.order === "number" && Number.isFinite(r.order) ? r.order : undefined,
    date: str(r.date),
    category: str(r.category),
    faqs: rows(r.faqs).map((f) => ({ q: str(f.q) ?? "", a: str(f.a) ?? "" })),
    related: Array.isArray(r.related) ? r.related.filter((s): s is string => typeof s === "string") : [],
    sources: rows(r.sources).map((s) => ({ label: str(s.label) ?? "", url: str(s.url) ?? "" })),
    body: str(r.body) ?? "",
  };
}

/** Create (id = null) or update a document. Returns field errors / warnings; never throws for expected problems. */
export async function saveDocAction(collection: Collection, id: string | null, input: Partial<DocInput>): Promise<SaveResult> {
  // An expired session would otherwise redirect to the login page and throw away the editor's unsaved work.
  if (!(await getSessionUser())) {
    return {
      ok: false,
      errors: { form: "Your session has expired. Sign in again in a new tab, then come back and click Save." },
      warnings: [],
    };
  }
  await requireAdmin();

  if (typeof collection !== "string" || !isCollection(collection)) {
    return { ok: false, errors: { form: "Unknown content type." }, warnings: [] };
  }
  if (id !== null && typeof id !== "string") {
    return { ok: false, errors: { form: "Invalid document id." }, warnings: [] };
  }

  try {
    return await saveDoc(collection, shapeInput(input), id ?? undefined);
  } catch (err) {
    console.error("[admin] saveDoc failed:", err);
    const duplicate = err instanceof Error && /E11000/.test(err.message);
    return {
      ok: false,
      errors: duplicate
        ? { slug: "Another page already uses this URL." }
        : { form: "The database didn't accept the change. Please try again in a moment." },
      warnings: [],
    };
  }
}

/** Delete a document, then go back to its list. Only returns when something went wrong. */
export async function deleteDocAction(id: string): Promise<{ ok: false; error: string }> {
  await requireAdmin();
  if (typeof id !== "string") return { ok: false, error: "Invalid document id." };

  let collection: Collection;
  try {
    const doc = await getDocById(id);
    if (!doc) return { ok: false, error: "This page no longer exists." };
    const res = await deleteDoc(id);
    if (!res.ok) return { ok: false, error: res.error ?? "This page couldn't be deleted." };
    collection = doc.collection;
  } catch (err) {
    console.error("[admin] deleteDoc failed:", err);
    return { ok: false, error: "The database didn't respond. Please try again in a moment." };
  }
  // redirect() throws, so it stays outside the try block.
  redirect(`/admin/content/${collection}`, RedirectType.replace);
}

/** Render markdown exactly like the public site does (same markers and placeholders). */
export async function previewAction(markdown: string): Promise<Segment[]> {
  await requireAdmin();
  const body = typeof markdown === "string" ? markdown : "";
  return renderMarkdown(body, await getSettings()).segments;
}
