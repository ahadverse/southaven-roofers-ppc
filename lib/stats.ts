import "server-only";
import type { Document } from "mongodb";
import { COLLECTION_LABELS } from "@/lib/admin-data";
import { CONTENT_COLLECTIONS, getCollection, hrefFor, type Collection } from "@/lib/content";
import { COLLECTIONS, getDb } from "@/lib/db";

/*
 * Call-button statistics for the admin dashboard.
 * Every tap on a tel: link is stored by app/api/track as
 * { type: "call_click", location, path, device, referrerHost, createdAt }.
 * Days are counted in Southaven time (America/Chicago). Everything returned here is plain JSON.
 */

export const STATS_TIMEZONE = "America/Chicago";

export type Device = "mobile" | "tablet" | "desktop";

export type PeriodTotal = {
  count: number;
  /** Count for the period of the same length just before this one. */
  previous: number;
  /** Rounded % change vs `previous`; null when the previous period had no taps. */
  changePct: number | null;
};

export type DailyPoint = {
  /** YYYY-MM-DD in Southaven time */
  date: string;
  count: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  isWeekend: boolean;
  isToday: boolean;
};

export type PageStat = { path: string; title: string | null; count: number };
export type PlacementStat = { location: string; label: string; context: string; count: number };
export type DeviceStat = { device: Device; label: string; count: number; pct: number };
export type ReferrerStat = { host: string; label: string; count: number };

export type ClickStats = {
  generatedAt: string;
  timezone: string;
  /** YYYY-MM-DD in Southaven time */
  today: string;
  totals: { today: number; last7: PeriodTotal; last30: PeriodTotal; allTime: number };
  /** ISO time of the first tap ever recorded, or null. */
  firstClickAt: string | null;
  /** The last 30 days (oldest first, today last), zero-filled. */
  daily: DailyPoint[];
  /** Breakdowns below cover the last 30 days. */
  topPages: PageStat[];
  topPlacements: PlacementStat[];
  devices: DeviceStat[];
  referrers: ReferrerStat[];
  /** Taps in the last 30 days without a referring site (typed address, app, bookmark or hidden by the browser). */
  noReferrer: number;
};

export type RecentClick = {
  id: string;
  createdAt: string;
  path: string;
  pageTitle: string | null;
  location: string;
  placement: string;
  context: string;
  device: Device;
  referrer: string | null;
};

export type ContentCounts = Record<Collection, { published: number; draft: number }>;

/* ------------------------------------------------------------------ */
/* Dates in Southaven time                                             */
/* ------------------------------------------------------------------ */

