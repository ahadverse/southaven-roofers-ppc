"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteDocAction, previewAction, saveDocAction } from "@/app/admin/(panel)/content/actions";
import { cardClass } from "@/components/admin/content-ui";
import { ICON_LABELS } from "@/components/admin/icon-options";
import { Icon, type IconName } from "@/components/Icon";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Collection = "services" | "guides" | "blog" | "legal";
type Segment =
  | { kind: "html"; html: string }
  | { kind: "cta"; text?: string }
  | { kind: "image"; key: string; caption?: string };

export type EditorDoc = {
  slug: string;
  status: "published" | "draft";
  title: string;
  metaTitle: string;
  description: string;
  navLabel: string;
  excerpt: string;
  image: string;
  icon?: string;
  order: number;
  date?: string;
  category?: string;
  faqs: { q: string; a: string }[];
  related: string[];
  sources: { label: string; url: string }[];
  body: string;
};

export type EditorImage = { key: string; src: string; alt: string };

type Props = {
  collection: Collection;
  docId: string | null;
  initial: EditorDoc;
  updatedLabel: string | null;
  images: EditorImage[];
  icons: IconName[];
  slugs: { slug: string; title: string; collection: Collection }[];
  canDelete: boolean;
  labels: { plural: string; singular: string };
  siteOrigin: string;
  pathPrefix: string;
};

type Notice = { tone: "success" | "error"; message: string; warnings: string[] };

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500";
const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-100";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-50";
const FLASH_KEY = "admin-doc-flash";

