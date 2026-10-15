"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/** Sends a "call_click" event (with the button location) whenever a tel: link is tapped. */
export function CallTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (!link) return;
      track("call_click", {
        location: link.getAttribute("data-cta") ?? "unknown",
        path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
