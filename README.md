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
npm run db:seed                 # copy the starter content into MongoDB (first time only)
npm run check:seo               # checks titles, descriptions, H1s, alt text, links, phone links
node scripts/validate-content.mjs   # checks the markdown content files
```

---

## Admin panel (/admin)

Log in at **`/admin`** with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from your environment variables. From there you can:

- **Write and edit** blog posts, guides, service pages and the legal pages (SEO title/description counters, image picker, FAQs, related pages, sources, live preview, draft/published).
- **Change the phone number**, call hours and contact email (**Phone & settings**). Every call button updates within seconds; no redeploy needed.
- **See call-button stats**: taps per day, top pages, top buttons, devices and referrers.

Everything is stored in **MongoDB** (`MONGODB_URI`). When you save, pages are rebuilt automatically on their next visit, so the site stays static and fast.

> Call-button taps are not the same as connected calls. Your pay-per-call network's dashboard shows real calls and payouts.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_PHONE_NUMBER` | Yes | Default/fallback number, E.164 (`+16625550100`). The admin setting overrides it. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://southavenroofers.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Recommended | Default contact email (editable in admin). |
| `NEXT_PUBLIC_CALL_HOURS` | Optional | Only if your network confirms the hours (editable in admin). |
| `MONGODB_URI` | For admin | MongoDB Atlas connection string. |
| `MONGODB_DB` | Optional | Database name, default `southaven_roofers`. |
| `ADMIN_USERNAME` | For admin | Default `admin`. |
| `ADMIN_PASSWORD` | For admin | 10+ characters. |
| `SESSION_SECRET` | For admin | 32+ random characters (signs the login cookie). |
| `MONGODB_DNS_SERVERS` | Local only | `8.8.8.8,1.1.1.1` if you get `querySrv ECONNREFUSED` on your computer. Don't set it on Vercel. |

### MongoDB Atlas setup

1. Create a free cluster at mongodb.com/atlas, then a **database user** (username + password).
2. **Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0)** so Vercel can connect.
3. **Connect → Drivers**, copy the `mongodb+srv://…` string into `MONGODB_URI`.
4. Load the starter content once: `npm run db:seed` (or click **Import starter content** on the admin dashboard).

---

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repo (Next.js is detected automatically).
3. Add the environment variables above (including `MONGODB_URI`, `ADMIN_PASSWORD` and `SESSION_SECRET`), then click **Deploy**.
4. Add your domain under **Settings → Domains** and point DNS to Vercel.
5. Optional: enable **Analytics** in the Vercel dashboard. The site already sends a `call_click` event (with the button location) every time someone taps a call button.

> **Important:** Vercel's free *Hobby* plan is for non-commercial use only. A pay-per-call site is commercial, so use **Vercel Pro**, or deploy the same code for free on Cloudflare Pages or Netlify.

---

## Editing content

Use the **admin panel** for day-to-day editing. The Markdown files in `content/` are the **starter content**: they're imported into MongoDB once, and they're what the site shows if no database is configured. After importing, changes to `content/` files don't appear on the site unless you re-import with `npm run db:seed -- --overwrite` (which replaces admin edits).

Inside an article body you can place:

- `[[cta]]` or `[[cta|Custom headline]]`: a "call now" box
- `[[image:hailstones|Optional caption]]`: a photo (the editor's image picker lists every key)

Home, How It Works, Contact and FAQ are coded pages in `app/(site)/`.

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
