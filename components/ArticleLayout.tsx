import Image from "next/image";
import Link from "next/link";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/CallButton";
import { PostCard, formatDate } from "@/components/Cards";
import { CtaBand } from "@/components/Cta";
import { FaqList } from "@/components/FaqList";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Eyebrow, FloatingBadge } from "@/components/ui";
import { getRelated, type Doc } from "@/lib/content";
import { getImage } from "@/lib/images";
import { articleSchema, serviceSchema } from "@/lib/schema";
import { absoluteUrl, phone, site } from "@/lib/site";

const bullets: Record<Doc["collection"], string[]> = {
  services: ["Free, no-obligation estimate", "Local Southaven roofing contractors", "Help documenting storm damage for insurance"],
  guides: ["Free roof inspection & estimate", "Straight answers about cost and options", "Local roofers who know Southaven weather"],
  blog: ["Free roof inspection & estimate", "Local Southaven roofing contractors", "No obligation, no pressure"],
  legal: [],
};

export function ArticleLayout({ doc, crumbs }: { doc: Doc; crumbs: Crumb[] }) {
  const img = getImage(doc.image);
  const related = getRelated(doc, 3);
  const location = `${doc.collection}-${doc.slug}`;
  const imageUrl = absoluteUrl(img.src.src);
  const isService = doc.collection === "services";

  return (
    <>
      <JsonLd data={isService ? serviceSchema(doc, imageUrl) : articleSchema(doc, imageUrl)} />

      <div aria-hidden="true" className="reading-progress" />

      {/* Hero */}
      <section className="hero-surface overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pt-10 lg:pb-16">
          <div>
            <div className="animate-fade-up">
              <Breadcrumbs items={crumbs} />
            </div>
            <p className="mt-5 inline-flex animate-fade-up items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase shadow-sm ring-1 ring-brand-100 [animation-delay:60ms]">
              <span className="size-1.5 rounded-full bg-accent-500" />
              {isService ? "Roofing service · Southaven, MS" : doc.collection === "guides" ? "Homeowner guide" : (doc.category ?? "Roofing tips")}
            </p>
            <h1 className="mt-4 animate-fade-up text-[2.1rem] leading-[1.1] font-extrabold text-ink [animation-delay:100ms] sm:text-5xl">
              {doc.title}
            </h1>
            <p className="mt-5 animate-fade-up text-lg leading-relaxed text-slate-700 [animation-delay:160ms]">{doc.excerpt}</p>
            {!isService && (
              <p className="mt-5 flex animate-fade-up flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 [animation-delay:200ms]">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="users" className="size-4 text-brand-500" />
                  By the {site.name} team
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="clock" className="size-4 text-brand-500" />
                  {doc.readingMinutes} min read
                </span>
                <span>Updated {formatDate(doc.updated)}</span>
              </p>
            )}
            <ul className="mt-6 grid animate-fade-up gap-2.5 [animation-delay:240ms]">
              {bullets[doc.collection].map((b) => (
                <li key={b} className="flex items-center gap-2.5 font-medium text-slate-800">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:300ms]">
              <CallButton location={`${location}-hero`} size="lg" />
            </div>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 animate-fade-in rounded-[1.75rem] bg-linear-to-br from-accent-300 to-accent-500 [animation-delay:200ms] sm:translate-x-5 sm:translate-y-5" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-brand-100 shadow-lift lg:aspect-[5/4]">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
                style={{ objectPosition: img.position }}
              />
            </div>
            <FloatingBadge
              icon="clipboard"
              title="Free, no-obligation estimate"
              text="Local Southaven roofers"
              className="absolute -bottom-5 left-3 animate-float sm:-left-6"
            />
          </div>
        </div>
      </section>

      {/* Body + sidebar */}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-16">
        <article className="min-w-0">
          {doc.headings.length > 2 && (
            <details className="mb-8 rounded-2xl bg-white shadow-card ring-1 ring-brand-100 lg:hidden">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-bold text-ink">
                On this page
                <Icon name="chevronDown" className="size-5 text-brand-600" />
              </summary>
              <ol className="space-y-2 px-5 pb-5 text-[15px]">
                {doc.headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-brand-700 hover:underline">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <ArticleBody segments={doc.segments} ctaLocation={location} />

          {doc.faqs.length > 0 && (
            <section className="mt-14" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="mb-6 text-[1.7rem] font-extrabold tracking-tight text-ink">
                Frequently asked questions
              </h2>
              <FaqList faqs={doc.faqs} />
            </section>
          )}

          {doc.sources.length > 0 && (
            <section className="mt-12 rounded-3xl bg-brand-50 p-6 ring-1 ring-brand-100 sm:p-7" aria-labelledby="sources-heading">
              <h2 id="sources-heading" className="text-lg font-bold text-ink">
                Sources &amp; further reading
              </h2>
              <ul className="mt-3 space-y-2 text-[15px]">
                {doc.sources.map((s) => (
                  <li key={s.url} className="flex gap-2">
                    <Icon name="file" className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline-offset-2 hover:underline">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                Information was reviewed on {formatDate(site.lastReviewed)}. Programs, prices and rules change, so confirm details with
                the source before making decisions.
              </p>
            </section>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-800 to-brand-950 p-6 text-white shadow-lift">
              <span aria-hidden="true" className="absolute -top-12 -right-12 size-40 rounded-full bg-accent-400/25 blur-3xl" />
              <p className="relative text-sm font-semibold tracking-wider text-accent-400 uppercase">Southaven, MS</p>
              <p className="font-display relative mt-2 text-xl leading-snug font-extrabold">Talk to a local roofer about your roof</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-200">
                Free inspection and estimate. No obligation, no pressure.
              </p>
              <CallButton location={`${location}-sidebar`} className="mt-5 w-full" />
              <p className="mt-3 text-center text-xs text-brand-300">or dial {phone.display}</p>
            </div>

            {doc.headings.length > 2 && (
              <nav aria-label="On this page" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-100">
                <p className="font-display flex items-center gap-2 font-extrabold text-ink">
                  <Icon name="book" className="size-4 text-accent-600" />
                  On this page
                </p>
                <ol className="mt-3 space-y-2 text-sm">
                  {doc.headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="block border-l-2 border-brand-100 py-0.5 pl-3 text-slate-600 transition-colors hover:border-accent-500 hover:text-brand-800">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="hero-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="reveal">
                <Eyebrow>Related reading</Eyebrow>
                <h2 className="mt-3 text-3xl font-extrabold text-ink">Keep reading</h2>
              </div>
              <Link href="/services" className="group inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                All roofing services
                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <PostCard key={r.slug} doc={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand location={`${location}-band`} />
    </>
  );
}
