import "server-only";
import { cache } from "react";
import { COLLECTIONS, getDb, isDbConfigured } from "@/lib/db";

export type PhoneParts = { e164: string; href: string; display: string };

export type SiteSettings = {
  phone: PhoneParts;
  callHours: string;
  contactEmail: string;
};

/** Settings as stored in MongoDB (single document with _id "site"). */
export type StoredSettings = {
  phoneNumber?: string;
  callHours?: string;
  contactEmail?: string;
  updatedAt?: Date;
};

const US_PHONE = /^\+1\d{10}$/;

/** Accepts "+16625550100", "662-555-0100", "(662) 555 0100" etc. Returns E.164 or null. */
export function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return null;
  const e164 = `+1${ten}`;
  return US_PHONE.test(e164) ? e164 : null;
}

export function phoneParts(e164: string): PhoneParts {
  const d = e164.replace(/\D/g, "").slice(-10);
  return { e164, href: `tel:${e164}`, display: `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` };
}

/** Defaults come from environment variables (validated in next.config.ts). */
export function envSettings(): SiteSettings {
  return {
    phone: phoneParts(process.env.NEXT_PUBLIC_PHONE_NUMBER ?? ""),
    callHours: process.env.NEXT_PUBLIC_CALL_HOURS ?? "",
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@southavenroofers.com",
  };
}

export async function readStoredSettings(): Promise<StoredSettings> {
  if (!isDbConfigured()) return {};
  const db = await getDb();
  const doc = await db.collection<StoredSettings & { _id: string }>(COLLECTIONS.settings).findOne({ _id: "site" });
  return doc ?? {};
}

/**
 * Site-wide settings: values saved in the admin panel (MongoDB) override the env defaults.
 * If the database is unreachable the env defaults are used, so the site never loses its phone number.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const base = envSettings();
  try {
    const stored = await readStoredSettings();
    const phone = stored.phoneNumber && US_PHONE.test(stored.phoneNumber) ? phoneParts(stored.phoneNumber) : base.phone;
    return {
      phone,
      callHours: stored.callHours?.trim() || base.callHours,
      contactEmail: stored.contactEmail?.trim() || base.contactEmail,
    };
  } catch (err) {
    console.error("[settings] falling back to env defaults:", err);
    return base;
  }
});
