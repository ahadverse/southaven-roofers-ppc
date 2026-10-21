// Validates every markdown file in /content: frontmatter, image keys, markers, internal links and lengths.
// Usage: node scripts/validate-content.mjs            (all files)
//        node scripts/validate-content.mjs blog       (one collection)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const only = process.argv[2];

const imageKeys = new Set(
  [...fs.readFileSync(path.join(root, "lib/images.ts"), "utf8").matchAll(/^\s{2}"?([a-z0-9-]+)"?: \{\n\s{4}src:/gm)].map((m) => m[1])
);
const iconNames = new Set(
  [...fs.readFileSync(path.join(root, "components/Icon.tsx"), "utf8").matchAll(/^\s{2}([a-zA-Z]+): [(<]/gm)].map((m) => m[1])
);

const collections = ["services", "guides", "blog", "legal"];
const slugs = Object.fromEntries(
  collections.map((c) => {
    const dir = path.join(contentDir, c);
    return [c, fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")) : []];
  })
);
const validPaths = new Set([
  "/",
  "/services",
  "/blog",
  "/how-it-works",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms-and-disclosure",
  ...slugs.services.map((s) => `/${s}`),
  ...slugs.guides.map((s) => `/${s}`),
  ...slugs.blog.map((s) => `/blog/${s}`),
]);
const allSlugs = new Set([...slugs.services, ...slugs.guides, ...slugs.blog]);

const banned = [
  /\bour (crew|crews|team of roofers|roofers|installers|technicians)\b/i,
  /\bwe (install|replace|repair|inspect)\b/i,
  /\byears in business\b/i,
  /\b\d+\+? years of experience\b/i,
  /\bfive[- ]star\b/i,
  /\bguarantee(d)?\b/i,
];

let errors = 0;
let warnings = 0;
const err = (f, m) => (errors++, console.log(`ERROR  ${f}: ${m}`));
const warn = (f, m) => (warnings++, console.log(`warn   ${f}: ${m}`));

for (const c of collections) {
  if (only && only !== c) continue;
  for (const slug of slugs[c]) {
    const file = `content/${c}/${slug}.md`;
    const { data, content } = matter(fs.readFileSync(path.join(root, file), "utf8"));
    for (const field of ["title", "metaTitle", "description"]) if (!data[field]) err(file, `missing "${field}"`);
    if (c !== "legal") {
      for (const field of ["navLabel", "excerpt", "image", "updated", "faqs", "related"]) if (!data[field]) err(file, `missing "${field}"`);
      if (c === "blog") for (const field of ["date", "category"]) if (!data[field]) err(file, `missing "${field}"`);
    }
    if (data.metaTitle && data.metaTitle.length > 60) warn(file, `metaTitle is ${data.metaTitle.length} chars (aim ≤ 60)`);
    if (data.description && (data.description.length > 160 || data.description.length < 110))
      warn(file, `description is ${data.description.length} chars (aim 120–158)`);
    if (data.image && !imageKeys.has(data.image)) err(file, `unknown image "${data.image}"`);
    if (data.icon && !iconNames.has(data.icon)) err(file, `unknown icon "${data.icon}"`);
    for (const r of data.related ?? []) if (!allSlugs.has(r)) warn(file, `related slug "${r}" does not exist (yet)`);
    for (const f of data.faqs ?? []) if (!f.q || !f.a) err(file, `faq entry missing q or a`);
    for (const s of data.sources ?? []) if (!s.label || !/^https:\/\//.test(s.url ?? "")) err(file, `bad source entry`);

    for (const m of content.matchAll(/\[\[image:([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g)) if (!imageKeys.has(m[1])) err(file, `unknown inline image "${m[1]}"`);
    for (const m of content.matchAll(/\]\((\/[^)#\s]*)/g)) {
      const p = m[1].replace(/\/$/, "") || "/";
      if (!validPaths.has(p)) warn(file, `internal link ${m[1]} does not exist (yet)`);
    }
    if (/^# /m.test(content)) err(file, `body must not contain an H1 ("# "); the title is the H1`);
    for (const re of banned) {
      const m = content.match(re);
      if (m) err(file, `honesty rule: avoid "${m[0]}" (we are a referral service, not the contractor)`);
    }
    const words = content.split(/\s+/).filter(Boolean).length;
    if (c !== "legal" && words < 900) warn(file, `only ${words} words`);
    console.log(`ok     ${file} (${words} words)`);
  }
}
console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
