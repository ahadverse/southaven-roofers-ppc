import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";

/** Small uppercase label with an accent line, used above section headings. */
export function Eyebrow({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em] uppercase ${
        light ? "text-accent-300" : "text-brand-600"
      } ${className}`}
    >
      <span aria-hidden="true" className={`h-0.5 w-7 rounded-full ${light ? "bg-accent-400" : "bg-accent-500"}`} />
      {children}
    </p>
  );
}

/** Eyebrow + heading + lead paragraph, revealed on scroll. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  light = false,
  center = false,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  light?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`reveal max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`mt-3 text-3xl leading-[1.15] font-extrabold sm:text-[2.6rem] ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {lead && <p className={`mt-4 text-lg leading-relaxed ${light ? "text-brand-100" : "text-slate-600"}`}>{lead}</p>}
    </div>
  );
}

/** Rounded icon chip with a navy gradient. */
export function IconChip({ name, size = "md", className = "" }: { name: IconName; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "size-14 rounded-2xl" : size === "sm" ? "size-9 rounded-lg" : "size-12 rounded-xl";
  const icon = size === "lg" ? "size-7" : size === "sm" ? "size-4.5" : "size-6";
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-linear-to-br from-brand-700 to-brand-950 text-accent-400 shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_8px_18px_-8px_rgb(13_36_64/0.6)] ${box} ${className}`}
    >
      <Icon name={name} className={icon} />
    </span>
  );
}

/** Floating white badge used on top of photos. */
export function FloatingBadge({
  icon,
  title,
  text,
  className = "",
}: {
  icon: IconName;
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lift ring-1 ring-brand-100 backdrop-blur ${className}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-400 text-ink">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold text-ink">{title}</span>
        {text && <span className="mt-0.5 block text-xs font-medium text-slate-600">{text}</span>}
      </span>
    </div>
  );
}
