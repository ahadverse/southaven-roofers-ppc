import { Icon } from "@/components/Icon";
import { phone } from "@/lib/site";

type Variant = "primary" | "outline" | "light";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "btn-shine bg-linear-to-b from-accent-300 to-accent-400 text-ink shadow-glow ring-1 ring-inset ring-white/40 hover:from-accent-200 hover:to-accent-300",
  outline: "border-2 border-brand-700 bg-white/60 text-brand-800 hover:border-brand-900 hover:bg-white",
  light: "btn-shine bg-white text-ink shadow-lift hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  md: "gap-3 px-4 py-2.5 text-[15px]",
  lg: "gap-3.5 px-5 py-3.5 text-lg sm:px-6",
};

/**
 * Every call link goes through this component so the number always comes from env,
 * and `data-cta` tells analytics which button was tapped.
 */
export function CallButton({
  label = "Call for a Free Estimate",
  showNumber = true,
  variant = "primary",
  size = "md",
  location,
  className = "",
}: {
  label?: string;
  showNumber?: boolean;
  variant?: Variant;
  size?: Size;
  location: string;
  className?: string;
}) {
  return (
    <a
      href={phone.href}
      data-cta={location}
      className={`group inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span
        className={`pulse-ring shrink-0 items-center justify-center rounded-full ${
          variant === "outline" ? "bg-brand-100 text-brand-800" : "bg-ink/10 text-ink"
        } ${size === "lg" ? "size-10" : "size-8"}`}
      >
        <Icon name="phone" className={`m-auto ${size === "lg" ? "size-5" : "size-4"} transition-transform group-hover:rotate-12`} />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span>{showNumber ? phone.display : label}</span>
        {showNumber && <span className="text-[0.72em] font-semibold opacity-75">{label}</span>}
      </span>
    </a>
  );
}

export function PhoneLink({ location, className = "" }: { location: string; className?: string }) {
  return (
    <a href={phone.href} data-cta={location} className={`font-bold whitespace-nowrap underline-offset-4 hover:underline ${className}`}>
      {phone.display}
    </a>
  );
}
