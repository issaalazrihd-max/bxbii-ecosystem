"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicSection, PublicPartner, PublicCourse, PublicProgram } from "@/lib/public-api";
import { publicApi } from "@/lib/public-api";
import { pickContent, type Lang } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

/**
 * Renders one Page Builder block (brief Section 30's palette: Hero,
 * Heading, Text, Image, Video, Button, Products, Programs, Courses,
 * Projects, Gallery, Team, Partners, Contact Form, Files, PDF, Custom).
 *
 * Content shape is intentionally loose JSON per section (that's the point
 * of the page builder), so every field read here is defensive — a
 * half-filled block renders something reasonable instead of crashing the
 * page. Products/Projects still render an honest "coming soon" panel until
 * the Store and Projects modules exist (later phases) to back them with
 * real data; Programs, Courses and Partners now have real backing modules
 * and render actual data instead.
 *
 * Interface pass (Task #41): every interactive element below now carries
 * a visible focus-visible ring. None of them had one before — fine for a
 * mouse, but a real accessibility gap for anyone navigating by keyboard,
 * who previously got no visual indication of which control was focused.
 * FOCUS_RING is one shared class string so it stays consistent everywhere
 * it's used instead of every block inventing its own.
 */
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function SectionRenderer({ sections }: { sections: PublicSection[] }) {
  const { lang } = useLanguage();
  const visible = [...sections].filter((s) => s.isVisible).sort((a, b) => a.position - b.position);

  return (
    <>
      {visible.map((section) => (
        <Block key={section.id} section={section} lang={lang} />
      ))}
    </>
  );
}

