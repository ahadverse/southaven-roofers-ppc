import Image from "next/image";
import Link from "next/link";
import { Icon, isIconName } from "@/components/Icon";
import { IconChip } from "@/components/ui";
import type { Doc } from "@/lib/content";
import { getImage } from "@/lib/images";

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export { formatDate };

const kindLabel = (doc: Doc) =>
  doc.collection === "guides" ? "Homeowner guide" : doc.collection === "services" ? "Roofing service" : (doc.category ?? "Roofing tips");

/** Service card with photo. */
export function ServiceCard({ doc }: { doc: Doc }) {
  const img = getImage(doc.image);
  return (
    <Link
      href={doc.href}
      className="reveal group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-brand-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand-200"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          placeholder="blur"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectPosition: img.position }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-brand-950/55 via-transparent to-transparent" />
        {isIconName(doc.icon) && (
          <span className="absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-xl bg-white/95 text-brand-800 shadow-lg backdrop-blur transition-colors duration-300 group-hover:bg-accent-400 group-hover:text-ink">
            <Icon name={doc.icon} className="size-5" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-extrabold text-ink transition-colors group-hover:text-brand-700">{doc.navLabel}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{doc.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
          Learn more <Icon name="arrowRight" className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

/** Compact icon card used on the home page service grid. */
export function ServiceTile({ doc }: { doc: Doc }) {
  return (
    <Link
      href={doc.href}
      className="reveal group relative flex items-start gap-4 overflow-hidden rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200"
    >
      {/* Accent bar that grows on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-accent-400 to-accent-600 transition-transform duration-500 group-hover:scale-x-100"
      />
      <IconChip
        name={isIconName(doc.icon) ? doc.icon : "home"}
        className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
      />
      <span className="min-w-0">
        <span className="font-display flex items-center gap-1.5 text-[17px] font-extrabold text-ink group-hover:text-brand-700">
          {doc.navLabel}
          <Icon
            name="arrowRight"
            className="size-4 -translate-x-1 text-accent-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">{doc.excerpt}</span>
      </span>
    </Link>
  );
}

/** Article / guide card. */
export function PostCard({ doc }: { doc: Doc }) {
  const img = getImage(doc.image);
  return (
    <Link
      href={doc.href}
      className="reveal group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-brand-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand-200"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-100">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          placeholder="blur"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectPosition: img.position }}
        />
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold tracking-wide text-brand-800 shadow backdrop-blur">
          {kindLabel(doc)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Icon name="clock" className="size-3.5" />
          {doc.readingMinutes} min read
        </p>
        <h3 className="mt-2 text-lg leading-snug font-extrabold text-ink transition-colors group-hover:text-brand-700">{doc.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-slate-600">{doc.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
          Read more <Icon name="arrowRight" className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}
