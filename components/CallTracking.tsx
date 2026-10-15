"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * When a tel: link is tapped, record a "call_click" (button location + page) in:
 * - the site's own database, shown on the admin dashboard (/api/track), and
 * - Vercel Web Analytics, when deployed on Vercel.
 */
export function CallTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (!link) return;
      const location = link.getAttribute("data-cta") ?? "unknown";
      const path = window.location.pathname;
      const payload = JSON.stringify({ location, path, referrer: document.referrer });
      // sendBeacon survives the page switching to the phone dialer.
      if (!navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }))) {
        fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } }).catch(
          () => {}
        );
      }
      track("call_click", { location, path });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
