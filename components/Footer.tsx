import Link from "next/link";
import { CallButton } from "@/components/CallButton";
import { Logo } from "@/components/Logo";
import { getCollection } from "@/lib/content";
import { companyLinks, site } from "@/lib/site";

export function Footer() {
  const services = getCollection("services");
  const guides = getCollection("guides");
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-brand-950 text-brand-100">
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-accent-300 via-accent-500 to-brand-500" />
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden="true" className="absolute -top-40 left-1/3 -z-10 size-[28rem] rounded-full bg-brand-600/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">{site.tagline}</p>
          <CallButton location="footer" className="mt-6" />
          {site.callHours && <p className="mt-3 text-sm text-brand-200">Phone lines: {site.callHours}</p>}
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">Roofing services</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={s.href} className="transition-colors hover:text-accent-300">
                  {s.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">Homeowner guides</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="transition-colors hover:text-accent-300">
                  {g.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">Company</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-accent-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        {/* Extra bottom padding on mobile keeps the sticky call bar from covering the disclosure. */}
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-28 text-xs leading-relaxed text-brand-300 sm:px-6 md:pb-6">
          <p>
            <strong className="text-brand-100">Disclosure:</strong> {site.disclosure}{" "}
            <Link href="/terms-and-disclosure" className="underline hover:text-white">
              Read our full advertising disclosure
            </Link>
            .
          </p>
          <p className="mt-3">
            © {year} {site.name}. Serving {site.city}, {site.stateName} ({site.zips.join(", ")}). Photos are illustrative;{" "}
            <Link href="/photo-credits" className="underline hover:text-white">
              see photo credits
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