const ymdFormat = new Intl.DateTimeFormat("en-CA", { timeZone: STATS_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: STATS_TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

const ymdOf = (date: Date) => ymdFormat.format(date);

const splitYmd = (ymd: string) => ymd.split("-").map(Number) as [number, number, number];

/** Calendar arithmetic on a YYYY-MM-DD string (no timezone involved). */
function addDays(ymd: string, days: number): string {
  const [y, m, d] = splitYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

const weekdayOf = (ymd: string) => {
  const [y, m, d] = splitYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** Milliseconds the Southaven wall clock is ahead of UTC at `at` (negative: -5h or -6h). */
function zoneOffsetMs(at: Date): number {
  const p = Object.fromEntries(partsFormat.formatToParts(at).map((x) => [x.type, x.value]));
  const wall = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return wall - Math.floor(at.getTime() / 1000) * 1000;
}

/** The UTC instant of midnight at the start of `ymd` in Southaven. */
function startOfDay(ymd: string): Date {
  const [y, m, d] = splitYmd(ymd);
  const wallMidnight = Date.UTC(y, m - 1, d);
  const first = wallMidnight - zoneOffsetMs(new Date(wallMidnight));
  // Re-check once in case a daylight-saving switch sits between the guess and the answer.
  return new Date(wallMidnight - zoneOffsetMs(new Date(first)));
}

const changePct = (count: number, previous: number) => (previous > 0 ? Math.round(((count - previous) / previous) * 100) : null);

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

/** Site pages that aren't documents. */
const STATIC_PAGES: Record<string, string> = {
  "/": "Home page",
  "/services": "Services",
  "/how-it-works": "How it works",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/blog": "Blog",
};

type DocInfo = { title: string; navLabel: string };
type Titles = { byPath: Map<string, string>; byDoc: Map<string, DocInfo> };

/** Page titles for paths and `{collection}-{slug}` button prefixes (published documents, DB or starter files). */
async function loadTitles(): Promise<Titles> {
  const byPath = new Map(Object.entries(STATIC_PAGES));
  const byDoc = new Map<string, DocInfo>();
  try {
    const all = await Promise.all(CONTENT_COLLECTIONS.map((c) => getCollection(c)));
    for (const doc of all.flat()) {
      byPath.set(hrefFor(doc.collection, doc.slug), doc.title);
      byDoc.set(`${doc.collection}:${doc.slug}`, { title: doc.title, navLabel: doc.navLabel || doc.title });
    }
  } catch (err) {
    console.error("[stats] could not load page titles:", err);
  }
  return { byPath, byDoc };
}

const titleForPath = (titles: Titles, path: string) => titles.byPath.get(path.length > 1 ? path.replace(/\/+$/, "") : path) ?? null;

/** Buttons with a fixed location name. [what the button is, where it is] */
const EXACT_PLACEMENTS: Record<string, [string, string]> = {
  "sticky-mobile": ["Mobile sticky call bar", "Every page (phones)"],
  header: ["Header button", "Every page"],
  "header-icon": ["Header phone icon", "Every page (phones)"],
  topbar: ["Top bar phone number", "Every page"],
  footer: ["Footer button", "Every page"],
  "404": ["Page-not-found button", "404 page"],
  "home-hero": ["Hero button", "Home page"],
  "home-hero-card": ["Hero card button", "Home page"],
  "home-services-tile": ["Services call tile", "Home page"],
  "home-how": ["How-it-works section button", "Home page"],
  "home-storm": ["Storm damage section button", "Home page"],
  "home-cost": ["Roof cost section button", "Home page"],
  "home-areas": ["Service areas section button", "Home page"],
  "home-faq": ["FAQ phone link", "Home page"],
  "contact-number": ["Large phone number", "Contact page"],
  "contact-button": ["Call button", "Contact page"],
  "how-inline": ["Inline phone link", "How it works page"],
  unknown: ["Unlabelled phone link", "Unknown"],
};

/** Page names for the prefix of locations like `faq-hero` or `blog-band`. */
const PREFIX_CONTEXT: Record<string, string> = {
  home: "Home page",
  services: "Services page",
  blog: "Blog page",
  faq: "FAQ page",
  how: "How it works page",
  contact: "Contact page",
};

/** Button kinds recognised from the end of a location name. */
const SUFFIX_KINDS: [RegExp, string][] = [
  [/-band-number$/, "Bottom call band (phone number)"],
  [/-band$/, "Bottom call band"],
  [/-hero$/, "Hero button"],
  [/-sidebar$/, "Article sidebar"],
  [/-inline-\d+$/, "In-article call box"],
  [/-number$/, "Phone number link"],
  [/-button$/, "Call button"],
];

const DOC_LOCATION = /^(services|guides|blog|legal)-(.+?)-(hero|sidebar|band-number|band|inline-\d+)$/;

const humanize = (value: string) => {
  const text = value.replace(/[-_]+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : "Unknown";
};

function describePlacement(location: string, titles: Titles): { label: string; context: string } {
  const exact = EXACT_PLACEMENTS[location];
  if (exact) return { label: exact[0], context: exact[1] };

  const kind = SUFFIX_KINDS.find(([re]) => re.test(location))?.[1];

  const doc = location.match(DOC_LOCATION);
  if (doc && kind) {
    const collection = doc[1] as Collection;
    const info = titles.byDoc.get(`${collection}:${doc[2]}`);
    const singular = COLLECTION_LABELS[collection].singular;
    return { label: kind, context: info ? `${singular}: ${info.navLabel}` : `${singular}: /${doc[2]}` };
  }

  const prefix = location.split("-")[0];
  const context = PREFIX_CONTEXT[prefix] ?? "Other";
  return { label: kind ?? humanize(location), context };
}

const DEVICE_LABELS: Record<Device, string> = { mobile: "Phones", tablet: "Tablets", desktop: "Computers" };
const DEVICES: Device[] = ["mobile", "tablet", "desktop"];
const asDevice = (value: unknown): Device => (DEVICES.includes(value as Device) ? (value as Device) : "desktop");

const KNOWN_REFERRERS: [RegExp, string][] = [
  [/(^|\.)google\.[a-z.]+$/, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\.[a-z.]+$/, "Yahoo"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)nextdoor\.com$/, "Nextdoor"],
  [/(^|\.)yelp\.com$/, "Yelp"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "X (Twitter)"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)youtube\.com$/, "YouTube"],
];

const cleanHost = (host: string) => host.toLowerCase().replace(/^www\./, "").replace(/:\d+$/, "");
const referrerLabel = (host: string) => KNOWN_REFERRERS.find(([re]) => re.test(host))?.[1] ?? host;

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

type CountRow = { _id: string | null; count: number };
type PeriodRow = { today: number; last7: number; prev7: number; last30: number; prev30: number; withReferrer30: number };
type FacetResult = { periods: PeriodRow[]; daily: CountRow[]; pages: CountRow[]; locations: CountRow[]; devices: CountRow[]; referrers: CountRow[] };

const inRange = (from: Date, to?: Date) =>
  to ? { $and: [{ $gte: ["$createdAt", from] }, { $lt: ["$createdAt", to] }] } : { $gte: ["$createdAt", from] };
const countIf = (condition: Document) => ({ $sum: { $cond: [condition, 1, 0] } });
const topBy = (field: string | Document, limit: number): Document[] => [
  { $group: { _id: field, count: { $sum: 1 } } },
  { $sort: { count: -1, _id: 1 } },
  { $limit: limit },
];

async function eventsCollection() {
  const db = await getDb();
  return db.collection(COLLECTIONS.events);
}

/** Totals, the 30-day daily series and the 30-day breakdowns, in one indexed aggregation. */
export async function getClickStats(): Promise<ClickStats> {
  const now = new Date();
  const today = ymdOf(now);
  const startToday = startOfDay(today);
  const start7 = startOfDay(addDays(today, -6));
  const start14 = startOfDay(addDays(today, -13));
  const start30 = startOfDay(addDays(today, -29));
  const start60 = startOfDay(addDays(today, -59));
  const last30Only = { $match: { createdAt: { $gte: start30 } } };

  const events = await eventsCollection();
  const [facets, allTime, first, titles] = await Promise.all([
    events
      .aggregate<FacetResult>([
        // Uses the { createdAt: -1 } index; everything after this works on the last 60 days only.
        { $match: { createdAt: { $gte: start60 }, type: "call_click" } },
        {
          $facet: {
            periods: [
              {
                $group: {
                  _id: null,
                  today: countIf(inRange(startToday)),
                  last7: countIf(inRange(start7)),
                  prev7: countIf(inRange(start14, start7)),
                  last30: countIf(inRange(start30)),
                  prev30: countIf(inRange(start60, start30)),
                  withReferrer30: countIf({
                    $and: [inRange(start30), { $gt: [{ $strLenCP: { $ifNull: ["$referrerHost", ""] } }, 0] }],
                  }),
                },
              },
            ],
            daily: [
              last30Only,
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: STATS_TIMEZONE } }, count: { $sum: 1 } } },
            ],
            pages: [last30Only, ...topBy("$path", 10)],
            locations: [last30Only, ...topBy("$location", 10)],
            devices: [last30Only, ...topBy("$device", 5)],
            referrers: [
              { $match: { createdAt: { $gte: start30 }, referrerHost: { $nin: ["", null] } } },
              ...topBy({ $toLower: "$referrerHost" }, 40),
            ],
          },
        },
      ])
      .toArray(),
    events.countDocuments({ type: "call_click" }),
    events.find({ type: "call_click" }, { projection: { createdAt: 1 }, sort: { createdAt: 1 }, limit: 1 }).toArray(),
    loadTitles(),
  ]);

  const f: FacetResult = facets[0] ?? { periods: [], daily: [], pages: [], locations: [], devices: [], referrers: [] };
  const p: PeriodRow = f.periods[0] ?? { today: 0, last7: 0, prev7: 0, last30: 0, prev30: 0, withReferrer30: 0 };

  const perDay = new Map(f.daily.map((r) => [String(r._id), r.count]));
  const daily: DailyPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i - 29);
    const weekday = weekdayOf(date);
    return { date, count: perDay.get(date) ?? 0, weekday, isWeekend: weekday === 0 || weekday === 6, isToday: date === today };
  });

  const deviceCounts = new Map<Device, number>();
  for (const r of f.devices) deviceCounts.set(asDevice(r._id), (deviceCounts.get(asDevice(r._id)) ?? 0) + r.count);
  const deviceTotal = [...deviceCounts.values()].reduce((a, b) => a + b, 0);
  const devices: DeviceStat[] = DEVICES.map((device) => {
    const count = deviceCounts.get(device) ?? 0;
    return { device, label: DEVICE_LABELS[device], count, pct: deviceTotal ? Math.round((count / deviceTotal) * 100) : 0 };
  });

  // Merge www./m./l. variants of the same site (e.g. m.facebook.com + l.facebook.com → Facebook).
  const referrerMap = new Map<string, ReferrerStat>();
  for (const r of f.referrers) {
    const host = cleanHost(String(r._id ?? ""));
    if (!host) continue;
    const label = referrerLabel(host);
    const existing = referrerMap.get(label);
    if (existing) existing.count += r.count;
    else referrerMap.set(label, { host, label, count: r.count });
  }
  const referrers = [...referrerMap.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 10);

  const firstAt = first[0]?.createdAt;

  return {
    generatedAt: now.toISOString(),
    timezone: STATS_TIMEZONE,
    today,
    totals: {
      today: p.today,
      last7: { count: p.last7, previous: p.prev7, changePct: changePct(p.last7, p.prev7) },
      last30: { count: p.last30, previous: p.prev30, changePct: changePct(p.last30, p.prev30) },
      allTime,
    },
    firstClickAt: firstAt instanceof Date ? firstAt.toISOString() : null,
    daily,
    topPages: f.pages.map((r) => {
      const path = String(r._id ?? "");
      return { path, title: titleForPath(titles, path), count: r.count };
    }),
    topPlacements: f.locations.map((r) => {
      const location = String(r._id ?? "unknown");
      return { location, ...describePlacement(location, titles), count: r.count };
    }),
    devices,
    referrers,
    noReferrer: Math.max(0, p.last30 - p.withReferrer30),
  };
}

