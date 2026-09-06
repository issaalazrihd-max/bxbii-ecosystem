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

/**
 * Real, currently-live programs. Only "finance-non-financials" links
 * anywhere or claims to be open — everything else is an honestly-labeled
 * "coming soon" placeholder for a training domain that doesn't have real
 * content yet, rather than a fabricated course with a fake date or a fake
 * registration link. Add real entries here as new programs actually ship.
 */
const PROGRAMS: Program[] = [
  {
    id: "finance-non-financials",
    domain: { en: "Business & Finance", ar: "الأعمال والمالية" },
    name: { en: "Finance for Non-Financials", ar: "المالية لغير الماليين" },
    description: {
      en: "A 7-day interactive program by Miran Studio that builds a practical understanding of financial statements and number-driven decision-making — no finance background required.",
      ar: "برنامج تفاعلي من مِران ستوديو مدته 7 أيام، لبناء فهم عملي للقوائم المالية واتخاذ القرار بالأرقام — دون الحاجة لخلفية مالية مسبقة.",
    },
    duration: { en: "7 days, self-paced", ar: "7 أيام، بالسرعة التي تناسبك" },
    format: { en: "Online", ar: "عن بُعد" },
    status: "open",
    href: "/training",
  },
  {
    id: "technology-digital",
    domain: { en: "Technology & Digital Skills", ar: "التقنية والمهارات الرقمية" },
    name: { en: "Technology & Digital Skills Track", ar: "مسار التقنية والمهارات الرقمية" },
    description: {
      en: "A dedicated technology training track is in development.",
      ar: "مسار تدريبي متخصص في التقنية قيد الإعداد حالياً.",
    },
    duration: { en: "To be announced", ar: "يُعلن لاحقاً" },
    format: { en: "Online", ar: "عن بُعد" },
    status: "comingSoon",
  },
  {
    id: "leadership-management",
    domain: { en: "Leadership & Management", ar: "القيادة والإدارة" },
    name: { en: "Leadership & Management Track", ar: "مسار القيادة والإدارة" },
    description: {
      en: "A leadership and people-management program is in development.",
      ar: "برنامج في القيادة وإدارة الفرق قيد الإعداد حالياً.",
    },
    duration: { en: "To be announced", ar: "يُعلن لاحقاً" },
    format: { en: "Online", ar: "عن بُعد" },
    status: "comingSoon",
  },
];

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
  },
};

export function ProgramsPage() {
  const { lang } = useLanguage();
  const copy = t[lang];

  return (
    <div>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent-light">{copy.eyebrow}</p>
          <h1 className="text-3xl font-bold sm:text-5xl">{copy.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80 sm:text-lg">{copy.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.id} program={program} lang={lang} copy={copy} />
          ))}
        </div>
      </section>

      <section className="border-t border-surface-border bg-surface-subtle">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-brand">{copy.corporateTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">{copy.corporateBody}</p>
          <Link
            href="/contact-us"
            className="mt-6 inline-block rounded bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light"
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
            className="block w-full rounded bg-accent px-4 py-2 text-center text-sm font-semibold text-white hover:bg-accent-light"
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
