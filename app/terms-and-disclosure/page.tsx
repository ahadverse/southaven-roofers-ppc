import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getDoc } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const doc = getDoc("legal", "terms-and-disclosure");
  return doc ? pageMetadata({ title: doc.metaTitle, description: doc.description, path: "/terms-and-disclosure" }) : {};
}

export default function TermsPage() {
  return <LegalPage slug="terms-and-disclosure" />;
}
