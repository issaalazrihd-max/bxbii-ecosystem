"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "./language-provider";

type Program = { id: string; domain: { en: string; ar: string }; name: { en: string; ar: string }; description: { en: string; ar: string }; duration: { en: string; ar: string }; format: { en: string; ar: string }; status: "open" | "comingSoon"; href?: string };

const art = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85",
];

export function ProgramsPage({ programs }: { programs: Program[] }) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const t = (en: string, a: string) => (ar ? a : en);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [format, setFormat] = useState("all");
  const [status, setStatus] = useState("all");

  const domains = useMemo(() => Array.from(new Set(programs.map((p) => p.domain[lang]).filter(Boolean))), [programs, lang]);
  const formats = useMemo(() => Array.from(new Set(programs.map((p) => p.format[lang]).filter(Boolean))), [programs, lang]);
  const filtered = useMemo(() => programs.filter((p) => {
    const haystack = `${p.name[lang]} ${p.description[lang]} ${p.domain[lang]} ${p.format[lang]}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) &&
      (domain === "all" || p.domain[lang] === domain) &&
      (format === "all" || p.format[lang] === format) &&
      (status === "all" || (status === "open" ? p.status === "open" : p.status === "comingSoon"));
  }), [programs, lang, query, domain, format, status]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <section className="relative overflow-hidden bg-[#07111d] py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,194,218,.2),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(255,83,109,.14),transparent_30%)]" />
        <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar ? "text-right" : ""}`}>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.28em] text-cyan-200">
            <span>BXBII</span><span className="h-px w-8 bg-white/30"/><span>{t("Training", "التدريب")}</span>
          </div>
          <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-[-.06em] sm:text-7xl">{t("Learn. Build. Apply.", "تعلّم. ابنِ. طبّق.")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">{t("Practical technology programs designed around real capabilities, projects and industry needs.", "برامج تقنية عملية صُممت حول القدرات والمشاريع واحتياجات الصناعة الحقيقية.")}</p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-8 sticky top-0 z-20 shadow-sm">
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar ? "text-right" : ""}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search programs...", "ابحث عن البرامج...")} className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white ${ar ? "text-right" : ""}`} />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none">
                <option value="all">{t("All fields", "كل المجالات")}</option>
                {domains.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none">
                <option value="all">{t("All formats", "كل الأنواع")}</option>
                {formats.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none">
                <option value="all">{t("All statuses", "كل الحالات")}</option>
                <option value="open">{t("Open", "متاح")}</option>
                <option value="comingSoon">{t("Coming soon", "قريبًا")}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`mb-8 flex items-end justify-between gap-6 ${ar ? "text-right" : ""}`}>
            <div><span className="text-[10px] font-black uppercase tracking-[.24em] text-red-500">01 / {t("Programs", "البرامج")}</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">{t("Explore available programs", "استكشف البرامج المتاحة")}</h2></div>
            <span className="text-sm text-slate-400">{filtered.length} {t("programs", "برنامج")}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-400">{t("No programs match your filters.", "لا توجد برامج تطابق خيارات البحث.")}</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <article key={p.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden bg-[#07111d]">
                    <img src={art[i % art.length]} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111d] via-[#07111d]/35 to-transparent" />
                    <div className={`absolute left-5 top-5 ${ar ? "left-auto right-5" : ""}`}><span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${p.status === "open" ? "bg-white text-slate-900" : "bg-black/30 text-white backdrop-blur"}`}>{p.status === "open" ? t("OPEN", "متاح للتسجيل") : t("COMING SOON", "قريبًا")}</span></div>
                    <div className={`absolute bottom-5 ${ar ? "right-5 text-right" : "left-5"} text-white`}><span className="text-[10px] font-bold uppercase tracking-[.16em] text-white/65">{p.domain[lang]}</span><h2 className="mt-1 text-2xl font-black leading-tight">{p.name[lang]}</h2></div>
                  </div>
                  <div className={`p-6 ${ar ? "text-right" : ""}`}>
                    <p className="min-h-[72px] text-sm leading-6 text-slate-500">{p.description[lang]}</p>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-xs">
                      <div><span className="mb-1 block text-slate-400">{t("Duration", "المدة")}</span><strong>{p.duration[lang]}</strong></div>
                      <div><span className="mb-1 block text-slate-400">{t("Format", "النوع")}</span><strong>{p.format[lang]}</strong></div>
                    </div>
                    {p.href ? <Link href={p.href} className="mt-6 flex items-center justify-between rounded-xl bg-[#07111d] px-5 py-3.5 text-sm font-black text-white transition group-hover:bg-red-500"><span>{t("View program", "عرض البرنامج")}</span><span>{ar ? "←" : "→"}</span></Link> : <div className="mt-6 rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-bold text-slate-400">{t("Registration will open soon", "سيبدأ التسجيل قريبًا")}</div>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20">
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar ? "text-right" : ""}`}>
          <div className="grid gap-8 rounded-3xl bg-[#07111d] p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><span className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-200">02 / BXBII TRAINING</span><h2 className="mt-4 text-3xl font-black sm:text-4xl">{t("Training built around your organization", "تدريب مصمم حول مؤسستك")}</h2><p className="mt-4 max-w-2xl leading-7 text-white/50">{t("Need a private program for your team? We can adapt delivery, schedule, projects and assessment.", "تحتاج برنامجًا خاصًا لفريقك؟ يمكننا تكييف طريقة التقديم والجدول والمشاريع والتقييم.")}</p></div>
            <Link href="/contact-us" className="rounded-xl bg-white px-6 py-4 text-center text-sm font-black text-[#07111d] transition hover:bg-cyan-100">{t("Talk to us", "تواصل معنا")} →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
