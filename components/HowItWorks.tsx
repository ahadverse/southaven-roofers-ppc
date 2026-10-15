import { Icon, type IconName } from "@/components/Icon";
import { SectionHeader } from "@/components/ui";
import { phone } from "@/lib/site";

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "phone",
    title: "Call us",
    text: `Dial ${phone.display} and describe what's going on: a leak, missing shingles, hail or wind damage, or a roof that's simply getting old.`,
  },
  {
    icon: "clipboard",
    title: "Get a free inspection & estimate",
    text: "You're connected with a local roofing contractor who can inspect the roof, document any damage and give you a written estimate.",
  },
  {
    icon: "home",
    title: "Decide on your terms",
    text: "Compare the recommendation with your budget and insurance coverage. There's no obligation and no pressure to sign anything on the spot.",
  },
];

export function HowItWorks({
  heading = "How it works",
  eyebrow = "Simple process",
  center = false,
}: {
  heading?: string;
  eyebrow?: string;
  center?: boolean;
}) {
  return (
    <div>
      <SectionHeader eyebrow={eyebrow} title={heading} center={center} />
      <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
        {/* Connector line between steps (desktop) */}
        <span
          aria-hidden="true"
          className="absolute top-12 right-[16%] left-[16%] hidden h-0.5 bg-[repeating-linear-gradient(90deg,var(--color-brand-300)_0_10px,transparent_10px_18px)] md:block"
        />
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="reveal group relative rounded-3xl bg-white p-7 text-center shadow-card ring-1 ring-brand-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
          >
            <span className="relative mx-auto flex size-[4.5rem] items-center justify-center rounded-2xl bg-linear-to-br from-brand-700 to-brand-950 text-accent-400 shadow-[0_12px_24px_-10px_rgb(13_36_64/0.6)] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
              <Icon name={s.icon} className="size-8" />
              <span className="font-display absolute -top-2.5 -right-2.5 flex size-8 items-center justify-center rounded-full bg-accent-400 text-sm font-extrabold text-ink ring-4 ring-white">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-6 text-xl font-extrabold text-ink">{s.title}</h3>
            <p className="mt-2.5 leading-relaxed text-slate-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