type EventDoc = { _id: { toHexString(): string }; location?: string; path?: string; device?: string; referrerHost?: string; createdAt?: Date };

/** The most recent taps, newest first. */
export async function getRecentClicks(limit = 15): Promise<RecentClick[]> {
  const events = await eventsCollection();
  const [rows, titles] = await Promise.all([
    events
      .find<EventDoc>({ type: "call_click" }, { sort: { createdAt: -1 }, limit: Math.min(Math.max(1, Math.floor(limit)), 100) })
      .toArray(),
    loadTitles(),
  ]);
  return rows.map((r) => {
    const location = r.location || "unknown";
    const path = r.path || "/";
    const host = r.referrerHost ? cleanHost(r.referrerHost) : "";
    const { label, context } = describePlacement(location, titles);
    return {
      id: r._id.toHexString(),
      createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(0)).toISOString(),
      path,
      pageTitle: titleForPath(titles, path),
      location,
      placement: label,
      context,
      device: asDevice(r.device),
      referrer: host ? referrerLabel(host) : null,
    };
  });
}

/** Published / draft document counts per content collection. */
export async function getContentCounts(): Promise<ContentCounts> {
  const db = await getDb();
  const rows = await db
    .collection(COLLECTIONS.docs)
    .aggregate<{ _id: { collection: string; status: string }; count: number }>([
      { $group: { _id: { collection: "$collection", status: "$status" }, count: { $sum: 1 } } },
    ])
    .toArray();
  const counts = Object.fromEntries(CONTENT_COLLECTIONS.map((c) => [c, { published: 0, draft: 0 }])) as ContentCounts;
  for (const r of rows) {
    const bucket = counts[r._id.collection as Collection];
    if (bucket) bucket[r._id.status === "draft" ? "draft" : "published"] += r.count;
  }
  return counts;
}
