import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/CallButton";
import { Icon, type IconName } from "@/components/Icon";
import { pageMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact Southaven Roofers | Call for a Free Roof Estimate",
  description:
    "Call Southaven Roofers to be connected with a local roofing contractor in Southaven, MS for a free estimate on roof repair, replacement or storm damage.",
  path: "/contact",
});

const reasons: { icon: IconName; title: string; href: string }[] = [
  { icon: "droplet", title: "My roof is leaking", href: "/roof-leak-repair" },
  { icon: "hail", title: "Hail or wind damaged my roof", href: "/storm-damage-roof-repair" },
  { icon: "replace", title: "I need a new roof", href: "/roof-replacement" },
  { icon: "alert", title: "It's an emergency", href: "/emergency-roof-repair" },
  { icon: "search", title: "I want an inspection", href: "/roof-inspection" },
  { icon: "file", title: "I'm filing an insurance claim", href: "/roof-insurance-claims" },
];

export default async function ContactPage() {
  const { phone, callHours, contactEmail } = await getSettings();
  return (
    <>
      <section className="hero-surface">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6 lg:pt-10 lg:pb-20">
          <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h1 className="animate-fade-up text-[2.2rem] leading-[1.1] font-extrabold text-ink sm:text-5xl">
                Talk to a local Southaven roofer
              </h1>
              <p className="mt-5 animate-fade-up text-lg leading-relaxed text-slate-700 [animation-delay:120ms]">
                The fastest way to get help is a phone call. You&apos;ll be connected with an independent roofing contractor that serves
                Southaven, Mississippi, who can answer your questions and set up a free inspection and estimate.
              </p>
              <div className="relative mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-brand-800 to-brand-950 p-6 text-white shadow-lift sm:p-8">
                <p className="text-sm font-semibold tracking-wider text-accent-400 uppercase">Call for a free estimate</p>
                <a href={phone.href} data-cta="contact-number" className="mt-2 block text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {phone.display}
                </a>
                <p className="mt-3 text-brand-200">
                  {callHours ? `Phone lines: ${callHours}.` : "Tap the number to call from your phone."} Serving ZIP codes{" "}
                  {site.zips.join(" & ")}.
                </p>
                <CallButton location="contact-button" size="lg" className="mt-6" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-ink">What do you need help with?</h2>
              <p className="mt-2 text-slate-600">Read up first, or just call and describe the problem.</p>
              <ul className="mt-5 space-y-3">
                {reasons.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3.5 font-semibold text-ink shadow-card hover:border-brand-300"
                    >
                      <Icon name={r.icon} className="size-5 text-brand-600" />
                      <span className="flex-1">{r.title}</span>
                      <Icon name="chevronRight" className="size-4 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 text-[16px] leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Questions about this website?</h2>
          <p className="mt-3">
            The phone number above goes to participating roofing contractors. For questions about this website, our{" "}
            <Link href="/privacy-policy" className="font-semibold text-brand-700 underline">
              privacy policy
            </Link>{" "}
            or our{" "}
            <Link href="/terms-and-disclosure" className="font-semibold text-brand-700 underline">
              terms and disclosure
            </Link>
            , email{" "}
            <a href={`mailto:${contactEmail}`} className="font-semibold text-brand-700 underline">
              {contactEmail}
            </a>
            .
          </p>
          <p className="mt-4 text-sm text-slate-600">{site.disclosure}</p>
        </div>
      </section>
    </>
  );
}
