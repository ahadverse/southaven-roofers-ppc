import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/CallButton";
import { CtaBand } from "@/components/Cta";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import type { Faq } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { faqSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Roofing FAQ for Southaven, MS Homeowners | Southaven Roofers",
  description:
    "Answers to common roofing questions in Southaven, MS: roof costs, repair vs. replacement, hail and insurance claims, licensing and how our free service works.",
  path: "/faq",
});

const groups: { title: string; id: string; faqs: Faq[] }[] = [
  {
    title: "About our service",
    id: "service",
    faqs: [
      {
        q: "What is Southaven Roofers?",
        a: "Southaven Roofers is a free service that connects Southaven, Mississippi homeowners with independent local roofing contractors. We publish helpful roofing information and a phone number; when you call, a participating contractor answers and can provide a free estimate. We don't perform roofing work ourselves.",
      },
      {
        q: "Is there any cost or obligation?",
        a: "No. Calling is free, the estimate is free and you're never obligated to hire anyone. We're compensated by marketing partners and participating contractors, not by homeowners.",
      },
      {
        q: "Will I get calls from lots of companies?",
        a: "No. There are no forms on this site. You make one call and talk with one roofing contractor. You decide whether to continue, and you're free to get other estimates.",
      },
    ],
  },
  {
    title: "Costs & estimates",
    id: "costs",
    faqs: [
      {
        q: "How much does a roof replacement cost in Southaven?",
        a: "Most homes fall in the several-thousand-dollar range. This Old House’s 2026 Mississippi data puts the average roof replacement at about $7,763, with most projects between $6,164 and $18,621. Size, pitch, layers, decking repairs and materials can push your price lower or higher, so only an on-site inspection gives a real number.",
      },
      {
        q: "How much does a roof repair cost?",
        a: "Small repairs, like replacing a few shingles or a cracked pipe boot, usually cost a fraction of a replacement. The price depends on access, roof pitch, materials and whether the decking underneath is damaged.",
      },
      {
        q: "What should a good roofing estimate include?",
        a: "The shingle or metal product and color, underlayment and ice-and-water membrane, flashing, pipe boots, drip edge, ventilation, a per-sheet decking price, permits, disposal, cleanup, payment schedule and written warranty terms.",
      },
    ],
  },
  {
    title: "Repair or replace",
    id: "repair-replace",
    faqs: [
      {
        q: "How do I know if I need a new roof or just a repair?",
        a: "Repairs make sense for younger roofs with damage in one area. Replacement is usually the better value when the roof is around 20 years old or more, shows widespread curling or granule loss, keeps leaking in new places, or has storm damage across several slopes.",
      },
      {
        q: "How long does a roof last in Mississippi?",
        a: "Architectural asphalt shingles commonly last roughly 20 to 30 years, three-tab shingles less, and metal roofs 40 years or more. Heat, sun, ventilation and storms all affect real-world lifespan.",
      },
      {
        q: "Can new shingles be installed over old ones?",
        a: "Sometimes, but most roofers recommend a full tear-off so the decking can be inspected and repaired, and so flashing and underlayment are installed correctly.",
      },
    ],
  },
  {
    title: "Storms, hail & insurance",
    id: "storms",
    faqs: [
      {
        q: "Does homeowners insurance cover hail damage to my roof?",
        a: "Most standard policies cover sudden damage from hail and wind, subject to your deductible. They don't cover normal wear and tear. Read your policy or ask your agent about your wind/hail deductible and whether you have replacement cost or actual cash value coverage.",
      },
      {
        q: "Should I call my insurance company or a roofer first?",
        a: "Many homeowners get a free roof inspection first to confirm whether there's real storm damage and whether it likely exceeds the deductible. Either way, report damage promptly; policies generally require timely notice.",
      },
      {
        q: "Is it okay for a roofer to pay my deductible?",
        a: "No. Offers to waive, cover or hide your deductible are a red flag and can amount to insurance fraud. A reputable roofer won't make that offer.",
      },
      {
        q: "What should I do right after a storm damages my roof?",
        a: "Stay safe, stay off the roof, contain any leaks inside, photograph damage from the ground, and arrange emergency tarping if water is coming in. Then get an inspection and report the damage to your insurer.",
      },
    ],
  },
  {
    title: "Hiring a roofer",
    id: "hiring",
    faqs: [
      {
        q: "Do roofers need a license in Mississippi?",
        a: "Mississippi requires a license from the Mississippi State Board of Contractors for residential roofing jobs over $10,000. Ask for license details and proof of insurance and verify them yourself.",
      },
      {
        q: "How can I avoid storm chasers?",
        a: "Be cautious with door-to-door crews after storms. Verify the license and insurance, ask for a local address and references, don't sign anything on the spot, avoid large upfront payments, and never sign over control of your insurance claim without reading it carefully.",
      },
      {
        q: "Do I need a permit to replace my roof in Southaven?",
        a: "Requirements can change, so check with the City of Southaven's building department or ask your contractor, who should know the current rules and pull any required permit.",
      },
    ],
  },
];

export default function FaqPage() {
  const all = groups.flatMap((g) => g.faqs);
  return (
    <>
      <section className="hero-surface">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pt-10">
          <Breadcrumbs items={[{ name: "FAQ", href: "/faq" }]} />
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <h1 className="animate-fade-up text-[2.2rem] leading-[1.1] font-extrabold text-ink sm:text-5xl">
                Roofing questions, answered
              </h1>
              <p className="mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-700 [animation-delay:120ms]">
                Straight answers to the questions Southaven homeowners ask most about roof costs, repairs, storm damage, insurance and
                hiring a contractor. Don&apos;t see yours? Call and ask a local roofer.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <CallButton location="faq-hero" />
            </div>
          </div>
          <nav aria-label="FAQ topics" className="mt-8 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
              >
                {g.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {groups.map((g) => (
          <section key={g.id} className="mb-12">
            <h2 id={g.id} className="mb-5 text-2xl font-extrabold tracking-tight text-ink">
              {g.title}
            </h2>
            <FaqList faqs={g.faqs} withSchema={false} />
          </section>
        ))}
        <p className="text-[15px] text-slate-600">
          Want more detail? Read the{" "}
          <Link href="/roof-replacement-cost-southaven" className="font-semibold text-brand-700 underline">
            roof cost guide
          </Link>
          , the{" "}
          <Link href="/hail-damage-insurance-claim-guide" className="font-semibold text-brand-700 underline">
            hail claim guide
          </Link>{" "}
          or{" "}
          <Link href="/how-to-choose-a-roofer-southaven" className="font-semibold text-brand-700 underline">
            how to choose a roofer
          </Link>
          .
        </p>
      </div>
      <JsonLd data={faqSchema(all)} />
      <CtaBand location="faq-band" />
    </>
  );
}
