import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/ArticleLayout";
import { getCollection, getPageDoc } from "@/lib/content";
import { docMetadata } from "@/lib/metadata";

// Services and guides live at the top level, e.g. /roof-repair and /roof-replacement-cost-southaven.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...getCollection("services"), ...getCollection("guides")].map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPageDoc(slug);
  return doc ? docMetadata(doc) : {};
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const doc = getPageDoc(slug);
  if (!doc) notFound();

  const crumbs =
    doc.collection === "services"
      ? [
          { name: "Services", href: "/services" },
          { name: doc.navLabel, href: doc.href },
        ]
      : [
          { name: "Guides", href: "/blog" },
          { name: doc.navLabel, href: doc.href },
        ];

  return <ArticleLayout doc={doc} crumbs={crumbs} />;
}
