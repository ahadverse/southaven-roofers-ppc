# Pending tasks: Admin panel (MongoDB)

_Last updated: 2026-10-15_

The admin panel work was stopped partway. **The production build currently fails** because
`app/admin/(panel)/content/[collection]/[id]/page.tsx` imports `components/admin/DocEditor`, which doesn't exist yet.

---

## Already done

- [x] MongoDB connection (`lib/db.ts`) with optional `MONGODB_DNS_SERVERS` workaround for local DNS problems
- [x] Atlas database connected and seeded: 23 pages + default settings (`npm run db:seed`)
- [x] Public site reads content from MongoDB, falls back to `content/*.md` if no database is configured (`lib/content.ts`)
- [x] Site settings (phone, call hours, contact email) from MongoDB with env fallback (`lib/settings.ts`)
- [x] Admin login: env credentials + signed httpOnly cookie (`lib/auth.ts`, `app/admin/(auth)/login`, `app/admin/actions.ts`)
- [x] Admin shell: sidebar, DB status banners (`app/admin/(panel)/layout.tsx`, `components/admin/AdminNav.tsx`)
- [x] Admin data layer: list / get / save / delete / validate / import / settings (`lib/admin-data.ts`)
- [x] Call-click tracking API, stored in MongoDB `events` (`app/api/track/route.ts`, `components/CallTracking.tsx`)
- [x] Stats aggregations (`lib/stats.ts`) and the import-starter-content action (`app/admin/(panel)/actions.ts`)
- [x] Content server actions: save, delete, preview (`app/admin/(panel)/content/actions.ts`)
- [x] Mobile "Back to top" button with smooth scroll (`components/BackToTop.tsx`)
- [x] Privacy policy updated for the click log (file + database), robots.txt blocks `/admin` and `/api/`
- [x] README and `.env.example` updated

---

## A. Content editor

- [ ] **1. Build `components/admin/DocEditor.tsx`** (client component). This is the main remaining piece:
  - Basics: title, slug (auto-generated from the title for new docs), published/draft, menu label, excerpt,
    order (services/guides), publish date + category (blog), icon (services)
  - SEO: SEO title and meta description with character counters, Google-style preview
  - Featured image picker (thumbnail grid)
  - Markdown body: toolbar (H2, H3, bold, link, list, `[[cta]]`, `[[image:key|Caption]]`),
    Write / Preview tabs (uses `previewAction`), word count
  - FAQs (add / remove / reorder), related pages (searchable checklist), sources (label + URL)
  - Sticky save bar, field errors + warnings, success toast, delete with confirm,
    unsaved-changes warning, read-only slug for legal pages
- [ ] **2. Review the editor page** `app/admin/(panel)/content/[collection]/[id]/page.tsx` (left half-finished)
- [ ] **3. Review the list page** `app/admin/(panel)/content/[collection]/page.tsx` (written, not tested)

## B. Dashboard

- [ ] **4. Build `app/admin/(panel)/page.tsx`** using `lib/stats.ts`:
  - KPI cards: today / last 7 days / last 30 days / all time, with % change vs the previous period
  - 30-day bar chart (plain SVG/CSS, accessible)
  - Top pages, top button placements, device split, referrers, recent clicks
  - Published / draft counts per content type (`getContentCounts`)
  - "Import starter content" card (and an overwrite option behind a confirm step)
  - Note that call-button taps are not connected calls (the network dashboard shows real calls)

## C. Settings

- [ ] **5. Build `app/admin/(panel)/settings/page.tsx` + `components/admin/SettingsForm.tsx`**:
  phone number (any US format, live formatted preview), call hours, contact email;
  show whether each value comes from the admin settings or the env default
- [ ] **6. Add `app/admin/(panel)/settings/actions.ts`** with `saveSettingsAction` (uses `saveSettings` in `lib/admin-data.ts`)

## D. Testing and integration

- [ ] **7.** `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass
- [ ] **8. End-to-end test against Atlas:**
  - [ ] Admin login / logout
  - [ ] Create a blog post, see it on the site, then delete it
  - [ ] Edit a service page and see the change live
  - [ ] Change the phone number and confirm every call button updates
  - [ ] Tap a call button and confirm the click appears on the dashboard
- [ ] **9.** Re-run `npm run check:seo`, mobile/desktop screenshots and Lighthouse (pages now read from the database)
- [ ] **10.** Check the "Back to top" button on a mobile screenshot

---

## E. Owner tasks (not code)

- [ ] **11. Change the MongoDB database user's password** in Atlas → Database Access
  (the old one was shared in a chat), then update `MONGODB_URI` in `.env.local`
- [ ] **12. Add these on Vercel** (Project → Settings → Environment Variables):
  `MONGODB_URI`, `MONGODB_DB`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
  Do **not** add `MONGODB_DNS_SERVERS` (local workaround only)
- [ ] **13. Atlas → Network Access:** allow `0.0.0.0/0` so Vercel can connect
