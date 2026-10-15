import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/CallButton";
import { PostCard } from "@/components/Cards";
import { CtaBand } from "@/components/Cta";
import { getCollection } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Roofing Guides & Blog for Southaven, MS Homeowners",
  description:
    "Roof costs, hail and insurance claims, FORTIFIED roofs, choosing a roofer and storm-season tips, written for Southaven, MS homeowners. Free estimates by phone.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const guides = getCollection("guides");
  const posts = getCollection("blog");

  return (
    <>
      <section className="hero-surface">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pt-10">
          <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <h1 className="animate-fade-up text-[2.2rem] leading-[1.1] font-extrabold text-ink sm:text-5xl">
                Roofing Guides &amp; Tips for Southaven Homeowners
              </h1>
              <p className="mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-700 [animation-delay:120ms]">
                Practical, local advice on roof costs, storm damage, insurance claims and materials, so you can talk to a roofer with
                confidence and make the right call for your home.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <CallButton location="blog-hero" />
            </div>
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">In-depth homeowner guides</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {guides.map((g) => (
                <PostCard key={g.slug} doc={g} />
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="border-t border-brand-100 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Latest articles</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.slug} doc={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand location="blog-band" />
    </>
  );
}
