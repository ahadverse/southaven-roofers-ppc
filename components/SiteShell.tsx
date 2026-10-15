import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { BackToTop } from "@/components/BackToTop";
import { CallTracking } from "@/components/CallTracking";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { StickyCallBar } from "@/components/StickyCallBar";
import { organizationSchema } from "@/lib/schema";
import { getSettings } from "@/lib/settings";

/** Public-site chrome: header, footer, mobile call bar, back-to-top, tracking. */
export async function SiteShell({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-white px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <StickyCallBar />
      <JsonLd data={organizationSchema(settings)} />
      <CallTracking />
      {/* Vercel Web Analytics only exists on Vercel deployments */}
      {process.env.VERCEL && <Analytics />}
    </>
  );
}
