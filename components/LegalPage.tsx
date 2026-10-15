import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatDate } from "@/components/Cards";
import { getDoc } from "@/lib/content";

export function LegalPage({ slug }: { slug: string }) {
  const doc = getDoc("legal", slug);
  if (!doc) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
      <Breadcrumbs items={[{ name: doc.title, href: doc.href }]} />
      <h1 className="mt-4 text-[2rem] leading-tight font-extrabold tracking-tight text-ink sm:text-[2.4rem]">{doc.title}</h1>
      <p className="mt-2 text-sm text-slate-600">Last updated {formatDate(doc.updated)}</p>
      <div className="mt-8">
        <ArticleBody segments={doc.segments} ctaLocation={`legal-${slug}`} />
      </div>
    </div>
  );
}
