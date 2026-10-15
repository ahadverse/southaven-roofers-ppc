import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocEditor, type EditorDoc, type EditorImage } from "@/components/admin/DocEditor";
import { DbNotice, StatusBadge } from "@/components/admin/content-ui";
import { ICON_NAMES } from "@/components/admin/icon-options";
import { Icon } from "@/components/Icon";
import { COLLECTION_LABELS, CREATABLE, dbStatus, getDocById, listAllSlugs, todayInSouthaven } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { hrefFor, isCollection, type Collection } from "@/lib/content";
import { images } from "@/lib/images";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ collection: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, id } = await params;
  if (!isCollection(collection)) return {};
  const singular = COLLECTION_LABELS[collection].singular;
  return { title: { absolute: `${id === "new" ? "New" : "Edit"} ${singular.toLowerCase()} | Admin` } };
}

const STARTER_BODY = `Start with a short introduction that answers the reader's main question in two or three sentences.

## First section

Explain the topic in plain English for Southaven homeowners. Use ### for sub-points and lists for steps or checklists.
`;

function newDocDefaults(collection: Collection): EditorDoc {
  return {
    slug: "",
    status: "draft",
    title: "",
    metaTitle: "",
    description: "",
    navLabel: "",
    excerpt: "",
    image: "roofer-nail-gun-shingles",
    icon: collection === "services" ? "wrench" : undefined,
    order: 99,
    date: collection === "blog" ? todayInSouthaven() : undefined,
    category: undefined,
    faqs: [],
    related: [],
    sources: [],
    body: STARTER_BODY,
  };
}

const updatedFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function EditDocPage({ params }: Props) {
  await requireAdmin();
  const { collection, id } = await params;
  if (!isCollection(collection)) notFound();
  const isNew = id === "new";
  if (isNew && !CREATABLE[collection]) notFound();

  const labels = COLLECTION_LABELS[collection];
  const listHref = `/admin/content/${collection}`;
  const status = await dbStatus();

  const backLink = (
    <Link href={listHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
      <Icon name="chevronRight" className="size-4 rotate-180" />
      {labels.plural}
    </Link>
  );

  if (!status.connected) {
    return (
      <div>
        {backLink}
        <div className="mt-4">
          <DbNotice status={status} />
        </div>
      </div>
    );
  }

  let initial: EditorDoc;
  let updatedLabel: string | null = null;
  if (isNew) {
    initial = newDocDefaults(collection);
  } else {
    const doc = await getDocById(id);
    if (!doc || doc.collection !== collection) notFound();
    initial = {
      slug: doc.slug,
      status: doc.status,
      title: doc.title,
      metaTitle: doc.metaTitle,
      description: doc.description,
      navLabel: doc.navLabel,
      excerpt: doc.excerpt,
      image: doc.image,
      icon: doc.icon,
      order: doc.order,
      date: doc.date,
      category: doc.category,
      faqs: (doc.faqs ?? []).map((f) => ({ q: f.q ?? "", a: f.a ?? "" })),
      related: doc.related ?? [],
      sources: (doc.sources ?? []).map((s) => ({ label: s.label ?? "", url: s.url ?? "" })),
      body: doc.body ?? "",
    };
    updatedLabel = updatedFormat.format(new Date(doc.updatedAt));
  }

  const slugs = (await listAllSlugs())
    .filter((s) => !(s.collection === collection && s.slug === initial.slug && !isNew))
    .sort((a, b) => a.title.localeCompare(b.title));

  const imageLibrary: EditorImage[] = Object.entries(images).map(([key, img]) => ({ key, src: img.src.src, alt: img.alt }));

  return (
    <div>
      {backLink}
      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold break-words text-ink sm:text-3xl">
            {isNew ? `New ${labels.singular.toLowerCase()}` : initial.title || "(untitled)"}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span>{labels.singular}</span>
            {!isNew && <StatusBadge status={initial.status} />}
            {updatedLabel && <span>Last updated {updatedLabel}</span>}
            {!isNew && <span className="font-mono text-xs">{hrefFor(collection, initial.slug)}</span>}
          </p>
        </div>
      </header>

      <div className="mt-6">
        <DocEditor
          collection={collection}
          docId={isNew ? null : id}
          initial={initial}
          updatedLabel={updatedLabel}
          images={imageLibrary}
          icons={ICON_NAMES}
          slugs={slugs}
          canDelete={!isNew && CREATABLE[collection]}
          labels={labels}
          siteOrigin={siteUrl}
          pathPrefix={hrefFor(collection, "")}
        />
      </div>
    </div>
  );
}
