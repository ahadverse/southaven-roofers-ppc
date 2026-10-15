import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/CallButton";
import { PostCard, ServiceCard } from "@/components/Cards";
import { CtaBand } from "@/components/Cta";
import { HowItWorks } from "@/components/HowItWorks";
import { getCollection } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Roofing Services in Southaven, MS | Southaven Roofers",
  description:
    "Roof repair, replacement, leak repair, hail and storm damage, inspections, metal and flat roofing in Southaven, MS. Call for a free, no-obligation estimate.",
  path: "/services",
});

export default async function ServicesPage() {
  const [services, guides] = await Promise.all([getCollection("services"), getCollection("guides")]);

  return (
    <>
      <section className="hero-surface">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pt-10 lg:pb-16">
          <Breadcrumbs items={[{ name: "Services", href: "/services" }]} />
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <h1 className="animate-fade-up text-[2.2rem] leading-[1.1] font-extrabold text-ink sm:text-5xl">
                Roofing Services in Southaven, MS
              </h1>
              <p className="mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-700 [animation-delay:120ms]">
                Whatever is going on with your roof, one call connects you with a local roofing contractor who handles that kind of
                work every day. Explore each service to see what&apos;s involved, what it typically costs and what to ask before you
                hire anyone.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <CallButton location="services-hero" size="lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.slug} doc={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <HowItWorks heading="How getting a roofer works" />
        </div>
      </section>

      {guides.length > 0 && (
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-ink">Before you hire: homeowner guides</h2>
              <Link href="/blog" className="font-bold text-brand-700 hover:underline">
                All articles →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {guides.map((g) => (
                <PostCard key={g.slug} doc={g} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand location="services-band" />
    </>
  );
}
