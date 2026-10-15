import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getDoc } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getDoc("legal", "privacy-policy");
  return doc ? pageMetadata({ title: doc.metaTitle, description: doc.description, path: "/privacy-policy" }) : {};
}

export default function PrivacyPolicyPage() {
  return <LegalPage slug="privacy-policy" />;
}
