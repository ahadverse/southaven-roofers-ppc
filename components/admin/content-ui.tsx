import Link from "next/link";
import { Icon } from "@/components/Icon";

/* Small presentational pieces shared by the content list and editor (no hooks: safe in server and client components). */

export const cardClass = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

export function StatusBadge({ status, className = "" }: { status: "published" | "draft"; className?: string }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
        published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"
      } ${className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-slate-400"}`} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

/** Friendly explanation shown instead of content screens when MongoDB isn't set up or can't be reached. */
export function DbNotice({ status }: { status: { configured: boolean; connected: boolean; error?: string } }) {
  if (!status.configured) {
    return (
      <div className={`${cardClass} max-w-2xl`}>
        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
          <Icon name="layers" className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink">Connect a database to edit content</h2>
        <p className="mt-2 leading-relaxed text-slate-600">
          Pages are stored in MongoDB. Add a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">MONGODB_URI</code>{" "}
          environment variable (a free MongoDB Atlas cluster works) and restart or redeploy the site.
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          <li>
            Local development: add it to <code className="rounded bg-slate-100 px-1 text-[13px]">.env.local</code>.
          </li>
          <li>Vercel: Project → Settings → Environment Variables, then redeploy.</li>
          <li>Back on the dashboard, use “Import starter content” to copy the current pages into the database.</li>
        </ol>
        <p className="mt-4 text-sm text-slate-500">
          Until then the website keeps showing the starter content from the <code>content/</code> folder.
        </p>
      </div>
    );
  }
  return (
    <div className={`${cardClass} max-w-2xl`}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200">
        <Icon name="alert" className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-xl font-extrabold text-ink">Can&apos;t reach the database</h2>
      <p className="mt-2 leading-relaxed text-slate-600">
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">MONGODB_URI</code> is set, but the connection failed. Check
        the username and password in the connection string, and that your MongoDB Atlas network access list allows this server
        (for Vercel, allow <code className="rounded bg-slate-100 px-1 text-[13px]">0.0.0.0/0</code>).
      </p>
      {status.error && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs break-words text-slate-600 ring-1 ring-slate-200">
          {status.error}
        </p>
      )}
      <Link
        href="/admin"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
