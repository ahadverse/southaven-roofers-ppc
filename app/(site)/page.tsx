import Image from "next/image";
import Link from "next/link";
import { CallButton, PhoneLink } from "@/components/CallButton";
import { PostCard, ServiceTile } from "@/components/Cards";
import { CtaBand } from "@/components/Cta";
import { FaqList } from "@/components/FaqList";
import { HowItWorks } from "@/components/HowItWorks";
import { Icon, type IconName } from "@/components/Icon";
import { Eyebrow, FloatingBadge, IconChip, SectionHeader } from "@/components/ui";
import { getCollection, type Faq } from "@/lib/content";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Southaven Roofers | Roof Repair & Replacement in Southaven, MS",
  description: site.description,
  path: "/",
});

const trust: { icon: IconName; title: string; text: string }[] = [
  { icon: "clipboard", title: "Free estimates", text: "Inspection and written estimate at no cost, with no obligation." },
  { icon: "pin", title: "Local to Southaven", text: "Roofers who work in DeSoto County and know its weather." },
  { icon: "hail", title: "Storm damage help", text: "Hail and wind damage documented for your insurance claim." },
  { icon: "phone", title: "One simple call", text: "No forms, no spam. Just talk to a roofer about your roof." },
];

// Every figure here is sourced (see the note under the strip).
const stats: { value: string; label: string }[] = [
  { value: "57,000+", label: "Southaven residents, third-largest city in Mississippi" },
  { value: "Apr–Jun", label: "Peak severe-storm season in the Mid-South" },
  { value: "$7,763", label: "Average Mississippi roof replacement in 2026" },
  { value: "$10,000", label: "Roofing jobs above this need a state-licensed contractor" },
];

const weather: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "hail",
    title: "Spring hail",
    text: "Spring is peak storm season around Southaven. Hail bruises shingles and strips their protective granules, often without any damage visible from the ground.",
  },
  {
    icon: "wind",
    title: "Straight-line winds",
    text: "Severe thunderstorms can push winds strong enough to lift shingles, break their seals and drop limbs from the mature trees that shade many Southaven neighborhoods.",
  },
  {
    icon: "sun",
    title: "Heat & humidity",
    text: "Long, hot Mississippi summers bake shingles from above while poorly ventilated attics cook them from below. Humidity also feeds the algae streaks common on Southern roofs.",
  },
  {
    icon: "droplet",
    title: "Heavy rain",
    text: "The area typically sees more than 50 inches of rain a year, often in intense downpours that find every cracked pipe boot, loose flashing seam and missing shingle.",
  },
];

const neighborhoods = [
  "Greenbrook",
  "Deerchase",
  "Carriage Hills",
  "Central Gardens",
  "Brentwood Farms",
  "Dickens Place",
  "Lakes of Nicholas",
  "Greenbriar Lakes",
  "Snowden Grove area",
];

const roads = ["Goodman Rd", "Airways Blvd", "Getwell Rd", "Church Rd", "Stateline Rd", "Tchulahoma Rd", "Highway 51"];

const homeFaqs: Faq[] = [
  {
    q: "How does Southaven Roofers work?",
    a: "Southaven Roofers is a free service that connects homeowners with independent local roofing contractors. When you call, you're connected with a participating roofer who can answer questions, inspect your roof and give you a free estimate. You decide whether to hire them.",
  },
  {
    q: "Is the roof inspection and estimate really free?",
    a: "Yes. There's no charge to call, and participating roofers provide free inspections and estimates for repairs, replacements and storm damage. You're under no obligation to hire anyone.",
  },
  {
    q: "How much does a new roof cost in Southaven?",
    a: "It depends on the size, pitch and complexity of your roof and the materials you choose. This Old House’s 2026 Mississippi data puts the average roof replacement at about $7,763, with most projects between $6,164 and $18,621. Only an on-site inspection gives you a real number. See our roof replacement cost guide for details.",
  },
  {
    q: "Can a roofer help with my hail or wind damage insurance claim?",
    a: "A roofer can inspect the roof, photograph and document storm damage, meet your insurance adjuster and provide a detailed estimate. Negotiating the claim on your behalf is the job of a licensed public adjuster, so be cautious of any contractor who promises to handle everything.",
  },
  {
    q: "Do I need a licensed roofer in Mississippi?",
    a: "Mississippi requires a state license from the Mississippi State Board of Contractors for residential roofing jobs over $10,000. Always ask for license information and proof of insurance, and verify them yourself before you sign a contract.",
  },
  {
    q: "What parts of Southaven do you serve?",
    a: "We help homeowners across Southaven, Mississippi, in both the 38671 and 38672 ZIP codes, from established neighborhoods to newer subdivisions off Goodman Road, Airways Boulevard, Getwell Road and Church Road.",
  },
];

