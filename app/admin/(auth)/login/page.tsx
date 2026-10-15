import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/Logo";
import { adminConfig, getSessionUser } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await getSessionUser()) redirect("/admin");
  const cfg = adminConfig();

  return (
    <main className="flex flex-1 items-center justify-center bg-linear-to-br from-brand-950 via-brand-900 to-brand-800 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <LogoMark className="size-12" />
          <h1 className="mt-4 text-2xl font-extrabold">Southaven Roofers Admin</h1>
          <p className="mt-1 text-sm text-brand-200">Sign in to manage pages, settings and stats.</p>
        </div>
        <div className="rounded-3xl bg-white p-7 shadow-2xl">
          <LoginForm disabled={!cfg.ready} />
          {!cfg.ready && (
            <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
              <p className="font-bold">Admin login isn&apos;t set up yet</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {cfg.problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="mt-2">Add these in .env.local (local) or Vercel → Settings → Environment Variables, then redeploy.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
