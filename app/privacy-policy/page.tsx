import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getDoc } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const doc = getDoc("legal", "privacy-policy");
  return doc ? pageMetadata({ title: doc.metaTitle, description: doc.description, path: "/privacy-policy" }) : {};
}

export default function PrivacyPolicyPage() {
  return <LegalPage slug="privacy-policy" />;
}