export default async function HomePage() {
  const [services, guides, allPosts, { phone }] = await Promise.all([
    getCollection("services"),
    getCollection("guides"),
    getCollection("blog"),
    getSettings(),
  ]);
  const posts = allPosts.slice(0, 3);
  const hero = images["roofer-nail-gun-shingles"];
  const tower = images["southaven-water-tower"];
  const storm = images["tearoff-brick-home"];

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden bg-brand-950">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="-z-20 animate-kenburns object-cover object-[65%_50%]"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-950/85 to-brand-900/35" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-brand-950/80 via-transparent to-transparent" />
        <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10 opacity-60" />
        <div
          aria-hidden="true"
          className="absolute -top-40 -right-40 -z-10 size-[36rem] rounded-full bg-accent-400/15 blur-3xl"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24 lg:pb-36">
          <div>
            <p className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-accent-200 ring-1 ring-white/15 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-400" />
              </span>
              Free roof estimates in Southaven, Mississippi
            </p>
            <h1 className="mt-6 animate-fade-up text-[2.6rem] leading-[1.05] font-extrabold text-white [animation-delay:80ms] sm:text-6xl lg:text-[4rem]">
              Roof Repair &amp; Replacement in <span className="text-gradient-accent">Southaven, MS</span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-brand-100 [animation-delay:160ms] sm:text-xl">
              Leaks, missing shingles, hail or wind damage, or a roof that&apos;s simply worn out: one call connects you with a local
              Southaven roofer for a <strong className="font-semibold text-white">free, no-obligation estimate</strong>.
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row sm:items-center">
              <CallButton location="home-hero" size="lg" />
              <Link
                href="/services"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-white ring-1 ring-white/25 transition-all hover:bg-white/10 hover:ring-white/40"
              >
                See roofing services
                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ul className="mt-9 flex animate-fade-up flex-wrap gap-2.5 [animation-delay:320ms]">
              {["Storm & hail damage", "Leak repair", "New roofs", "Metal & flat roofs"].map((t) => (
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

          {/* Estimate card (desktop) */}
          <div className="relative hidden animate-fade-up [animation-delay:380ms] lg:block">
            <div className="rounded-[1.75rem] bg-white/[0.08] p-8 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
              <Eyebrow light>Free roof estimate</Eyebrow>
              <p className="font-display mt-3 text-[1.7rem] leading-tight font-extrabold text-white">
                Talk to a local Southaven roofer today
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  ["clipboard", "Inspection & written estimate", "Know exactly what your roof needs."],
                  ["hail", "Storm damage documented", "Photos you can use for your claim."],
                  ["shield", "No obligation, no pressure", "Compare and decide on your terms."],
                ].map(([icon, title, text]) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-300 ring-1 ring-white/10">
                      <Icon name={icon as IconName} className="size-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-white">{title}</span>
                      <span className="block text-sm text-brand-200">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <CallButton location="home-hero-card" size="lg" className="mt-7 w-full" />
              <p className="mt-3 text-center text-xs text-brand-200">One call. No forms. No spam.</p>
            </div>
            <FloatingBadge
              icon="hail"
              title="Storm season help"
              text="Hail & wind damage inspections"
              className="absolute -top-7 -right-5 animate-float"
            />
          </div>
        </div>
      </section>

      {/* ───────── Trust cards (overlap the hero) ───────── */}
      <section className="relative z-10 bg-brand-50 sm:bg-transparent">
        <ul className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:-mt-16 sm:grid-cols-2 sm:py-0 sm:px-6 lg:grid-cols-4">
          {trust.map((t, i) => (
            <li
              key={t.title}
              style={{ animationDelay: `${450 + i * 90}ms` }}
              className="group flex animate-fade-up items-start gap-4 rounded-2xl bg-white p-5 shadow-lift ring-1 ring-brand-100 transition-transform duration-300 hover:-translate-y-1"
            >
              <IconChip name={t.icon} className="transition-transform duration-300 group-hover:scale-110" />
              <span>
                <span className="font-display block text-[17px] font-extrabold text-ink">{t.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">{t.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Services ───────── */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div aria-hidden="true" className="absolute top-20 -left-40 -z-10 size-96 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Roofing services"
            title={
              <>
                Every kind of roofing help <span className="text-brand-600">a Southaven home needs</span>
              </>
            }
            lead="From a single cracked pipe boot to a full tear-off after a hail storm, you'll be connected with a local roofing contractor who handles the job you actually have. Pick a service to learn what's involved, what it costs and what to ask before you hire."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceTile key={s.slug} doc={s} />
            ))}
            <a
              href={phone.href}
              data-cta="home-services-tile"
              className="reveal group relative flex items-start gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-brand-800 to-brand-950 p-6 text-white shadow-lift transition-transform duration-300 hover:-translate-y-1"
            >
              <span aria-hidden="true" className="absolute -right-10 -bottom-10 size-40 rounded-full bg-accent-400/20 blur-2xl" />
              <span className="pulse-ring size-12 shrink-0 items-center justify-center rounded-xl bg-accent-400 text-ink">
                <Icon name="phone" className="m-auto size-5" />
              </span>
              <span className="relative">
                <span className="font-display block text-lg font-extrabold">Not sure what you need?</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-brand-200">
                  Call {phone.display} and describe the problem. A local roofer will tell you what it takes to fix it.
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Southaven at a glance ───────── */}
      <section className="border-y border-brand-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-brand-100">
            {stats.map((s) => (
              <div key={s.value} className="reveal-zoom flex flex-col px-2 text-center lg:px-6">
                <dt className="order-2 mt-2 text-sm leading-snug text-slate-600">{s.label}</dt>
                <dd className="font-display bg-linear-to-br from-brand-700 to-brand-950 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-center text-xs text-slate-600">
            Sources: U.S. Census Bureau 2024 estimate; NWS Memphis severe weather climatology; This Old House Mississippi roof cost data
            (June 2026); Mississippi State Board of Contractors.
          </p>
        </div>
      </section>

      {/* ───────── Local weather ───────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="reveal-left">
            <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[1.75rem] border-2 border-accent-400" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-brand-100 shadow-lift">
              <Image
                src={tower.src}
                alt={tower.alt}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                placeholder="blur"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <FloatingBadge
              icon="hail"
              title="Peak storm season"
              text="April through June"
              className="absolute -bottom-6 left-4 animate-float sm:left-6"
            />
            </div>
            <p className="mt-12 text-sm text-slate-600">
              Southaven&apos;s &ldquo;Top of Mississippi&rdquo; water tower. Photo: Thomas R Machnitzki,{" "}
              <a href="https://creativecommons.org/licenses/by-sa/3.0/" className="underline" target="_blank" rel="noopener noreferrer">
                CC BY-SA 3.0
              </a>
              .
            </p>
          </div>
          <div>
            <SectionHeader
              eyebrow="Built for the Top of Mississippi"
              title="Why Southaven roofs work so hard"
              lead="Southaven sits at the northern edge of Mississippi in DeSoto County, right on the Tennessee line, and it gets the full force of Mid-South weather. A roof here has to survive more than age:"
            />
            <ul className="mt-9 grid gap-4 sm:grid-cols-2">
              {weather.map((w) => (
                <li
                  key={w.title}
                  className="reveal rounded-2xl border border-brand-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="flex items-center gap-3">
                    <IconChip name={w.icon} size="sm" />
                    <span className="font-display text-[17px] font-extrabold text-ink">{w.title}</span>
                  </span>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{w.text}</p>
                </li>
              ))}
            </ul>
            <p className="reveal mt-8 text-[15px] leading-relaxed text-slate-700">
              That&apos;s why a professional inspection after big storms, and every year or two once a roof passes 15, pays for itself.
              Read our{" "}
              <Link href="/blog/spring-storm-roof-checklist" className="font-semibold text-brand-700 underline decoration-accent-400 underline-offset-4">
                storm season roof checklist
              </Link>{" "}
              or{" "}
              <Link href="/roof-inspection" className="font-semibold text-brand-700 underline decoration-accent-400 underline-offset-4">
                learn what an inspection covers
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="hero-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <HowItWorks
            eyebrow="How it works"
            heading="Getting a roofer is as simple as one phone call"
            center
          />
          <div className="reveal mx-auto mt-12 flex max-w-4xl flex-col items-center gap-5 rounded-3xl bg-white p-6 text-center shadow-lift ring-1 ring-brand-100 sm:flex-row sm:p-7 sm:text-left">
            <p className="flex-1 text-[15px] leading-relaxed text-slate-600">
              <strong className="text-ink">Southaven Roofers is a free service</strong> that connects you with independent local
              roofing contractors. You talk directly with the roofer, get their estimate in writing and decide for yourself.{" "}
              <Link href="/how-it-works" className="font-semibold text-brand-700 underline decoration-accent-400 underline-offset-4">
                Learn how it works
              </Link>
              .
            </p>
            <CallButton location="home-how" className="shrink-0" />
          </div>
        </div>
      </section>

      {/* ───────── Storm damage ───────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div className="reveal-left relative">
            <div className="relative aspect-[16/12] overflow-hidden rounded-[1.75rem] bg-brand-100 shadow-lift">
              <Image
                src={storm.src}
                alt={storm.alt}
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                placeholder="blur"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-950/50 via-transparent to-transparent" />
            </div>
            <FloatingBadge
              icon="search"
              title="Free damage inspection"
              text="Every slope, vent & gutter checked"
              className="absolute -right-2 -bottom-6 animate-float sm:right-6"
            />
          </div>
          <div>
            <SectionHeader
              eyebrow="Hail & wind damage"
              title="Storm hit your roof? Get it inspected before you file a claim"
              lead="Hail damage is easy to miss from the driveway, and insurance policies expect prompt notice. A free inspection tells you whether there's real storm damage, documents it with photos, and helps you avoid filing a claim for damage that falls below your deductible."
            />
            <ol className="relative mt-8 space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[17px] before:w-0.5 before:bg-linear-to-b before:from-accent-400 before:to-brand-200">
              {[
                ["Stay safe and stay off the roof", "Contain any leaks inside and photograph what you can from the ground."],
                ["Get a free inspection", "A roofer checks every slope, vent and gutter and photographs any damage."],
                ["Decide on a claim with the facts", "Report it to your insurer, then meet the adjuster with your documentation."],
              ].map(([title, text], i) => (
                <li key={title} className="reveal relative flex gap-4">
                  <span className="font-display relative flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-400 text-sm font-extrabold text-ink shadow-glow">
                    {i + 1}
                  </span>
                  <span className="pt-1">
                    <span className="font-bold text-ink">{title}.</span> <span className="text-slate-600">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="reveal mt-9 flex flex-wrap items-center gap-5">
              <CallButton location="home-storm" />
              <Link href="/storm-damage-roof-repair" className="group inline-flex items-center gap-1.5 font-bold text-brand-700">
                Storm damage roof repair
                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Cost snapshot ───────── */}
      <section className="relative isolate overflow-hidden bg-brand-950 py-20 text-white sm:py-24">
        <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-32 -z-10 size-[30rem] rounded-full bg-brand-500/25 blur-3xl" />
        <div aria-hidden="true" className="absolute -top-32 right-0 -z-10 size-[26rem] rounded-full bg-accent-500/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeader
              light
              eyebrow="Roof costs"
              title="What does a new roof cost in Southaven?"
              lead={
                <>
                  This Old House&apos;s 2026 Mississippi data puts the average roof replacement at about{" "}
                  <strong className="text-white">$7,763</strong>, with most projects between $6,164 and $18,621. Your price depends on
                  roof size, pitch, layers to remove, decking repairs and the material you choose. Small repairs usually cost a fraction
                  of that.
                </>
              }
            />
            <div className="reveal mt-9 flex flex-wrap items-center gap-5">
              <CallButton location="home-cost" label="Get your exact price" />
              <Link href="/roof-replacement-cost-southaven" className="group inline-flex items-center gap-1.5 font-bold text-accent-300">
                Read the full cost guide
                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="reveal-zoom overflow-hidden rounded-3xl bg-white/[0.06] shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <table className="w-full text-left text-[15px]">
              <caption className="sr-only">What drives roof cost in Southaven</caption>
              <thead className="bg-white/[0.08] text-sm text-brand-100">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Cost factor
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Why it matters
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-brand-100">
                {[
                  ["Roof size & pitch", "More squares and steeper slopes mean more material and labor."],
                  ["Tear-off & decking", "Extra layers and rotten sheathing add to the job."],
                  ["Material", "Architectural, Class 4 impact-rated and metal differ widely."],
                  ["Complexity", "Valleys, dormers, chimneys and skylights need extra flashing."],
                  ["Insurance", "Covered storm damage can mean paying only your deductible."],
                ].map(([factor, why]) => (
                  <tr key={factor} className="transition-colors hover:bg-white/[0.04]">
                    <th scope="row" className="px-6 py-4 font-semibold text-white">
                      {factor}
                    </th>
                    <td className="px-6 py-4">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───────── Neighborhoods ───────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Serving all of Southaven"
              title="Roofing help in every Southaven neighborhood"
              lead="Southaven is home to about 57,000 people and is the third-largest city in Mississippi. Its housing ranges from established brick neighborhoods with mature trees to newer subdivisions near Snowden Grove Park and along Goodman Road. Whether your home is in the 38671 or 38672 ZIP code, you can get connected with a local roofer by phone."
            />
            <p className="reveal mt-5 text-[15px] leading-relaxed text-slate-600">
              Older homes often need flashing, ventilation and decking attention during a re-roof, while newer homes are more likely to
              need storm repairs or their first full replacement as builder-grade shingles age. A local roofer will know the difference.
            </p>
          </div>
          <div className="reveal-zoom rounded-3xl bg-linear-to-br from-brand-50 to-white p-7 shadow-card ring-1 ring-brand-100">
            <h3 className="font-extrabold text-ink">Neighborhoods across Southaven</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {neighborhoods.map((n) => (
                <li
                  key={n}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-brand-800 shadow-sm ring-1 ring-brand-100 transition-all hover:-translate-y-0.5 hover:ring-accent-400"
                >
                  <Icon name="pin" className="size-3.5 text-accent-600" />
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs font-bold tracking-wider text-slate-600 uppercase">Plus homes along</p>
            <p className="mt-2 text-sm text-slate-600">{roads.join(" · ")}</p>
            <CallButton location="home-areas" variant="outline" className="mt-7" />
          </div>
        </div>
      </section>

      {/* ───────── Guides & blog ───────── */}
      {(guides.length > 0 || posts.length > 0) && (
        <section className="hero-surface py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeader
                eyebrow="Homeowner guides"
                title="Know what you're paying for"
                lead="Straight answers about costs, insurance claims and choosing a roofer."
              />
              <Link href="/blog" className="reveal group inline-flex items-center gap-1.5 font-bold text-brand-700">
                All guides &amp; articles
                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...guides, ...posts].slice(0, 6).map((d) => (
                <PostCard key={d.href} doc={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── FAQ ───────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              eyebrow="FAQ"
              title="Questions Southaven homeowners ask"
              lead={
                <>
                  Still have questions? Call <PhoneLink location="home-faq" className="text-brand-700" /> and ask a local roofer
                  directly, or browse the{" "}
                  <Link href="/faq" className="font-semibold text-brand-700 underline decoration-accent-400 underline-offset-4">
                    full FAQ
                  </Link>
                  .
                </>
              }
            />
          </div>
          <div className="reveal">
            <FaqList faqs={homeFaqs} />
          </div>
        </div>
      </section>

      <CtaBand location="home-band" />
    </>
  );
}
