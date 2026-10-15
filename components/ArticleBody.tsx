import Image from "next/image";
import { InlineCta } from "@/components/Cta";
import type { Segment } from "@/lib/content";
import { getImage } from "@/lib/images";

export function Figure({ imageKey, caption }: { imageKey: string; caption?: string }) {
  const img = getImage(imageKey);
  return (
    <figure className="not-prose my-9">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-100">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: img.position }}
        />
      </div>
      {caption && <figcaption className="mt-2.5 text-sm text-slate-600">{caption}</figcaption>}
    </figure>
  );
}

/** Renders markdown HTML with call-to-action boxes and figures where the author placed markers. */
export function ArticleBody({ segments, ctaLocation }: { segments: Segment[]; ctaLocation: string }) {
  return (
    <div className="prose article-body max-w-none sm:prose-lg prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-[1.55rem] prose-h3:text-xl prose-li:my-1 prose-table:text-base sm:prose-h2:text-[1.7rem]">
      {segments.map((s, i) => {
        if (s.kind === "html") return <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} />;
        if (s.kind === "cta") return <InlineCta key={i} text={s.text} location={`${ctaLocation}-inline-${i}`} />;
        return <Figure key={i} imageKey={s.key} caption={s.caption} />;
      })}
    </div>
  );
}
