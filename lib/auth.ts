import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
 * Single-owner admin login.
 * Credentials come from env (ADMIN_USERNAME / ADMIN_PASSWORD); the session is an HMAC-signed,
 * httpOnly cookie (SESSION_SECRET). No user table is needed for a one-person site.
 */

export const SESSION_COOKIE = "sr_admin";
const SESSION_DAYS = 7;

export function adminConfig() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  const problems: string[] = [];
  if (password.length < 10) problems.push("ADMIN_PASSWORD must be set (at least 10 characters).");
  if (secret.length < 32) problems.push("SESSION_SECRET must be set (at least 32 random characters).");
  return { username, password, secret, ready: problems.length === 0, problems };
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Constant-time credential check. */
export function checkCredentials(username: string, password: string): boolean {
  const cfg = adminConfig();
  if (!cfg.ready) return false;
  // Compare HMACs so length differences don't leak through timing.
  const u = safeEqual(sign(username, cfg.secret), sign(cfg.username, cfg.secret));
  const p = safeEqual(sign(password, cfg.secret), sign(cfg.password, cfg.secret));
  return u && p;
}

export async function createSession(username: string) {
  const cfg = adminConfig();
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = b64url(JSON.stringify({ u: username, exp }));
  const value = `${payload}.${sign(payload, cfg.secret)}`;
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<string | null> {
  const cfg = adminConfig();
  if (!cfg.ready) return null;
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, cfg.secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u: string; exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data.u;
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<string> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}
