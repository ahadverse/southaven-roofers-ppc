import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { Icon } from "@/components/Icon";
import { dbStatus } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const status = await dbStatus();

  const logout = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-brand-200 hover:bg-white/5 hover:text-white"
      >
        <Icon name="close" className="size-4.5" />
        Log out
      </button>
    </form>
  );

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <AdminNav logout={logout} />
      <div className="min-w-0 flex-1">
        {!status.configured && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">
            <strong>Database not connected.</strong> Set <code>MONGODB_URI</code> in your environment variables to edit content and
            see stats. The website is currently showing the starter content from the <code>content/</code> folder.
          </div>
        )}
        {status.configured && !status.connected && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-900">
            <strong>Can&apos;t reach MongoDB.</strong> {status.error}
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
