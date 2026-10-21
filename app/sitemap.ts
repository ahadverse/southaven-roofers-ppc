import type { MetadataRoute } from "next";
import { getCollection } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, guides, blog] = await Promise.all([getCollection("services"), getCollection("guides"), getCollection("blog")]);
  const staticPages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/how-it-works", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
    { path: "/faq", priority: 0.6 },
    { path: "/blog", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.2 },
    { path: "/terms-and-disclosure", priority: 0.2 },
  ];

  const docs = [
    ...services.map((d) => ({ d, priority: 0.9 })),
    ...guides.map((d) => ({ d, priority: 0.8 })),
    ...blog.map((d) => ({ d, priority: 0.6 })),
  ];

  return [
    ...staticPages.map((p) => ({ url: absoluteUrl(p.path), lastModified: site.lastReviewed, priority: p.priority })),
    ...docs.map(({ d, priority }) => ({ url: absoluteUrl(d.href), lastModified: d.updated, priority })),
  ];
}
