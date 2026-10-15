import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docMetadata } from "@/lib/metadata";
import { ArticleLayout } from "@/components/ArticleLayout";
import { getCollection, getDoc } from "@/lib/content";

// New posts published in the admin panel render on first visit and are then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCollection("blog")).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc("blog", slug);
  return doc ? docMetadata(doc) : {};
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const doc = await getDoc("blog", slug);
  if (!doc) notFound();

  return (
    <ArticleLayout
      doc={doc}
      crumbs={[
        { name: "Blog", href: "/blog" },
        { name: doc.navLabel, href: doc.href },
      ]}
    />
  );
}
