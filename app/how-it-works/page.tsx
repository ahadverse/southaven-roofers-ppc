import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/CallButton";
import { CtaBand } from "@/components/Cta";
import { FaqList } from "@/components/FaqList";
import { HowItWorks } from "@/components/HowItWorks";
import { Icon } from "@/components/Icon";
import type { Faq } from "@/lib/content";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";
import { phone, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "How It Works | Southaven Roofers",
  description:
    "Southaven Roofers is a free service that connects Southaven, MS homeowners with independent local roofing contractors. Here's what happens when you call.",
  path: "/how-it-works",
});

const faqs: Faq[] = [
  {
    q: "Who will I be talking to when I call?",
    a: "Your call is answered by a participating independent roofing contractor that serves Southaven, or by their office staff. They can answer questions about your roof and schedule an inspection.",
  },
  {
    q: "Does it cost anything to use Southaven Roofers?",
    a: "No. Calling is free and so is the estimate. Southaven Roofers is paid by its marketing partners and participating contractors, never by homeowners.",
  },
  {
    q: "Am I obligated to hire the roofer I'm connected with?",
    a: "Not at all. You can ask questions, get an inspection and a written estimate, and then decide. You're always free to get other estimates too.",
  },
  {
    q: "Does Southaven Roofers do the roofing work?",
    a: "No. We're a connection service. The roofing contractor you speak with provides the estimate and performs any work directly under their own contract and warranty.",
  },
  {
    q: "How should I check out the contractor?",
    a: "Ask for their Mississippi State Board of Contractors license information (required for residential roofing jobs over $10,000), proof of liability and workers' compensation insurance, local references and a detailed written estimate. Our guide to choosing a roofer has a full checklist.",
  },
];

export default function HowItWorksPage() {
  const img = images["homeowner-phone-call"];
  return (
    <>
      <section className="hero-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:pt-10 lg:pb-16">
          <div>
            <Breadcrumbs items={[{ name: "How It Works", href: "/how-it-works" }]} />
            <h1 className="mt-4 animate-fade-up text-[2.2rem] leading-[1.1] font-extrabold text-ink sm:text-5xl">
              How Southaven Roofers works
            </h1>
            <p className="mt-5 animate-fade-up text-lg leading-relaxed text-slate-700 [animation-delay:120ms]">
              Finding a roofer you can trust shouldn&apos;t mean filling out forms, getting spammed by a dozen companies or waiting days
              for a call back. {site.name} keeps it simple: you make one phone call and you&apos;re connected with a local roofing
              contractor who serves Southaven.
            </p>
            <CallButton location="how-hero" size="lg" className="mt-7" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-100 shadow-card">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
              style={{ objectPosition: img.position }}
            />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <HowItWorks heading="Three simple steps" />
        </div>
      </section>

      <section className="bg-brand-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">What to expect on the call</h2>
            <ul className="mt-6 space-y-4">
              {[
                "Tell the roofer what you're seeing: a leak, missing shingles, hail or wind damage, or an aging roof.",
                "Mention if a storm caused the problem and whether you've contacted your insurance company.",
                "Share your address in Southaven and a good time for an inspection.",
                "Ask anything: materials, timelines, warranties, licensing and insurance.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-[17px] leading-relaxed text-slate-700">
                  <Icon name="check" className="mt-1 size-5 shrink-0 text-green-700" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] text-slate-600">
              Ready? Call <a href={phone.href} data-cta="how-inline" className="font-bold text-brand-700 underline">{phone.display}</a>.
              {site.callHours && <> Phone lines: {site.callHours}.</>}
            </p>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">Our promise to you</h2>
            <ul className="mt-5 space-y-4 text-[16px] leading-relaxed text-slate-700">
              <li>
                <strong className="text-ink">It&apos;s free.</strong> You never pay {site.name}. We&apos;re compensated by marketing
                partners and participating contractors when calls are connected.
              </li>
              <li>
                <strong className="text-ink">No forms, no spam.</strong> We don&apos;t collect your information through this website or
                sell it to a list of companies.
              </li>
              <li>
                <strong className="text-ink">You stay in control.</strong> Get the estimate, ask questions, compare other quotes and
                decide on your own timeline.
              </li>
              <li>
                <strong className="text-ink">Honest information.</strong> Our guides explain costs, insurance and red flags in plain
                English, so you can make a confident decision.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">Transparency about our service</h2>
          <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-slate-700">
            <p>{site.disclosure}</p>
            <p>
              Contractors who answer calls are independent businesses. We don&apos;t employ them, and we can&apos;t guarantee their
              work, pricing or availability. That&apos;s why we encourage every homeowner to verify the contractor&apos;s license and
              insurance, get a detailed written estimate and read the contract before signing. Our guide on{" "}
              <Link href="/how-to-choose-a-roofer-southaven" className="font-semibold text-brand-700 underline">
                how to choose a roofer in Southaven
              </Link>{" "}
              walks you through it. Full details are in our{" "}
              <Link href="/terms-and-disclosure" className="font-semibold text-brand-700 underline">
                Terms &amp; Disclosure
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-semibold text-brand-700 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <h2 className="mt-14 mb-6 text-3xl font-extrabold tracking-tight text-ink">Common questions</h2>
          <FaqList faqs={faqs} />
        </div>
      </section>

      <CtaBand location="how-band" />
    </>
  );
}
