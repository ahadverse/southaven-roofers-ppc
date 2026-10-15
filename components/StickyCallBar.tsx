import { Icon } from "@/components/Icon";
import { getSettings } from "@/lib/settings";

/** Mobile-only call bar pinned to the bottom of the screen. */
export async function StickyCallBar() {
  const { phone } = await getSettings();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-white/10 bg-brand-950/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <a
        href={phone.href}
        data-cta="sticky-mobile"
        className="btn-shine flex w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-b from-accent-300 to-accent-400 px-4 py-3 text-ink shadow-glow"
      >
        <span className="pulse-ring size-8 items-center justify-center rounded-full bg-ink/10">
          <Icon name="phone" className="m-auto size-4" />
        </span>
        <span className="text-base font-extrabold">Call Now: {phone.display}</span>
      </a>
      <p className="mt-1.5 text-center text-[11px] font-medium text-brand-200">Free, no-obligation roof estimate</p>
    </div>
  );
}
