import { Icon } from "@/components/Icon";

/**
 * Mobile "back to top" button. No JavaScript: "#top" scrolls to the top of the page,
 * `scroll-behavior: smooth` animates it, and a scroll-driven animation fades the button
 * in only after the visitor has scrolled down (see .back-to-top in globals.css).
 */
export function BackToTop() {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="back-to-top fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full bg-brand-900/90 text-white shadow-lift ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-brand-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-400 active:scale-95 md:hidden"
    >
      <Icon name="arrowUp" className="size-5" />
    </a>
  );
}
