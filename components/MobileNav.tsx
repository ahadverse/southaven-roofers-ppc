"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import type { NavLink } from "@/lib/site";

export function MobileNav({ links, services }: { links: NavLink[]; services: NavLink[] }) {
  const pathname = usePathname();
  // The menu is open only for the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex size-11 items-center justify-center rounded-lg text-ink hover:bg-brand-50"
      >
        <Icon name={open ? "close" : "menu"} className="size-6" />
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] animate-[fade-up_0.35s_cubic-bezier(0.16,1,0.3,1)_both] overflow-y-auto border-t border-brand-100 bg-white px-4 pt-3 pb-28 shadow-xl"
        >
          <ul className="divide-y divide-brand-100">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center justify-between py-3.5 text-base font-semibold text-ink">
                  {l.label}
                  <Icon name="chevronRight" className="size-4 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-slate-600 uppercase">Roofing services</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {services.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="block rounded-md py-2 text-sm text-brand-800 hover:underline">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
