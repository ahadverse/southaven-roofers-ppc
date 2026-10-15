import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DbNotice, StatusBadge, cardClass } from "@/components/admin/content-ui";
import { Icon } from "@/components/Icon";
import { COLLECTION_LABELS, CREATABLE, dbStatus, listDocs, type AdminDocSummary } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { hrefFor, isCollection, type Collection } from "@/lib/content";

type Props = { params: Promise<{ collection: string }> };

const INTRO: Record<Collection, string> = {
  services: "Service pages live at the top level of the site (for example /roof-repair) and appear in the services menu.",
  guides: "Long-form homeowner guides, also served at the top level (for example /roof-replacement-cost-southaven).",
  blog: "Articles under /blog, newest first. Each post shows its publish date and category.",
  legal: "Privacy policy and terms. Their URLs are fixed and linked from the footer of every page.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  return isCollection(collection) ? { title: { absolute: `${COLLECTION_LABELS[collection].plural} | Admin` } } : {};
}

const dateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

const formatUpdated = (iso: string) => dateTime.format(new Date(iso));
const formatDay = (ymd?: string) => (ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? dateOnly.format(new Date(`${ymd}T00:00:00Z`)) : "");

function detailLine(doc: AdminDocSummary) {
  if (doc.collection === "blog") return doc.date ? `Publish date ${formatDay(doc.date)}` : "No publish date";
  if (doc.collection === "legal") return "Fixed URL";
  return `Menu label “${doc.navLabel || doc.title}” · Order ${doc.order}`;
}

function ViewLink({ doc }: { doc: AdminDocSummary }) {
  const href = hrefFor(doc.collection, doc.slug);
  if (doc.status !== "published") {
    return (
      <span className="text-sm text-slate-500" title="Drafts are not visible on the website">
        Not live yet
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900 hover:underline"
    >
      View
      <Icon name="arrowRight" className="size-3.5 -rotate-45" />
      <span className="sr-only">{doc.title} (opens in a new tab)</span>
    </a>
  );
}

export default async function ContentListPage({ params }: Props) {
  await requireAdmin();
  const { collection } = await params;
  if (!isCollection(collection)) notFound();

  const labels = COLLECTION_LABELS[collection];
  const creatable = CREATABLE[collection];
  const status = await dbStatus();
  const docs = status.connected ? await listDocs(collection) : [];
  const editHref = (doc: AdminDocSummary) => `/admin/content/${collection}/${doc.id}`;

  const newButton = creatable && status.connected && (
    <Link
      href={`/admin/content/${collection}/new`}
      className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:ring-3 focus-visible:ring-accent-400 focus-visible:outline-none"
    >
      <span aria-hidden="true" className="text-lg leading-none text-accent-400">
        +
      </span>
      New {labels.singular.toLowerCase()}
    </Link>
  );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">Content</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 font-display text-3xl font-extrabold text-ink">
            {labels.plural}
            {status.connected && (
              <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-sm font-bold text-slate-600">
                {docs.length}
                <span className="sr-only"> {docs.length === 1 ? "item" : "items"}</span>
              </span>
            )}
          </h1>
          <p className="mt-1.5 max-w-2xl text-slate-600">{INTRO[collection]}</p>
        </div>
        {newButton}
      </header>

      {collection === "legal" && status.connected && (
        <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900 ring-1 ring-brand-100">
          <Icon name="shield" className="mt-0.5 size-4 shrink-0 text-brand-600" />
          Legal pages are edit-only: you can change their text, but they can&apos;t be created, renamed or deleted because the
          footer and disclosures link to them.
        </p>
      )}

      <div className="mt-6">
        {!status.connected ? (
          <DbNotice status={status} />
        ) : docs.length === 0 ? (
          <div className={`${cardClass} flex flex-col items-center px-6 py-12 text-center sm:py-16`}>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Icon name="file" className="size-7" />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink">
              {status.docCount === 0 ? "The database is empty" : `No ${labels.plural.toLowerCase()} yet`}
            </h2>
            <p className="mt-2 max-w-md leading-relaxed text-slate-600">
              {status.docCount === 0
                ? "MongoDB is connected but holds no pages yet, so the website is still showing the starter content. Import it from the dashboard to start editing."
                : `There are no ${labels.plural.toLowerCase()} in the database yet. Import the starter content from the dashboard${
                    creatable ? ", or create the first one now" : ""
                  }.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-slate-300 hover:bg-slate-50"
              >
                <Icon name="home" className="size-4" />
                Go to dashboard to import
              </Link>
              {newButton}
            </div>
          </div>
        ) : (
          <>
            {/* Phones and small tablets: cards */}
            <ul className="space-y-3 md:hidden">
              {docs.map((doc) => (
                <li key={doc.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={editHref(doc)} className="font-bold text-ink hover:text-brand-700">
                        {doc.title || "(untitled)"}
                      </Link>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{hrefFor(doc.collection, doc.slug)}</p>
                    </div>
                    <StatusBadge status={doc.status} className="shrink-0" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {detailLine(doc)} · Updated <time dateTime={doc.updatedAt}>{formatUpdated(doc.updatedAt)}</time>
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <ViewLink doc={doc} />
                    <Link
                      href={editHref(doc)}
                      className="rounded-lg bg-brand-900 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-brand-800"
                      aria-label={`Edit ${doc.title}`}
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">{labels.plural}</caption>
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Title
                    </th>
                    <th scope="col" className="px-4 py-3">
                      URL
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Last updated
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="max-w-xs px-5 py-3.5">
                        <Link href={editHref(doc)} className="font-bold text-ink hover:text-brand-700">
                          {doc.title || "(untitled)"}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{detailLine(doc)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="max-w-56 truncate font-mono text-xs text-slate-600 lg:max-w-72">
                            {hrefFor(doc.collection, doc.slug)}
                          </span>
                          <ViewLink doc={doc} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        <time dateTime={doc.updatedAt}>{formatUpdated(doc.updatedAt)}</time>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={editHref(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-brand-800"
                        >
                          Edit<span className="sr-only"> {doc.title}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
