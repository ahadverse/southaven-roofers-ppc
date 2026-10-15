// Post-build SEO check over the prerendered HTML in .next/server/app.
// Usage: npm run build && npm run check:seo
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, ".next", "server", "app");
if (!fs.existsSync(appDir)) {
  console.error("No build output found. Run `npm run build` first.");
  process.exit(1);
}

const envFile = path.join(root, ".env.local");
const env = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? env.match(/^NEXT_PUBLIC_PHONE_NUMBER=(.+)$/m)?.[1]?.trim();

const pages = new Map();
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html") && !entry.name.startsWith("_")) {
      const rel = path.relative(appDir, full).replace(/\\/g, "/").replace(/\.html$/, "");
      const route = rel === "index" ? "/" : `/${rel}`;
      pages.set(route, fs.readFileSync(full, "utf8"));
    }
  }
};
walk(appDir);

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const first = (html, re) => decode(html.match(re)?.[1] ?? "");

let errors = 0;
let warnings = 0;
const err = (r, m) => (errors++, console.log(`ERROR  ${r}: ${m}`));
const warn = (r, m) => (warnings++, console.log(`warn   ${r}: ${m}`));
const titles = new Map();
const descriptions = new Map();

for (const [route, html] of pages) {
  const title = first(html, /<title>([^<]*)<\/title>/);
  const description = first(html, /<meta name="description" content="([^"]*)"/);
  const canonical = first(html, /<link rel="canonical" href="([^"]*)"/);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;

  if (!title) err(route, "missing <title>");
  else if (title.length > 65) warn(route, `title ${title.length} chars: "${title}"`);
  if (!description) err(route, "missing meta description");
  else if (description.length > 160) warn(route, `description ${description.length} chars`);
  if (!canonical) err(route, "missing canonical");
  if (h1s !== 1) err(route, `${h1s} <h1> elements (expected 1)`);
  if (!/<meta property="og:image"/.test(html)) warn(route, "missing og:image");

  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\balt="/.test(img)) err(route, `<img> without alt: ${img.slice(0, 80)}`);
  }
  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json[1]);
    } catch {
      err(route, "invalid JSON-LD");
    }
  }
  for (const href of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const target = href[1].replace(/\/$/, "") || "/";
    if (target.startsWith("/_next") || /\.(svg|png|jpg|ico|xml|txt)$/.test(target)) continue;
    if (!pages.has(target)) err(route, `broken internal link ${href[1]}`);
  }
  const tels = [...html.matchAll(/href="tel:([^"]*)"/g)].map((m) => m[1]);
  if (!tels.length) warn(route, "no call (tel:) link");
  if (phone && tels.some((t) => t !== phone)) err(route, `tel: link does not match NEXT_PUBLIC_PHONE_NUMBER`);

  titles.set(title, [...(titles.get(title) ?? []), route]);
  descriptions.set(description, [...(descriptions.get(description) ?? []), route]);
}

for (const [t, routes] of titles) if (routes.length > 1) err(routes.join(", "), `duplicate title "${t}"`);
for (const routes of descriptions.values()) if (routes.length > 1) err(routes.join(", "), `duplicate description`);

console.log(`\nChecked ${pages.size} pages: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
