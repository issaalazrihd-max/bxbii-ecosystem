"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicSection } from "@/lib/public-api";
import { publicApi } from "@/lib/public-api";
import { pickContent, type Lang } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

/**
 * Renders one Page Builder block (brief Section 30's palette: Hero,
 * Heading, Text, Image, Video, Button, Products, Courses, Projects,
 * Gallery, Team, Partners, Contact Form, Files, PDF, Custom).
 *
 * Content shape is intentionally loose JSON per section (that's the point
 * of the page builder), so every field read here is defensive — a
 * half-filled block renders something reasonable instead of crashing the
 * page. Products/Courses/Projects render an honest "coming soon" panel
 * until the Store, LMS, and Projects modules exist (later phases) to back
 * them with real data.
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

    case "PARTNERS": {
      const logos: any[] = Array.isArray(c.logos) ? c.logos : [];
      return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {c.title && <h2 className="mb-6 text-center text-2xl font-bold text-brand">{c.title}</h2>}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo, i) =>
              logo.url ? (
                <a key={i} href={logo.url} target="_blank" rel="noreferrer" className={`rounded ${FOCUS_RING}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.logoUrl} alt={logo.name ?? ""} className="h-10 grayscale hover:grayscale-0" />
                </a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={logo.logoUrl} alt={logo.name ?? ""} className="h-10 grayscale hover:grayscale-0" />
              ),
            )}
          </div>
        </div>
      );
    }

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
    case "COURSES":
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
            ? "هذا القسم جاهز للعرض بمجرد ربطه بوحدة المتجر/الدورات/المشاريع القادمة."
            : "This section is wired into the page — it will populate automatically once the Store / Courses / Projects module goes live."}
        </p>
      </div>
    </div>
  );
}
