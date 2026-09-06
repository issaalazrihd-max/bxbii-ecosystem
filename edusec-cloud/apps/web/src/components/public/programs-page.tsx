"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";

type ProgramStatus = "open" | "comingSoon";

type Program = {
  id: string;
  domain: { en: string; ar: string };
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  duration: { en: string; ar: string };
  format: { en: string; ar: string };
  status: ProgramStatus;
  href?: string;
};

const t = {
  en: {
    eyebrow: "Programs",
    title: "Training programs at bxbii",
    subtitle:
      "Practical, self-paced programs across business, technology, and leadership. New programs are added as they're ready — every program shown here is real.",
    domainLabel: "Domain",
    durationLabel: "Duration",
    formatLabel: "Format",
    openBadge: "Registration open",
    comingSoonBadge: "Coming soon",
    detailsCta: "View program",
    registerCta: "Start now",
    comingSoonCta: "Not available yet",
    corporateTitle: "Training for teams and organizations",
    corporateBody:
      "Looking to train a team or department? bxbii can tailor a program's schedule and delivery for your organization.",
    corporateCta: "Contact us about corporate training",
    emptyState: "Programs are being updated — check back shortly.",
  },
  ar: {
    eyebrow: "البرامج",
    title: "برامج التدريب في bxbii",
    subtitle:
      "برامج عملية بالسرعة التي تناسبك في مجالات الأعمال والتقنية والقيادة. تُضاف برامج جديدة عند اكتمالها — كل برنامج معروض هنا حقيقي ومتاح فعلياً أو مُعلن بصدق أنه قادم.",
    domainLabel: "المجال",
    durationLabel: "المدة",
    formatLabel: "طريقة التقديم",
    openBadge: "التسجيل متاح",
    comingSoonBadge: "قريباً",
    detailsCta: "عرض البرنامج",
    registerCta: "ابدأ الآن",
    comingSoonCta: "غير متاح بعد",
    corporateTitle: "تدريب للفرق والمؤسسات",
    corporateBody:
      "هل ترغب في تدريب فريق أو قسم كامل؟ يمكن لـ bxbii تخصيص جدول البرنامج وطريقة تقديمه لمؤسستكم.",
    corporateCta: "تواصل معنا بخصوص التدريب المؤسسي",
    emptyState: "يتم تحديث البرامج حالياً — يرجى المحاولة بعد قليل.",
  },
};

/**
 * Programs are now real CMS data (Task #44 — Programs module) instead of a
 * hardcoded array: the (public)/programs route fetches them server-side via
 * publicApi.getPrograms() and passes them in here already mapped to this
 * component's existing Program shape, so this file's own rendering logic —
 * and the page's visual output — is unchanged from the pre-CMS version.
 */
export function ProgramsPage({ programs }: { programs: Program[] }) {
  const { lang } = useLanguage();
  const copy = t[lang];

  return (
    <div>
      <section className="bg-brand text-white">
        {/* py-20 matches the CMS page-builder's Hero block (section-renderer.tsx)
            and the /training hero — interface pass (Task #41 follow-up):
            every hero on the site now shares the same vertical rhythm. */}
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent-light">{copy.eyebrow}</p>
          <h1 className="text-3xl font-bold sm:text-5xl">{copy.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80 sm:text-lg">{copy.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {programs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} lang={lang} copy={copy} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">{copy.emptyState}</p>
        )}
      </section>

      <section className="border-t border-surface-border bg-surface-subtle">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-brand">{copy.corporateTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">{copy.corporateBody}</p>
          <Link
            href="/contact-us"
            className="mt-6 inline-block rounded bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
          >
            {copy.corporateCta}
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProgramCard({
  program,
  lang,
  copy,
}: {
  program: Program;
  lang: "en" | "ar";
  copy: (typeof t)["en"];
}) {
  const isOpen = program.status === "open";

  return (
    <article className="flex flex-col rounded-lg border border-surface-border bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">{program.domain[lang]}</span>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium " +
            (isOpen ? "bg-status-success/10 text-status-success" : "bg-status-warning/10 text-status-warning")
          }
        >
          {isOpen ? copy.openBadge : copy.comingSoonBadge}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold text-brand">{program.name[lang]}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{program.description[lang]}</p>

      <dl className="mt-4 space-y-1 text-sm text-slate-500">
        <div className="flex gap-2">
          <dt className="font-medium text-slate-700">{copy.durationLabel}:</dt>
          <dd>{program.duration[lang]}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-slate-700">{copy.formatLabel}:</dt>
          <dd>{program.format[lang]}</dd>
        </div>
      </dl>

      <div className="mt-5">
        {isOpen && program.href ? (
          <Link
            href={program.href}
            className="block w-full rounded bg-accent px-4 py-2 text-center text-sm font-semibold text-white hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {copy.registerCta}
          </Link>
        ) : (
          <span className="block w-full cursor-not-allowed rounded border border-surface-border px-4 py-2 text-center text-sm font-medium text-slate-400">
            {copy.comingSoonCta}
          </span>
        )}
      </div>
    </article>
  );
}
