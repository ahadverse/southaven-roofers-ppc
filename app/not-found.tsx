import Link from "next/link";
import { CallButton } from "@/components/CallButton";
import { SiteShell } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-bold tracking-wider text-brand-600 uppercase">404</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-4 text-lg text-slate-600">
        The page may have moved. You can head back home, browse roofing services, or just call and talk to a local Southaven roofer.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <CallButton location="404" />
        <Link href="/" className="font-bold text-brand-700 hover:underline">
          Back to home
        </Link>
        <Link href="/services" className="font-bold text-brand-700 hover:underline">
          Roofing services
        </Link>
      </div>
    </section>
    </SiteShell>
  );
}
