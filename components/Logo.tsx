import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="9" fill="#0d2440" />
      <path d="M7 21.5 20 10.5l13 11" fill="none" stroke="#fbbf24" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 20.5V30h17v-9.5" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M17.5 30v-5.5h5V30" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
          Southaven <span className={light ? "text-accent-400" : "text-brand-700"}>Roofers</span>
        </span>
        <span className={`mt-1 block text-[11px] font-medium tracking-wide ${light ? "text-brand-200" : "text-slate-600"}`}>
          SOUTHAVEN, MISSISSIPPI
        </span>
      </span>
    </Link>
  );
}
