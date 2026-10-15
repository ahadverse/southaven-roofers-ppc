"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";

const links: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: "home", exact: true },
  { href: "/admin/content/blog", label: "Blog posts", icon: "book" },
  { href: "/admin/content/guides", label: "Guides", icon: "file" },
  { href: "/admin/content/services", label: "Service pages", icon: "wrench" },
  { href: "/admin/content/legal", label: "Legal pages", icon: "shield" },
  { href: "/admin/settings", label: "Phone & settings", icon: "phone" },
];

export function AdminNav({ logout }: { logout: React.ReactNode }) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
              active ? "bg-white/10 text-white" : "text-brand-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon name={l.icon} className={`size-4.5 ${active ? "text-accent-400" : ""}`} />
            {l.label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-brand-200 hover:bg-white/5 hover:text-white"
      >
        <Icon name="arrowRight" className="size-4.5 -rotate-45" />
        View website
      </a>
      <div className="mt-1">{logout}</div>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-950 px-4 py-3 text-white lg:hidden">
        <span className="font-display font-extrabold">
          Southaven <span className="text-accent-400">Admin</span>
        </span>
        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          className="flex size-10 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <Icon name={open ? "close" : "menu"} className="size-5" />
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open && <div className="bg-brand-950 px-3 pb-4 lg:hidden">{nav}</div>}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-brand-950 px-4 py-6 lg:flex">
        <p className="font-display px-3 text-lg font-extrabold text-white">
          Southaven <span className="text-accent-400">Admin</span>
        </p>
        <p className="px-3 text-xs text-brand-300">Manage pages, settings &amp; stats</p>
        <div className="mt-8">{nav}</div>
      </aside>
    </>
  );
}
