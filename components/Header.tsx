import Link from "next/link";
import { CallButton } from "@/components/CallButton";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { getCollection } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { mainNav } from "@/lib/site";

export async function Header() {
  const [serviceDocs, { phone }] = await Promise.all([getCollection("services"), getSettings()]);
  const services = serviceDocs.map((s) => ({ href: s.href, label: s.navLabel }));

  return (
    <header className="header-elevate sticky top-0 z-50 border-b border-brand-100/70 bg-white/95 backdrop-blur-md">
      <div className="hidden bg-linear-to-r from-brand-950 via-brand-900 to-brand-800 text-brand-100 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[13px] sm:px-6">
          <p className="flex items-center gap-2">
            <Icon name="pin" className="size-3.5 text-accent-400" />
            Helping homeowners across Southaven, MS 38671 &amp; 38672
          </p>
          <p className="flex items-center gap-2">
            <Icon name="hail" className="size-3.5 text-accent-400" />
            Storm or hail damage?{" "}
            <a href={phone.href} data-cta="topbar" className="font-semibold text-white underline-offset-2 hover:underline">
              Call {phone.display}
            </a>
          </p>
        </div>
      </div>

      <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative rounded-lg px-3.5 py-2 text-[15px] font-semibold text-brand-900 transition-colors after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent-500 after:transition-transform after:duration-300 hover:text-brand-700 hover:after:scale-x-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CallButton location="header" label="Free Estimate" />
          </div>
          <a
            href={phone.href}
            data-cta="header-icon"
            className="pulse-ring size-11 items-center justify-center rounded-xl bg-linear-to-b from-accent-300 to-accent-400 text-ink shadow-glow sm:hidden"
          >
            <Icon name="phone" className="m-auto size-5" />
            <span className="sr-only">Call {phone.display}</span>
          </a>
          <MobileNav links={mainNav} services={services} />
        </div>
      </div>
    </header>
  );
}
