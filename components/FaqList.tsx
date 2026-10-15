import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import type { Faq } from "@/lib/content";
import { faqSchema } from "@/lib/schema";

/** Accessible FAQ accordion built on <details> (no JavaScript), plus FAQPage structured data. */
export function FaqList({ faqs, withSchema = true }: { faqs: Faq[]; withSchema?: boolean }) {
  if (!faqs.length) return null;
  return (
    <>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={f.q}
            className="group rounded-2xl bg-white shadow-card ring-1 ring-brand-100 transition-shadow open:shadow-lift open:ring-brand-200"
            open={i === 0}
          >
            <summary className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl px-5 py-4.5 text-left font-semibold text-ink transition-colors hover:text-brand-700 sm:px-6">
              <h3 className="font-display pt-0.5 text-base font-bold sm:text-[17px]">{f.q}</h3>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-all duration-300 group-open:rotate-180 group-open:bg-accent-400 group-open:text-ink">
                <Icon name="chevronDown" className="size-4.5" />
              </span>
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-slate-600 sm:px-6">{f.a}</p>
          </details>
        ))}
      </div>
      {withSchema && <JsonLd data={faqSchema(faqs)} />}
    </>
  );
}