function Block({ section, lang }: { section: PublicSection; lang: Lang }) {
  const c = pickContent(section.enContent, section.arContent, lang) as Record<string, any>;

  switch (section.sectionType) {
    case "HERO":
      return (
        <section className="bg-brand text-white">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
            {c.eyebrow && <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent-light">{c.eyebrow}</p>}
            <h1 className="text-3xl font-bold sm:text-5xl">{c.title ?? ""}</h1>
            {c.subtitle && <p className="mx-auto mt-4 max-w-2xl text-white/80 sm:text-lg">{c.subtitle}</p>}
            {c.ctaLabel && c.ctaHref && (
              <Link
                href={c.ctaHref}
                className={`mt-8 inline-block rounded bg-accent px-6 py-3 text-sm font-semibold hover:bg-accent-light ${FOCUS_RING} focus-visible:ring-offset-brand`}
              >
                {c.ctaLabel}
              </Link>
            )}
          </div>
        </section>
      );

    case "HEADING": {
      const level = c.level === 2 ? "h2" : c.level === 3 ? "h3" : "h2";
      const Tag = level as "h2" | "h3";
      return (
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <Tag className={level === "h2" ? "text-2xl font-bold text-brand" : "text-xl font-semibold text-brand"}>
            {c.text ?? ""}
          </Tag>
        </div>
      );
    }

    case "TEXT":
      return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {String(c.text ?? "")
            .split("\n")
            .filter(Boolean)
            .map((para: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed text-slate-700">
                {para}
              </p>
            ))}
        </div>
      );

    case "IMAGE":
      return c.url ? (
        <figure className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.url} alt={c.alt ?? ""} className="w-full rounded-lg object-cover" />
          {c.caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{c.caption}</figcaption>}
        </figure>
      ) : null;

    case "VIDEO":
      return c.url ? (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            <iframe src={c.url} title={c.caption ?? "video"} className="h-full w-full" allowFullScreen />
          </div>
        </div>
      ) : null;

    case "BUTTON":
      return c.href ? (
        <div className="mx-auto max-w-6xl px-4 py-6 text-center sm:px-6">
          <Link
            href={c.href}
            className={`inline-block rounded bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-light ${FOCUS_RING}`}
          >
            {c.label ?? "Learn more"}
          </Link>
        </div>
      ) : null;

    case "GALLERY": {
      const images: any[] = Array.isArray(c.images) ? c.images : [];
      if (images.length === 0) return null;
      return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {c.title && <h2 className="mb-4 text-2xl font-bold text-brand">{c.title}</h2>}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img.url} alt={img.alt ?? ""} className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>
      );
    }

    case "TEAM": {
      const members: any[] = Array.isArray(c.members) ? c.members : [];
      return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {c.title && <h2 className="mb-6 text-center text-2xl font-bold text-brand">{c.title}</h2>}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {members.map((m, i) => (
              <div key={i} className="text-center">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name ?? ""} className="mx-auto h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto h-24 w-24 rounded-full bg-surface-border" />
                )}
                <p className="mt-2 font-semibold text-brand">{m.name}</p>
                {m.role && <p className="text-sm text-slate-500">{m.role}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "PARTNERS":
      return <PartnersBlock title={c.title} />;

    case "PROGRAMS":
      return <ProgramsBlock title={c.title} lang={lang} />;

    case "COURSES":
      return <CoursesBlock title={c.title} lang={lang} />;

    case "FILES": {
      const files: any[] = Array.isArray(c.files) ? c.files : [];
      return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {c.title && <h2 className="mb-4 text-2xl font-bold text-brand">{c.title}</h2>}
          <ul className="divide-y divide-surface-border rounded-lg border border-surface-border">
            {files.map((f, i) => (
              <li key={i}>
                <a
                  href={f.url}
                  className={`flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-surface-subtle ${FOCUS_RING} focus-visible:ring-inset`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📄 {f.name ?? f.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "PDF":
      return c.url ? (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {c.title && <h2 className="mb-4 text-2xl font-bold text-brand">{c.title}</h2>}
          <iframe src={c.url} title={c.title ?? "PDF"} className="h-[32rem] w-full rounded-lg border border-surface-border" />
        </div>
      ) : null;

    case "CONTACT_FORM":
      return <ContactFormBlock title={c.title} description={c.description} submitLabel={c.submitLabel} lang={lang} />;

    case "PRODUCTS":
    case "PROJECTS":
      return <ComingSoonBlock title={c.title} type={section.sectionType} lang={lang} />;

    case "CUSTOM":
      return c.html ? (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" dangerouslySetInnerHTML={{ __html: String(c.html) }} />
      ) : null;

    default:
      return null;
  }
}

/**
 * Partners module: fetches the real partner roster from GET /public/partners
 * instead of the previous per-page static c.logos JSON, mirroring how
 * ContactFormBlock was upgraded from a fake success message to the real
 * POST /public/contact endpoint. Renders nothing while empty/loading so an
 * editor who hasn't added any partners yet doesn't get a broken-looking
 * empty block on the live site.
 */
function PartnersBlock({ title }: { title?: string }) {
  const [partners, setPartners] = useState<PublicPartner[] | null>(null);

  useEffect(() => {
    let active = true;
    publicApi.getPartners().then((result) => {
      if (active) setPartners(result ?? []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!partners || partners.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {title && <h2 className="mb-6 text-center text-2xl font-bold text-brand">{title}</h2>}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {partners.map((partner) =>
          partner.websiteUrl ? (
            <a
              key={partner.id}
              href={partner.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className={`rounded ${FOCUS_RING}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partner.logoUrl} alt={partner.name} className="h-10 grayscale hover:grayscale-0" />
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={partner.id} src={partner.logoUrl} alt={partner.name} className="h-10 grayscale hover:grayscale-0" />
          ),
        )}
      </div>
    </div>
  );
}

/**
 * One catalog card shared by Programs and Courses — same OPEN/COMING_SOON
 * badge treatment, same layout, only the fields feeding it differ. Pulled
 * out once ProgramsBlock needed the exact card CoursesBlock already had,
 * instead of forking a second near-identical copy.
 */
function CatalogCard({
  status,
  name,
  description,
  duration,
  format,
  hrefOverride,
  lang,
}: {
  status: "OPEN" | "COMING_SOON";
  name: string;
  description: string;
  duration?: string;
  format?: string;
  hrefOverride?: string | null;
  lang: Lang;
}) {
  const isOpen = status === "OPEN";
  const card = (
    <div className="flex h-full flex-col rounded-lg border border-surface-border p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isOpen ? "bg-status-success/10 text-status-success" : "bg-surface-subtle text-slate-500"
          }`}
        >
          {isOpen ? (lang === "ar" ? "التسجيل متاح" : "Open") : lang === "ar" ? "قريباً" : "Coming soon"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-brand">{name}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {duration && <span>{duration}</span>}
        {format && <span>{format}</span>}
      </div>
    </div>
  );
  return isOpen && hrefOverride ? (
    <Link href={hrefOverride} className={`rounded-lg ${FOCUS_RING}`}>
      {card}
    </Link>
  ) : (
    <div>{card}</div>
  );
}

/**
 * Programs module: fetches the real programs catalog from GET
 * /public/programs — the same real-data upgrade Courses and Partners
 * already have, so the homepage's Tuwaiq-inspired "training domains"
 * section reads live off the same table the dedicated /programs page
 * uses instead of duplicating program content as static section JSON.
 * Groups cards by domain (Program.arDomain/enDomain) since that grouping
 * already exists on the model — it's exactly the "browse by domain" shape
 * a Tuwaiq-style homepage uses, with zero new backend data. Ends with a
 * link to /programs for the full catalog, mirroring the "view all" pattern.
 */
function ProgramsBlock({ title, lang }: { title?: string; lang: Lang }) {
  const [programs, setPrograms] = useState<PublicProgram[] | null>(null);

  useEffect(() => {
    let active = true;
    publicApi.getPrograms().then((result) => {
      if (active) setPrograms(result ?? []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!programs || programs.length === 0) return null;

  const domains: { label: string; items: PublicProgram[] }[] = [];
  const byLabel = new Map<string, { label: string; items: PublicProgram[] }>();
  for (const p of programs) {
    const label = (lang === "ar" ? p.arDomain : p.enDomain) || "";
    let bucket = byLabel.get(label);
    if (!bucket) {
      bucket = { label, items: [] };
      byLabel.set(label, bucket);
      domains.push(bucket);
    }
    bucket.items.push(p);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {title && <h2 className="mb-6 text-center text-2xl font-bold text-brand">{title}</h2>}
      <div className="space-y-8">
        {domains.map((domain) => (
          <div key={domain.label || "_"}>
            {domain.label && (
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{domain.label}</h3>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {domain.items.map((program) => (
                <CatalogCard
                  key={program.id}
                  status={program.status}
                  name={lang === "ar" ? program.arName : program.enName}
                  description={lang === "ar" ? program.arDescription : program.enDescription}
                  duration={lang === "ar" ? program.arDuration : program.enDuration}
                  format={lang === "ar" ? program.arFormat : program.enFormat}
                  hrefOverride={program.hrefOverride}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/programs"
          className={`inline-block rounded border border-brand px-5 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white ${FOCUS_RING}`}
        >
          {lang === "ar" ? "عرض جميع البرامج" : "View all programs"}
        </Link>
      </div>
    </div>
  );
}

/**
 * Courses module: fetches the real course catalog from GET /public/courses,
 * the same upgrade Partners got — replacing the generic "coming soon"
 * placeholder this block used to share with Products/Projects now that a
 * real Courses admin module backs it. Mirrors PartnersBlock's loading/empty
 * behavior (render nothing rather than a broken-looking empty grid), and
 * shares CatalogCard with ProgramsBlock for the OPEN/COMING_SOON treatment
 * already proven on /programs.
 */
function CoursesBlock({ title, lang }: { title?: string; lang: Lang }) {
  const [courses, setCourses] = useState<PublicCourse[] | null>(null);

  useEffect(() => {
    let active = true;
    publicApi.getCourses().then((result) => {
      if (active) setCourses(result ?? []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!courses || courses.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {title && <h2 className="mb-6 text-center text-2xl font-bold text-brand">{title}</h2>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CatalogCard
            key={course.id}
            status={course.status}
            name={lang === "ar" ? course.arTitle : course.enTitle}
            description={lang === "ar" ? course.arDescription : course.enDescription}
            duration={lang === "ar" ? course.arDuration : course.enDuration}
            format={lang === "ar" ? course.arFormat : course.enFormat}
            hrefOverride={course.hrefOverride}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

const FORM_FIELD = `w-full rounded border border-surface-border px-3 py-2 text-sm ${FOCUS_RING} focus-visible:ring-offset-0 focus-visible:border-accent`;

/**
 * Field labels/placeholders and the send/success/error copy are UI chrome,
 * not editorial content, so they live here as a plain bilingual object
 * rather than as ar/enContent fields on the section (title/description/
 * submitLabel stay page-builder-editable since an editor writes those per
 * page).
 */
const contactFormCopy = {
  en: {
    name: "Your name",
    email: "Email",
    phone: "Phone (optional)",
    subject: "Subject (optional)",
    message: "Message",
    send: "Send",
    sending: "Sending...",
    success: "Thanks — we'll be in touch shortly.",
    error: "Something went wrong sending your message. Please try again.",
  },
  ar: {
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف (اختياري)",
    subject: "الموضوع (اختياري)",
    message: "الرسالة",
    send: "إرسال",
    sending: "جارٍ الإرسال...",
    success: "شكراً لتواصلكم — سنرد عليكم قريباً.",
    error: "حدث خطأ أثناء إرسال رسالتكم. يرجى المحاولة مرة أخرى.",
  },
};

/**
 * Contact module: wired to the real POST /public/contact endpoint instead
 * of the previous Phase-2 shell that faked a success message without
 * sending anything anywhere. Field values are free text a visitor types,
 * not editorial content, so — unlike title/description/submitLabel above
 * — the inputs never get a hardcoded dir: they inherit the document-level
 * dir the language toggle already sets, exactly like the Task #40 fix for
 * other public-facing free-text inputs.
 */
function ContactFormBlock({
  title,
  description,
  submitLabel,
  lang,
}: {
  title?: string;
  description?: string;
  submitLabel?: string;
  lang: Lang;
}) {
  const copy = contactFormCopy[lang];
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [values, setValues] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const ok = await publicApi.submitContactForm({
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      subject: values.subject || undefined,
      message: values.message,
    });
    if (ok) {
      setStatus("sent");
      setValues({ name: "", email: "", phone: "", subject: "", message: "" });
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      {title && <h2 className="mb-2 text-2xl font-bold text-brand">{title}</h2>}
      {description && <p className="mb-6 text-slate-600">{description}</p>}
      {status === "sent" ? (
        <p className="rounded border border-status-success/30 bg-status-success/10 px-4 py-3 text-status-success">
          {copy.success}
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <input required placeholder={copy.name} value={values.name} onChange={update("name")} className={FORM_FIELD} />
          <input
            required
            type="email"
            placeholder={copy.email}
            value={values.email}
            onChange={update("email")}
            className={FORM_FIELD}
          />
          <input placeholder={copy.phone} value={values.phone} onChange={update("phone")} className={FORM_FIELD} />
          <input placeholder={copy.subject} value={values.subject} onChange={update("subject")} className={FORM_FIELD} />
          <textarea
            required
            placeholder={copy.message}
            rows={4}
            value={values.message}
            onChange={update("message")}
            className={FORM_FIELD}
          />
          {status === "error" && <p className="text-sm text-status-danger">{copy.error}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className={`rounded bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-50 ${FOCUS_RING}`}
          >
            {status === "sending" ? copy.sending : submitLabel ?? copy.send}
          </button>
        </form>
      )}
    </div>
  );
}

function ComingSoonBlock({ title, type, lang }: { title?: string; type: string; lang: Lang }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-lg border border-dashed border-surface-border bg-surface-subtle p-8 text-center">
        <h2 className="text-xl font-bold text-brand">{title ?? type}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "ar"
            ? "هذا القسم جاهز للعرض بمجرد ربطه بوحدة المتجر أو المشاريع القادمة."
            : "This section is wired into the page — it will populate automatically once the Store / Projects module goes live."}
        </p>
      </div>
    </div>
  );
}
