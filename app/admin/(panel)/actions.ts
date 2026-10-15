"use server";

import { importStarterContent } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";

export type ImportState = { ok: boolean; message: string } | null;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Copy the starter markdown pages into MongoDB.
 * `overwrite=true` (with `confirm=overwrite`) replaces edited pages with the original starter versions.
 */
export async function importStarterAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  await requireAdmin();
  if (!isDbConfigured()) return { ok: false, message: "The database isn't connected yet. Set MONGODB_URI first." };

  const overwrite = formData.get("overwrite") === "true";
  if (overwrite && formData.get("confirm") !== "overwrite") {
    return { ok: false, message: "Please confirm that edited pages may be replaced." };
  }

  try {
    const { inserted, updated, skipped } = await importStarterContent(overwrite);
    const parts = [`${plural(inserted, "page")} added`];
    if (overwrite) parts.push(`${plural(updated, "page")} replaced with the starter version`);
    if (skipped) parts.push(`${plural(skipped, "page")} already there and left unchanged`);
    return { ok: true, message: `Done: ${parts.join(", ")}.` };
  } catch (err) {
    console.error("[admin] starter import failed:", err);
    return { ok: false, message: `Import failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}
