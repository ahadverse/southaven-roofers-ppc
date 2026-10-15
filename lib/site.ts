// Brand and site-wide text. The phone number, call hours and contact email are
// editable in the admin panel (see lib/settings.ts); env vars provide the defaults.

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "https://southavenroofers.com")
).replace(/\/$/, "");

export const site = {
  name: "Southaven Roofers",
  city: "Southaven",
  state: "MS",
  stateName: "Mississippi",
  county: "DeSoto County",
  zips: ["38671", "38672"],
  tagline: "Roof repair, replacement and storm damage help for Southaven, MS homeowners.",
  description:
    "Need a roofer in Southaven, MS? Call for a free estimate on roof repair, roof replacement, and hail or storm damage from local Southaven roofing pros.",
  // Shown in the footer of every page and on /terms-and-disclosure. Keep it.
  disclosure:
    "Southaven Roofers is a free service that connects homeowners with independent local roofing contractors. We do not perform roofing work ourselves. Calls are answered by a participating contractor, who provides the estimate and any work directly to you.",
  lastReviewed: "2026-10-14",
};

export type NavLink = { href: string; label: string };

export const mainNav: NavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/storm-damage-roof-repair", label: "Storm Damage" },
  { href: "/roof-replacement-cost-southaven", label: "Roof Cost" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/blog", label: "Blog" },
];

export const companyLinks: NavLink[] = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Roofing Blog" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-disclosure", label: "Terms & Disclosure" },
  { href: "/photo-credits", label: "Photo Credits" },
];

export const absoluteUrl = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;
