import { absoluteUrl, phone, site, siteUrl } from "@/lib/site";
import type { Doc, Faq } from "@/lib/content";

// Structured data stays truthful: an Organization (a referral service), never a
// LocalBusiness with an invented street address, and no review/rating markup.

const orgId = `${siteUrl}/#organization`;

const southaven = {
  "@type": "City",
  name: "Southaven",
  containedInPlace: { "@type": "State", name: "Mississippi" },
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        url: siteUrl,
        logo: absoluteUrl("/icon.svg"),
        telephone: phone.e164,
        description: site.disclosure,
        areaServed: southaven,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: site.name,
        url: siteUrl,
        publisher: { "@id": orgId },
        inLanguage: "en-US",
      },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function serviceSchema(doc: Doc, imageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: doc.title,
    serviceType: doc.navLabel,
    description: doc.description,
    url: absoluteUrl(doc.href),
    image: imageUrl,
    areaServed: southaven,
    provider: { "@id": orgId },
  };
}

export function articleSchema(doc: Doc, imageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": doc.collection === "blog" ? "BlogPosting" : "Article",
    headline: doc.title,
    description: doc.description,
    image: imageUrl,
    datePublished: doc.date,
    dateModified: doc.updated,
    mainEntityOfPage: absoluteUrl(doc.href),
    author: { "@type": "Organization", name: `${site.name} editorial team`, url: siteUrl },
    publisher: { "@id": orgId },
  };
}
