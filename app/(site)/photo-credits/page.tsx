import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Photo Credits | Southaven Roofers",
  description:
    "Sources and licenses for the photographs used on Southaven Roofers, including Pexels, Unsplash, U.S. government public domain and Creative Commons images.",
  path: "/photo-credits",
});

export default function PhotoCreditsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
      <Breadcrumbs items={[{ name: "Photo Credits", href: "/photo-credits" }]} />
      <h1 className="mt-4 text-[2rem] leading-tight font-extrabold tracking-tight text-ink sm:text-[2.4rem]">Photo credits</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">
        Photos on this site are illustrative. They show typical roofing work, materials and storm damage, and are not photos of specific
        jobs or of any particular contractor. Each image is used under the license listed below. Creative Commons images may have been
        resized or cropped.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {Object.entries(images).map(([key, img]) => (
          <li key={key} className="flex gap-4 rounded-2xl border border-brand-100 p-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-brand-100">
              <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm leading-relaxed">
              <p className="font-semibold text-ink">{img.alt}</p>
              <p className="mt-1 text-slate-600">
                By {img.credit.author} via{" "}
                <a href={img.credit.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">
                  {img.credit.source}
                </a>
              </p>
              <p className="text-slate-600">
                License:{" "}
                {img.credit.licenseUrl ? (
                  <a href={img.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">
                    {img.credit.license}
                  </a>
                ) : (
                  img.credit.license
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
