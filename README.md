# Southaven Roofers

A fast, SEO-optimized roofing website for **Southaven, Mississippi**, built to generate phone calls for a pay-per-call network. Built with Next.js 16, React 19 and Tailwind CSS 4. Every page is prerendered as static HTML.

---

## Quick start (on your computer)

```bash
npm install
cp .env.example .env.local      # then edit the values
npm run dev                     # open http://localhost:3000
```

Before publishing, run:

```bash
npm run build                   # production build (fails if the phone number is missing)
npm run check:seo               # checks titles, descriptions, H1s, alt text, links, phone links
node scripts/validate-content.mjs   # checks the markdown content files
```

---

## Changing the phone number

The phone number is **never typed into the pages**. It comes from one environment variable:

| Variable | Required | Example |
|---|---|---|
| `NEXT_PUBLIC_PHONE_NUMBER` | Yes | `+16625550100` (E.164: `+1` then 10 digits) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://southavenroofers.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Recommended | `contact@southavenroofers.com` |
| `NEXT_PUBLIC_CALL_HOURS` | Optional | `Mon–Sat, 7am–7pm` (only if your network confirms the hours) |

**On Vercel:** Project → Settings → Environment Variables → edit `NEXT_PUBLIC_PHONE_NUMBER` → Deployments → **Redeploy**.
The site is static, so a new number only appears after a redeploy.

---

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repo (Next.js is detected automatically).
3. Add the environment variables above, then click **Deploy**.
4. Add your domain under **Settings → Domains** and point DNS to Vercel.
5. Optional: enable **Analytics** in the Vercel dashboard. The site already sends a `call_click` event (with the button location) every time someone taps a call button.

> **Important:** Vercel's free *Hobby* plan is for non-commercial use only. A pay-per-call site is commercial, so use **Vercel Pro**, or deploy the same code for free on Cloudflare Pages or Netlify.

---

## Editing content (no coding needed)

All articles are Markdown files:

| Folder | URL | What it is |
|---|---|---|
| `content/services/` | `/roof-repair` | Service pages (11) |
| `content/guides/` | `/roof-replacement-cost-southaven` | In-depth guides (4) |
| `content/blog/` | `/blog/what-to-do-after-hail-storm` | Blog posts (6) |
| `content/legal/` | `/privacy-policy` | Privacy policy & terms |

Each file starts with a settings block (frontmatter):

```yaml
---
title: "Page heading (H1)"
metaTitle: "Google title, max 60 characters"
description: "Google description, 120–158 characters"
navLabel: "Short menu label"
excerpt: "Short teaser under the heading and on cards"
image: roofer-nail-gun-shingles      # a key from lib/images.ts
updated: 2026-10-14
date: 2026-09-18                     # blog only
category: "Storm Damage"             # blog only
related: [roof-repair, roof-inspection]
faqs:
  - q: "Question?"
    a: "Answer."
---
```

Inside the text you can place:

- `[[cta]]` or `[[cta|Custom headline]]`: a "call now" box
- `[[image:hailstones|Optional caption]]`: a photo (keys are listed in `lib/images.ts`)

**To add a blog post:** copy an existing file in `content/blog/`, rename it (the file name becomes the URL), edit it, run `node scripts/validate-content.mjs blog`, and redeploy. It appears automatically on the blog page, in the sitemap and in "Keep reading" links.

Home, How It Works, Contact and FAQ are in `app/` (`app/page.tsx`, `app/faq/page.tsx`, and so on).

---

## Honesty & compliance (please keep)

This site is a **referral service**, not a roofing company. To protect your payouts, your Google rankings and your visitors:

- Keep the **disclosure** in the footer and the Terms & Disclosure page (`lib/site.ts`, `content/legal/`).
- Don't add fake reviews, testimonials, "our crew" photos, a street address you don't staff, license numbers, or years in business.
- Don't create a Google Business Profile for an address where no one works. It violates Google's rules and gets suspended.
- Before launch, confirm with your network: are calls recorded? Do participating roofers offer free estimates? Update `content/legal/` if anything differs.
- Have a lawyer review the privacy policy and terms if possible.

---

## Photos

All photos are real and free to use: Pexels/Unsplash licenses, U.S. government public domain (FEMA, USACE), and two Creative Commons BY-SA images that require credit (shown on `/photo-credits`). Credits live in `lib/images.ts`. To add a photo, put a JPG (about 2000px wide) in `assets/images/`, import it in `lib/images.ts` with alt text and credit, and use its key.

---

## After launch (SEO checklist)

1. Add the site to **Google Search Console** and **Bing Webmaster Tools**, and submit `/sitemap.xml`.
2. Test a few pages in Google's **Rich Results Test** (FAQ, breadcrumbs, article markup).
3. Check **PageSpeed Insights** on mobile for the home page and a service page.
4. Publish a new, genuinely useful local article every 2–4 weeks (spring storm season is the best time).
5. Earn local links: Southaven/DeSoto community sites, local news storm coverage, homeowner associations.
