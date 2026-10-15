import type { MetadataRoute } from "next";
import { getCollection } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/how-it-works", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
    { path: "/faq", priority: 0.6 },
    { path: "/blog", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.2 },
    { path: "/terms-and-disclosure", priority: 0.2 },
    { path: "/photo-credits", priority: 0.1 },
  ];

  const docs = [
    ...getCollection("services").map((d) => ({ d, priority: 0.9 })),
    ...getCollection("guides").map((d) => ({ d, priority: 0.8 })),
    ...getCollection("blog").map((d) => ({ d, priority: 0.6 })),
  ];

  return [
    ...staticPages.map((p) => ({ url: absoluteUrl(p.path), lastModified: site.lastReviewed, priority: p.priority })),
    ...docs.map(({ d, priority }) => ({ url: absoluteUrl(d.href), lastModified: d.updated, priority })),
  ];
}
