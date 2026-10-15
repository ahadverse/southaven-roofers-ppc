import Image from "next/image";
import { CallButton } from "@/components/CallButton";
import { Icon } from "@/components/Icon";
import { Eyebrow } from "@/components/ui";
import { images } from "@/lib/images";
import { phone, site } from "@/lib/site";

/** Compact call box placed inside long articles ([[cta]] marker). */
export function InlineCta({ text, location }: { text?: string; location: string }) {
  return (
    <aside className="not-prose reveal relative my-10 overflow-hidden rounded-3xl bg-linear-to-br from-brand-800 to-brand-950 p-6 text-white shadow-lift sm:p-7">
      <span aria-hidden="true" className="absolute -top-16 -right-10 size-48 rounded-full bg-accent-400/25 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl leading-snug font-extrabold">{text ?? "Talk to a local Southaven roofer today"}</p>
          <p className="mt-1.5 text-[15px] text-brand-200">
            One call to {phone.display} connects you with a roofer for a free, no-obligation estimate.
          </p>
        </div>
        <CallButton location={location} className="shrink-0" label="Free Estimate" />
      </div>
    </aside>
  );
}

/** Full-width closing call-to-action band. */
export function CtaBand({
  title = "Get a free roof estimate in Southaven",
  text = "Leaks, missing shingles, hail or wind damage, or a roof that has simply reached the end of its life: one call connects you with a local roofing contractor who can inspect it and tell you what it really needs.",
  location,
}: {
  title?: string;
  text?: string;
  location: string;
}) {
  const bg = images["storm-clouds-suburb"];
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <Image src={bg.src} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-35" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-950/90 to-brand-900/70" />
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute -right-24 -bottom-32 -z-10 size-[28rem] rounded-full bg-accent-500/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal">
          <Eyebrow light>Southaven, Mississippi</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold text-white sm:text-[2.6rem]">{title}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-100">{text}</p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {["Free, no-obligation estimates", "Storm & insurance claim help", "Local Southaven roofers"].map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-sm font-medium text-brand-100 ring-1 ring-white/10"
              >
                <Icon name="check" className="size-4 text-accent-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal-zoom rounded-3xl bg-white/[0.07] p-7 text-center shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
          <p className="text-sm font-semibold tracking-wider text-accent-300 uppercase">Call for a free estimate</p>
          <a
            href={phone.href}
            data-cta={`${location}-number`}
            className="font-display mt-2 block text-4xl font-extrabold tracking-tight text-white transition-colors hover:text-accent-300 sm:text-[2.6rem]"
          >
            {phone.display}
          </a>
          <CallButton location={location} size="lg" className="mt-6 w-full" showNumber={false} label="Tap to Call Now" />
          <p className="mt-3 text-xs text-brand-200">
            {site.callHours ? `Phone lines: ${site.callHours}` : "No forms. No spam. No obligation."}
          </p>
        </div>
      </div>
    </section>
  );
}
