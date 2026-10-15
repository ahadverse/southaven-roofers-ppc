import { COLLECTIONS, getDb, isDbConfigured } from "@/lib/db";

/**
 * First-party call-button click logging for the admin dashboard.
 * Stores only: button location, page path, device type, referring site and time.
 * No IP address, cookie or caller information is stored.
 */

const BOT = /bot|crawler|spider|crawling|headless|lighthouse|preview|facebookexternalhit|slurp/i;
const clip = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|kindle|silk/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(request: Request) {
  // Only accept beacons sent by this site.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return new Response(null, { status: 403 });

  const ua = request.headers.get("user-agent") ?? "";
  if (!isDbConfigured() || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 2000) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const location = clip(body.location, 80).replace(/[^\w-]/g, "") || "unknown";
  const path = clip(body.path, 200);
  if (!path.startsWith("/")) return new Response(null, { status: 400 });
  let referrerHost = "";
  try {
    referrerHost = body.referrer ? new URL(String(body.referrer)).host.slice(0, 100) : "";
  } catch {
    referrerHost = "";
  }
  if (referrerHost === host) referrerHost = "";

  try {
    const db = await getDb();
    await db.collection(COLLECTIONS.events).insertOne({
      type: "call_click",
      location,
      path,
      device: deviceOf(ua),
      referrerHost,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[track] failed to store event:", err);
  }
  return new Response(null, { status: 204 });
}