const TOOLS = [
  { id: "h2", label: "H2", title: "Section heading", className: "" },
  { id: "h3", label: "H3", title: "Sub-heading", className: "" },
  { id: "bold", label: "B", title: "Bold", className: "font-black" },
  { id: "italic", label: "I", title: "Italic", className: "italic" },
  { id: "link", label: "Link", title: "Link", className: "" },
  { id: "ul", label: "• List", title: "Bulleted list", className: "" },
  { id: "ol", label: "1. List", title: "Numbered list", className: "" },
  { id: "quote", label: "Quote", title: "Quote", className: "" },
  { id: "cta", label: "Call box", title: "Call-to-action box ([[cta]])", className: "" },
  { id: "phone", label: "{{phone}}", title: "Insert the site phone number", className: "" },
] as const;
type ToolId = (typeof TOOLS)[number]["id"];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function Counter({ value, ideal, max }: { value: number; ideal: [number, number]; max: number }) {
  const tone = value === 0 ? "text-slate-400" : value > max ? "text-red-600" : value >= ideal[0] && value <= ideal[1] ? "text-emerald-600" : "text-amber-600";
  return (
    <span className={`text-xs font-semibold tabular-nums ${tone}`}>
      {value} / {ideal[1]}
    </span>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <h2 className="font-display text-lg font-extrabold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Image picker                                                        */
/* ------------------------------------------------------------------ */

function ImageGrid({
  images,
  selected,
  onPick,
  label,
}: {
  images: EditorImage[];
  selected?: string;
  onPick: (key: string) => void;
  label: string;
}) {
  return (
    <ul className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-3 lg:grid-cols-4" aria-label={label}>
      {images.map((img) => {
        const active = img.key === selected;
        return (
          <li key={img.key}>
            <button
              type="button"
              onClick={() => onPick(img.key)}
              aria-pressed={active}
              title={img.alt}
              className={`group block w-full overflow-hidden rounded-lg bg-white text-left ring-2 transition ${
                active ? "ring-brand-600" : "ring-transparent hover:ring-brand-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, no optimisation needed */}
              <img src={img.src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <span className="block truncate px-2 py-1.5 font-mono text-[11px] text-slate-600">{img.key}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export function DocEditor({ collection, docId, initial, images, icons, slugs, canDelete, labels, siteOrigin, pathPrefix, updatedLabel }: Props) {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const isNew = docId === null;
  const isBlog = collection === "blog";
  const isLegal = collection === "legal";
  const isServices = collection === "services";

  const [doc, setDoc] = useState<EditorDoc>(initial);
  const [orderText, setOrderText] = useState(String(initial.order));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showHeroPicker, setShowHeroPicker] = useState(false);
  const [showBodyImages, setShowBodyImages] = useState(false);
  const [relatedQuery, setRelatedQuery] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [previewState, setPreviewState] = useState<"idle" | "loading" | "error">("idle");
  const previewRequest = useRef(0);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  const currentOrder = useMemo(() => {
    const n = Number(orderText);
    return orderText.trim() !== "" && Number.isFinite(n) ? n : 99;
  }, [orderText]);

  const payload = useMemo<EditorDoc>(() => ({ ...doc, order: currentOrder }), [doc, currentOrder]);
  const snapshot = JSON.stringify(payload);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ ...initial, order: Number.isFinite(initial.order) ? initial.order : 99 }));
  const dirty = snapshot !== savedSnapshot;

  const set = useCallback(<K extends keyof EditorDoc>(key: K, value: EditorDoc[K]) => {
    setDoc((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  /* Flash message carried over after creating a new page (the editor remounts on the new URL). */
  useEffect(() => {
    if (!docId) return;
    try {
      const raw = sessionStorage.getItem(FLASH_KEY);
      if (!raw) return;
      const flash = JSON.parse(raw) as { id: string; message: string; warnings: string[] };
      sessionStorage.removeItem(FLASH_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value
      if (flash.id === docId) setNotice({ tone: "success", message: flash.message, warnings: flash.warnings ?? [] });
    } catch {
      /* sessionStorage unavailable: skip the flash message */
    }
  }, [docId]);

  /* Warn before closing or reloading with unsaved edits. */
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* Restore the caret after a toolbar action changed the textarea value. */
  useLayoutEffect(() => {
    const sel = pendingSelection.current;
    const el = bodyRef.current;
    if (sel && el) {
      el.focus();
      el.setSelectionRange(sel[0], sel[1]);
      pendingSelection.current = null;
    }
  }, [doc.body]);

  useEffect(() => {
    if (notice?.tone === "success") noticeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [notice]);

  /* ---------------- Save ---------------- */

  const save = useCallback(() => {
    if (saving || deleting) return;
    setNotice(null);
    startSaving(async () => {
      const res = await saveDocAction(collection, docId, payload);
      if (!res.ok) {
        setErrors(res.errors);
        const fieldErrors = Object.entries(res.errors).filter(([k]) => k !== "form");
        const message =
          res.errors.form ??
          `Nothing was saved. Fix ${fieldErrors.length === 1 ? "the highlighted field" : `the ${fieldErrors.length} highlighted fields`} and try again.`;
        setNotice({ tone: "error", message, warnings: res.warnings });
        // Wait for the error state to render, then bring the first problem into view.
        setTimeout(() => {
          const target = fieldErrors.length ? document.querySelector<HTMLElement>("[aria-invalid='true']") : null;
          (target ?? noticeRef.current)?.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 60);
        return;
      }
      setErrors({});
      setSavedSnapshot(snapshot);
      if (isNew) {
        try {
          sessionStorage.setItem(
            FLASH_KEY,
            JSON.stringify({ id: res.id, message: `${labels.singular} created.`, warnings: res.warnings })
          );
        } catch {
          /* ignore */
        }
        router.replace(`/admin/content/${collection}/${res.id}`);
        return;
      }
      setNotice({ tone: "success", message: "Changes saved. They are live on the website.", warnings: res.warnings });
      router.refresh();
    });
  }, [saving, deleting, collection, docId, payload, snapshot, isNew, labels.singular, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const remove = () => {
    if (!docId) return;
    startDeleting(async () => {
      const res = await deleteDocAction(docId);
      // Only reached when the delete failed: on success the action redirects to the list.
      setConfirmDelete(false);
      setNotice({ tone: "error", message: res.error, warnings: [] });
    });
  };

  /* ---------------- Body toolbar ---------------- */

  const edit = (fn: (text: string, start: number, end: number) => { text: string; start: number; end: number }) => {
    const el = bodyRef.current;
    const start = el?.selectionStart ?? doc.body.length;
    const end = el?.selectionEnd ?? doc.body.length;
    const out = fn(doc.body, start, end);
    pendingSelection.current = [out.start, out.end];
    set("body", out.text);
  };

  const wrap = (before: string, after: string, placeholder: string) =>
    edit((text, s, e) => {
      const selected = text.slice(s, e) || placeholder;
      const next = text.slice(0, s) + before + selected + after + text.slice(e);
      return { text: next, start: s + before.length, end: s + before.length + selected.length };
    });

  const prefixLines = (prefix: string | ((i: number) => string), placeholder: string) =>
    edit((text, s, e) => {
      const lineStart = text.lastIndexOf("\n", s - 1) + 1;
      const nl = text.indexOf("\n", e);
      const lineEnd = nl === -1 ? text.length : nl;
      const block = text.slice(lineStart, lineEnd) || placeholder;
      const changed = block
        .split("\n")
        .map((line, i) => (typeof prefix === "function" ? prefix(i) : prefix) + line)
        .join("\n");
      return { text: text.slice(0, lineStart) + changed + text.slice(lineEnd), start: lineStart, end: lineStart + changed.length };
    });

  const insertBlock = (snippet: string) =>
    edit((text, s, e) => {
      const before = text.slice(0, s);
      const after = text.slice(e);
      const lead = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      const trail = after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
      const next = before + lead + snippet + trail + after;
      const caret = (before + lead + snippet).length;
      return { text: next, start: caret, end: caret };
    });

  const insertLink = () =>
    edit((text, s, e) => {
      const label = text.slice(s, e) || "link text";
      const next = `${text.slice(0, s)}[${label}](https://)${text.slice(e)}`;
      const urlStart = s + label.length + 3;
      return { text: next, start: urlStart, end: urlStart + "https://".length };
    });

  const runTool = (id: ToolId) => {
    switch (id) {
      case "h2":
        return prefixLines("## ", "Section heading");
      case "h3":
        return prefixLines("### ", "Sub-heading");
      case "bold":
        return wrap("**", "**", "bold text");
      case "italic":
        return wrap("*", "*", "italic text");
      case "link":
        return insertLink();
      case "ul":
        return prefixLines("- ", "List item");
      case "ol":
        return prefixLines((i) => `${i + 1}. `, "List item");
      case "quote":
        return prefixLines("> ", "Quote");
      case "cta":
        return insertBlock("[[cta]]");
      case "phone":
        return wrap("{{phone}}", "", "");
    }
  };

  const insertImage = (key: string) => {
    insertBlock(`[[image:${key}|Caption]]`);
    setShowBodyImages(false);
  };

  /* ---------------- Preview ---------------- */

  const openTab = (next: "write" | "preview") => {
    setTab(next);
    if (next !== "preview") return;
    const request = ++previewRequest.current;
    setPreviewState("loading");
    previewAction(doc.body)
      .then((result) => {
        if (request !== previewRequest.current) return;
        setSegments(result as Segment[]);
        setPreviewState("idle");
      })
      .catch(() => {
        if (request === previewRequest.current) setPreviewState("error");
      });
  };

  /* ---------------- Derived ---------------- */

  const imageByKey = useMemo(() => new Map(images.map((i) => [i.key, i])), [images]);
  const heroImage = imageByKey.get(doc.image);
  const words = countWords(doc.body);
  const url = `${siteOrigin.replace(/\/$/, "")}${pathPrefix}${doc.slug || "your-page-url"}`;
  const serpUrl = url.replace(/^https?:\/\//, "").replace(/\//g, " › ");
  const liveHref = !isNew && doc.status === "published" && doc.slug ? `${pathPrefix}${doc.slug}` : null;

  const relatedOptions = useMemo(() => {
    const q = relatedQuery.trim().toLowerCase();
    return slugs
      .filter((s) => !q || s.title.toLowerCase().includes(q) || s.slug.includes(q))
      .sort((a, b) => Number(doc.related.includes(b.slug)) - Number(doc.related.includes(a.slug)));
  }, [slugs, relatedQuery, doc.related]);
  const unknownRelated = doc.related.filter((r) => !slugs.some((s) => s.slug === r));

  const toggleRelated = (slug: string) =>
    set("related", doc.related.includes(slug) ? doc.related.filter((r) => r !== slug) : [...doc.related, slug]);

  const move = <T,>(list: T[], from: number, to: number) => {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    next.splice(to, 0, next.splice(from, 1)[0]);
    return next;
  };

  const invalid = (name: string) => (errors[name] ? ({ "aria-invalid": true, "aria-describedby": `${fid(name)}-error` } as const) : {});
  const cls = (name: string) => `${inputClass} ${errors[name] ? errorInputClass : ""}`;
  const busy = saving || deleting;

  /* ------------------------------------------------------------------ */

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6 pb-28"
      noValidate
    >
      {notice && (
        <div
          ref={noticeRef}
          role={notice.tone === "error" ? "alert" : "status"}
          className={`rounded-xl px-4 py-3 text-sm ring-1 ${
            notice.tone === "error" ? "bg-red-50 text-red-900 ring-red-200" : "bg-emerald-50 text-emerald-900 ring-emerald-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{notice.message}</p>
            <button type="button" onClick={() => setNotice(null)} className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100" aria-label="Dismiss message">
              <Icon name="close" className="size-4" />
            </button>
          </div>
          {notice.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-amber-900">
              {notice.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------------- Basics ---------------- */}
      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" htmlFor={fid("title")} error={errors.title} hint="The main heading shown at the top of the page." className="sm:col-span-2">
            <input
              id={fid("title")}
              value={doc.title}
              onChange={(e) => {
                const title = e.target.value;
                setDoc((d) => ({ ...d, title, slug: slugTouched || isLegal ? d.slug : slugify(title) }));
                setErrors((er) => ({ ...er, title: "", slug: slugTouched ? er.slug : "" }));
              }}
              className={cls("title")}
              {...invalid("title")}
            />
          </Field>

          <Field
            label="URL"
            htmlFor={fid("slug")}
            error={errors.slug}
            hint={
              isLegal
                ? "Legal page URLs are fixed because the footer links to them."
                : isNew
                  ? "Generated from the title. Lowercase letters, numbers and hyphens only."
                  : "Changing this changes the page's address; old links and search results will break."
            }
            className="sm:col-span-2"
          >
            <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-100">
              <span className="flex items-center bg-slate-50 px-3 font-mono text-sm text-slate-500">{pathPrefix}</span>
              <input
                id={fid("slug")}
                value={doc.slug}
                readOnly={isLegal}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                spellCheck={false}
                autoCapitalize="off"
                className={`min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm outline-none read-only:bg-slate-50 read-only:text-slate-500 ${errors.slug ? "text-red-700" : ""}`}
                {...invalid("slug")}
              />
            </div>
          </Field>

          <Field label="Status" htmlFor={fid("status")} hint={doc.status === "draft" ? "Drafts are saved but hidden from the website." : "Visible on the website as soon as you save."}>
            <select
              id={fid("status")}
              value={doc.status}
              onChange={(e) => set("status", e.target.value === "draft" ? "draft" : "published")}
              className={inputClass}
            >
              <option value="published">Published</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </Field>

          {isBlog && (
            <Field label="Publish date" htmlFor={fid("date")} error={errors.date}>
              <input id={fid("date")} type="date" value={doc.date ?? ""} onChange={(e) => set("date", e.target.value)} className={cls("date")} {...invalid("date")} />
            </Field>
          )}

          {isBlog && (
            <Field label="Category" htmlFor={fid("category")} hint="Shown above the post title, e.g. Storm damage.">
              <input id={fid("category")} value={doc.category ?? ""} onChange={(e) => set("category", e.target.value)} className={inputClass} />
            </Field>
          )}

          {(isServices || collection === "guides") && (
            <Field label="Menu label" htmlFor={fid("navLabel")} hint="Short name for menus and cards. Leave blank to use the title.">
              <input id={fid("navLabel")} value={doc.navLabel} onChange={(e) => set("navLabel", e.target.value)} className={inputClass} />
            </Field>
          )}

          {(isServices || collection === "guides") && (
            <Field label="Sort order" htmlFor={fid("order")} hint="Lower numbers come first.">
              <input id={fid("order")} type="number" inputMode="numeric" value={orderText} onChange={(e) => setOrderText(e.target.value)} className={inputClass} />
            </Field>
          )}

          {isServices && (
            <Field label="Icon" htmlFor={fid("icon")} error={errors.icon} hint="Shown on service cards." className="sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  {doc.icon && icons.includes(doc.icon as IconName) ? <Icon name={doc.icon as IconName} className="size-6" /> : <span className="text-slate-400">–</span>}
                </span>
                <select id={fid("icon")} value={doc.icon ?? ""} onChange={(e) => set("icon", e.target.value || undefined)} className={cls("icon")} {...invalid("icon")}>
                  <option value="">No icon</option>
                  {icons.map((name) => (
                    <option key={name} value={name}>
                      {ICON_LABELS[name] ?? name}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          )}

          {!isLegal && (
            <Field label="Short summary" htmlFor={fid("excerpt")} hint="One or two sentences for cards and lists. Leave blank to reuse the meta description." className="sm:col-span-2">
              <textarea id={fid("excerpt")} rows={2} value={doc.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputClass} />
            </Field>
          )}
        </div>
      </Section>

      {/* ---------------- SEO ---------------- */}
      <Section title="Search appearance" description="What Google shows for this page. Write for people first.">
        <div className="space-y-5">
          <Field
            label="SEO title"
            htmlFor={fid("metaTitle")}
            error={errors.metaTitle}
            hint="About 50–60 characters. Include the main topic and the city."
          >
            <input id={fid("metaTitle")} value={doc.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={cls("metaTitle")} {...invalid("metaTitle")} />
            <div className="mt-1 text-right">
              <Counter value={doc.metaTitle.length} ideal={[30, 60]} max={70} />
            </div>
          </Field>
          <Field label="Meta description" htmlFor={fid("description")} error={errors.description} hint="120–158 characters. A plain-language summary that makes someone want to click.">
            <textarea id={fid("description")} rows={3} value={doc.description} onChange={(e) => set("description", e.target.value)} className={cls("description")} {...invalid("description")} />
            <div className="mt-1 text-right">
              <Counter value={doc.description.length} ideal={[120, 158]} max={170} />
            </div>
          </Field>

          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">Google preview</p>
            <div className="mt-2 min-w-0">
              <p className="truncate text-[13px] text-slate-600">{serpUrl}</p>
              <p className="mt-0.5 line-clamp-2 text-xl leading-snug text-[#1a0dab]">{doc.metaTitle || doc.title || "Page title"}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-600">{doc.description || "The meta description will appear here."}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------- Featured image ---------------- */}
      {!isLegal && (
        <Section title="Featured image" description="Shown at the top of the page and in cards. Choose from the photo library.">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-40 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview
                <img src={heroImage.src} alt={heroImage.alt} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-400">None</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs text-slate-500">{doc.image}</p>
              {heroImage && <p className="mt-1 text-sm text-slate-600">{heroImage.alt}</p>}
              <button type="button" onClick={() => setShowHeroPicker((v) => !v)} aria-expanded={showHeroPicker} className={`${buttonSecondary} mt-3`}>
                {showHeroPicker ? "Hide library" : "Change image"}
              </button>
            </div>
          </div>
          {errors.image && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700">
              {errors.image}
            </p>
          )}
          {showHeroPicker && (
            <div className="mt-4">
              <ImageGrid
                images={images}
                selected={doc.image}
                label="Photo library"
                onPick={(key) => {
                  set("image", key);
                  setShowHeroPicker(false);
                }}
              />
            </div>
          )}
        </Section>
      )}

      {/* ---------------- Body ---------------- */}
      <Section title="Article">
        <div className="-mx-1 flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Editor mode" className="inline-flex rounded-xl bg-slate-100 p-1">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => openTab(t)}
                className={`rounded-lg px-4 py-1.5 text-sm font-bold capitalize transition-colors ${tab === t ? "bg-white text-ink shadow-sm" : "text-slate-600 hover:text-ink"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            {words.toLocaleString("en-US")} {words === 1 ? "word" : "words"}
            {!isLegal && words < 800 && words > 0 && <span className="text-amber-600"> · aim for 1,200+</span>}
          </p>
        </div>

        {tab === "write" ? (
          <div className="mt-3">
            <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-1.5 rounded-t-xl border border-b-0 border-slate-300 bg-slate-50 p-2">
              {TOOLS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.title}
                  onClick={() => runTool(b.id)}
                  className={`rounded-lg bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-800 ${b.className}`}
                >
                  {b.label}
                </button>
              ))}
              <button
                type="button"
                title="Insert a photo from the library"
                aria-expanded={showBodyImages}
                onClick={() => setShowBodyImages((v) => !v)}
                className="rounded-lg bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-800"
              >
                Photo
              </button>
            </div>
            {showBodyImages && (
              <div className="border-x border-slate-300 bg-white p-3">
                <p className="mb-2 text-sm text-slate-600">Pick a photo to insert at the cursor. Replace “Caption” with your own text, or delete it for no caption.</p>
                <ImageGrid images={images} label="Insert a photo" onPick={insertImage} />
              </div>
            )}
            <textarea
              id={fid("body")}
              ref={bodyRef}
              value={doc.body}
              onChange={(e) => set("body", e.target.value)}
              rows={26}
              spellCheck
              aria-label="Article body (Markdown)"
              className={`block w-full rounded-b-xl border bg-white px-4 py-3.5 font-mono text-[14px] leading-relaxed outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 ${
                errors.body ? "border-red-400" : "border-slate-300"
              }`}
              {...invalid("body")}
            />
            {errors.body && (
              <p id={`${fid("body")}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
                {errors.body}
              </p>
            )}
            <details className="mt-3 text-sm text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-700">Formatting help</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Start sections with <code className="rounded bg-slate-100 px-1">## Heading</code>; don&apos;t use a single <code className="rounded bg-slate-100 px-1"># </code> (the title is the page heading).
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">[[cta]]</code> or <code className="rounded bg-slate-100 px-1">[[cta|Your headline]]</code> on its own line adds a call box.
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">[[image:photo-key|Caption]]</code> on its own line adds a photo with a caption.
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">{"{{phone}}"}</code>, <code className="rounded bg-slate-100 px-1">{"{{siteName}}"}</code>, <code className="rounded bg-slate-100 px-1">{"{{contactEmail}}"}</code> are replaced automatically.
                </li>
              </ul>
            </details>
          </div>
        ) : (
          <div className="mt-3 min-h-64 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            {previewState === "loading" && <p className="text-sm text-slate-500">Rendering preview…</p>}
            {previewState === "error" && (
              <p role="alert" className="text-sm font-medium text-red-700">
                The preview couldn&apos;t be generated. Check your connection and try again.
              </p>
            )}
            {previewState === "idle" && segments && (
              segments.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing to preview yet.</p>
              ) : (
                <div className="prose article-body max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-[1.5rem] prose-h3:text-xl prose-li:my-1">
                  {segments.map((s, i) => {
                    if (s.kind === "html") return <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} />;
                    if (s.kind === "cta") {
                      return (
                        <div key={i} className="not-prose my-8 rounded-2xl bg-brand-900 p-6 text-white">
                          <p className="font-display text-lg font-extrabold">{s.text || "Call-to-action box"}</p>
                          <p className="mt-1 text-sm text-brand-200">Preview only: the real box shows the call button.</p>
                        </div>
                      );
                    }
                    const img = imageByKey.get(s.key);
                    return (
                      <figure key={i} className="not-prose my-8">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin preview
                          <img src={img.src} alt={img.alt} className="aspect-[16/9] w-full rounded-2xl object-cover" />
                        ) : (
                          <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">Unknown photo “{s.key}”</div>
                        )}
                        {s.caption && <figcaption className="mt-2.5 text-sm text-slate-600">{s.caption}</figcaption>}
                      </figure>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </Section>

      {/* ---------------- FAQs ---------------- */}
      {!isLegal && (
        <Section title="Frequently asked questions" description="Shown at the bottom of the page and used for Google rich results. Each needs both a question and an answer.">
          {doc.faqs.length === 0 && <p className="text-sm text-slate-500">No questions yet.</p>}
          <ol className="space-y-4">
            {doc.faqs.map((faq, i) => (
              <li key={i} className={`rounded-xl p-4 ring-1 ${errors[`faqs.${i}`] ? "bg-red-50/50 ring-red-300" : "bg-slate-50 ring-slate-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">Question {i + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-ink disabled:opacity-30" disabled={i === 0} onClick={() => set("faqs", move(doc.faqs, i, i - 1))} aria-label={`Move question ${i + 1} up`}>
                      <Icon name="arrowUp" className="size-4" />
                    </button>
                    <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-ink disabled:opacity-30" disabled={i === doc.faqs.length - 1} onClick={() => set("faqs", move(doc.faqs, i, i + 1))} aria-label={`Move question ${i + 1} down`}>
                      <Icon name="arrowUp" className="size-4 rotate-180" />
                    </button>
                    <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-red-600" onClick={() => set("faqs", doc.faqs.filter((_, n) => n !== i))} aria-label={`Remove question ${i + 1}`}>
                      <Icon name="close" className="size-4" />
                    </button>
                  </div>
                </div>
                <input
                  value={faq.q}
                  onChange={(e) => set("faqs", doc.faqs.map((f, n) => (n === i ? { ...f, q: e.target.value } : f)))}
                  placeholder="Question"
                  aria-label={`Question ${i + 1}`}
                  className={`${inputClass} mt-2`}
                />
                <textarea
                  value={faq.a}
                  onChange={(e) => set("faqs", doc.faqs.map((f, n) => (n === i ? { ...f, a: e.target.value } : f)))}
                  placeholder="Answer"
                  aria-label={`Answer ${i + 1}`}
                  rows={3}
                  className={`${inputClass} mt-2`}
                />
                {errors[`faqs.${i}`] && (
                  <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
                    {errors[`faqs.${i}`]}
                  </p>
                )}
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => set("faqs", [...doc.faqs, { q: "", a: "" }])} className={`${buttonSecondary} mt-4`}>
            <span aria-hidden="true" className="text-lg leading-none">+</span> Add a question
          </button>
        </Section>
      )}

      {/* ---------------- Related ---------------- */}
      {!isLegal && (
        <Section title="Related pages" description="Up to three are shown under the article. Pick the ones a reader would want next.">
          {unknownRelated.length > 0 && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
              Not found (probably deleted):{" "}
              {unknownRelated.map((r) => (
                <button key={r} type="button" onClick={() => toggleRelated(r)} className="mr-1.5 rounded bg-white px-1.5 py-0.5 font-mono text-xs ring-1 ring-amber-300 hover:bg-amber-100" title="Remove">
                  {r} ×
                </button>
              ))}
            </p>
          )}
          <label htmlFor={fid("relatedSearch")} className="sr-only">
            Search pages
          </label>
          <input id={fid("relatedSearch")} type="search" value={relatedQuery} onChange={(e) => setRelatedQuery(e.target.value)} placeholder="Search pages…" className={inputClass} />
          <p className="mt-2 text-xs text-slate-500">{doc.related.length} selected</p>
          <ul className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200">
            {relatedOptions.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No pages match.</li>}
            {relatedOptions.map((s) => (
              <li key={`${s.collection}-${s.slug}`}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-slate-50">
                  <input type="checkbox" checked={doc.related.includes(s.slug)} onChange={() => toggleRelated(s.slug)} className="mt-1 size-4 accent-brand-700" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{s.title}</span>
                    <span className="block truncate font-mono text-xs text-slate-500">
                      {s.collection === "blog" ? "/blog/" : "/"}
                      {s.slug}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------------- Sources ---------------- */}
      {!isLegal && (
        <Section title="Sources" description="Official or reputable pages the article relies on. Links must start with https://.">
          {doc.sources.length === 0 && <p className="text-sm text-slate-500">No sources yet.</p>}
          <ul className="space-y-3">
            {doc.sources.map((src, i) => (
              <li key={i} className={`rounded-xl p-3 ring-1 ${errors[`sources.${i}`] ? "bg-red-50/50 ring-red-300" : "bg-slate-50 ring-slate-200"}`}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={src.label}
                    onChange={(e) => set("sources", doc.sources.map((s, n) => (n === i ? { ...s, label: e.target.value } : s)))}
                    placeholder="Label, e.g. Mississippi State Board of Contractors"
                    aria-label={`Source ${i + 1} label`}
                    className={`${inputClass} sm:flex-1`}
                  />
                  <input
                    value={src.url}
                    onChange={(e) => set("sources", doc.sources.map((s, n) => (n === i ? { ...s, url: e.target.value } : s)))}
                    placeholder="https://"
                    inputMode="url"
                    aria-label={`Source ${i + 1} URL`}
                    className={`${inputClass} font-mono text-sm sm:flex-1`}
                  />
                  <button type="button" onClick={() => set("sources", doc.sources.filter((_, n) => n !== i))} className="self-start rounded-xl p-2.5 text-slate-500 hover:bg-white hover:text-red-600" aria-label={`Remove source ${i + 1}`}>
                    <Icon name="close" className="size-4" />
                  </button>
                </div>
                {errors[`sources.${i}`] && (
                  <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
                    {errors[`sources.${i}`]}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => set("sources", [...doc.sources, { label: "", url: "" }])} className={`${buttonSecondary} mt-4`}>
            <span aria-hidden="true" className="text-lg leading-none">+</span> Add a source
          </button>
        </Section>
      )}

      {/* ---------------- Delete ---------------- */}
      {canDelete && (
        <Section title="Delete this page">
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy} className="rounded-xl px-4 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-300 hover:bg-red-50 disabled:opacity-50">
              Delete {labels.singular.toLowerCase()}…
            </button>
          ) : (
            <div role="alertdialog" aria-label="Confirm delete" className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
              <p className="text-sm font-semibold text-red-900">
                Permanently delete “{doc.title || "this page"}”? It disappears from the website immediately and can&apos;t be restored.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={remove} disabled={deleting} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
                  {deleting ? "Deleting…" : "Yes, delete it"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className={buttonSecondary}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ---------------- Sticky save bar ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-10">
          <p className="min-w-0 text-sm text-slate-600" aria-live="polite">
            {saving ? (
              "Saving…"
            ) : dirty ? (
              <span className="font-semibold text-amber-700">Unsaved changes</span>
            ) : isNew ? (
              "Not saved yet"
            ) : (
              <>All changes saved{updatedLabel ? <span className="hidden sm:inline"> · Last updated {updatedLabel}</span> : null}</>
            )}
          </p>
          <div className="flex items-center gap-2">
            {liveHref && (
              <a href={liveHref} target="_blank" rel="noopener noreferrer" className={`${buttonSecondary} hidden sm:inline-flex`}>
                View live
                <Icon name="arrowRight" className="size-3.5 -rotate-45" />
              </a>
            )}
            <Link href={`/admin/content/${collection}`} className={`${buttonSecondary} hidden sm:inline-flex`}>
              Back to list
            </Link>
            <button
              type="submit"
              disabled={busy || (!dirty && !isNew)}
              className="inline-flex min-w-32 items-center justify-center rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:ring-3 focus-visible:ring-accent-400 focus-visible:outline-none disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? `Create ${labels.singular.toLowerCase()}` : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
