import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin | Southaven Roofers" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-slate-50 text-ink">{children}</div>;
}
