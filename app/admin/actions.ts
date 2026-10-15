"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfig, checkCredentials, createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string };

// Basic brute-force protection (per server instance): 5 failures per 10 minutes per IP.
const failures = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 10 * 60 * 1000;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const cfg = adminConfig();
  if (!cfg.ready) return { error: "Admin login is not configured yet. See the setup notes below." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const record = failures.get(ip);
  if (record && record.until > now && record.count >= 5) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    const next = record && record.until > now ? { count: record.count + 1, until: record.until } : { count: 1, until: now + WINDOW_MS };
    failures.set(ip, next);
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong username or password." };
  }

  failures.delete(ip);
  await createSession(username);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
