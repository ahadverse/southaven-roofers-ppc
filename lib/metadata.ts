import type { Metadata } from "next";
import type { Doc } from "@/lib/content";
import { getImage } from "@/lib/images";
import { site } from "@/lib/site";

const ogBase = { siteName: site.name, locale: "en_US" };

const defaultOgImage = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Roofer installing new shingles: roof repair and replacement in Southaven, MS",
};

export function docMetadata(doc: Doc): Metadata {
  const img = getImage(doc.image);
  return {
    title: { absolute: doc.metaTitle },
    description: doc.description,
    alternates: { canonical: doc.href },
    openGraph: {
      ...ogBase,
      type: doc.collection === "services" ? "website" : "article",
      url: doc.href,
      title: doc.metaTitle,
      description: doc.description,
      images: [{ url: img.src.src, width: img.src.width, height: img.src.height, alt: img.alt }],
      ...(doc.collection !== "services" && { publishedTime: doc.date, modifiedTime: doc.updated }),
    },
  };
}

/** Metadata for hand-written pages (home, FAQ, legal, etc.). */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    // A page-level openGraph object replaces the layout's, so repeat the shared fields here.
    openGraph: { ...ogBase, type: "website", url: path, title, description, images: [defaultOgImage] },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
