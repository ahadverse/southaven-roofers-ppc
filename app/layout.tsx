import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

// One variable font for everything keeps the page light. No preload: on slow mobile
// connections the hero image (LCP) gets the bandwidth first.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Southaven Roofers | Roof Repair & Replacement in Southaven, MS",
    template: "%s",
  },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Roofer installing new shingles on a Southaven-area home" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d2440",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${jakarta.variable} antialiased`}>
      <body id="top" className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
