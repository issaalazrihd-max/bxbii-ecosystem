"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type OperationsModule = {
  slug: string;
  title: string;
  arTitle: string;
  description: string;
  arDescription: string;
  icon: string;
  status: "live" | "build";
  metrics: [string, string, string, string];
  actions: string[];
};

export const OPERATIONS_MODULES: OperationsModule[] = [
  { slug: "admissions", title: "Admissions & CRM", arTitle: "القبول وCRM", description: "Lead capture, applications, follow-up and conversion pipeline.", arDescription: "إدارة العملاء المحتملين والطلبات والمتابعة والتحويل إلى متدربين.", icon: "◎", status: "live", metrics: ["New leads", "Applications", "Follow-ups", "Conversion"], actions: ["New lead", "New application", "Follow-up queue"] },
  { slug: "timetable", title: "Timetable", arTitle: "الجدول الدراسي", description: "Rooms, trainers, batches and conflict-aware weekly scheduling.", arDescription: "إدارة القاعات والمدربين والدفعات وبناء الجداول الأسبوعية.", icon: "▦", status: "build", metrics: ["Sessions", "Rooms", "Trainer load", "Conflicts"], actions: ["Create session", "Weekly view", "Room plan"] },
  { slug: "attendance", title: "Attendance", arTitle: "الحضور والانصراف", description: "Daily attendance, absence reasons, trainer attendance and reports.", arDescription: "تسجيل الحضور والغياب والأعذار وتقارير الحضور للمتدربين والمدربين.", icon: "✓", status: "build", metrics: ["Present today", "Absent", "Rate", "Exceptions"], actions: ["Take attendance", "Review excuses", "Attendance report"] },
  { slug: "exams", title: "Exams & Assessments", arTitle: "الاختبارات والتقييم", description: "Assessment plans, question banks, results and learner progression.", arDescription: "إدارة الاختبارات وبنوك الأسئلة والنتائج وتقدم المتدربين.", icon: "▤", status: "build", metrics: ["Upcoming", "Submissions", "Pass rate", "Pending marking"], actions: ["Create assessment", "Question bank", "Results"] },
  { slug: "certificates", title: "Certificates", arTitle: "الشهادات", description: "Eligibility checks, certificate issuance, verification and archives.", arDescription: "التحقق من الاستحقاق وإصدار الشهادات والتحقق منها وأرشفتها.", icon: "◇", status: "build", metrics: ["Eligible", "Issued", "Pending", "Verified"], actions: ["Issue certificate", "Verify", "Certificate log"] },
  { slug: "reports", title: "Reports & Analytics", arTitle: "التقارير والتحليلات", description: "Operational KPIs across students, academics, finance and branches.", arDescription: "لوحات وتقارير تشغيلية للطلاب والأكاديميات والمالية والفروع.", icon: "◫", status: "build", metrics: ["Learners", "Revenue", "Attendance", "Completion"], actions: ["Executive report", "Academic report", "Export"] },
  { slug: "settings", title: "System Settings", arTitle: "إعدادات النظام", description: "Roles, permissions, academic configuration, numbering and integrations.", arDescription: "الصلاحيات وإعدادات البرامج والترقيم والتكاملات وإعدادات المؤسسة.", icon: "⚙", status: "build", metrics: ["Roles", "Permissions", "Workflows", "Integrations"], actions: ["Roles", "Permissions", "Configuration"] },
];

const SAMPLE_ROWS: Record<string, string[][]> = {
  admissions: [["LEAD-1042", "New enquiry", "Web", "Today"], ["APP-0831", "Application", "Full-Stack Web Development", "In review"], ["LEAD-1037", "Follow-up", "AI Applications", "Tomorrow"], ["APP-0819", "Accepted", "Data Analytics", "Ready to enroll"]],
  timetable: [["09:00", "Full-Stack · Batch 01", "Room A", "Trainer assigned"], ["10:30", "AI Applications · Batch 02", "Lab 1", "Trainer assigned"], ["13:00", "Data Analytics · Batch 03", "Room B", "Open"], ["15:00", "Cybersecurity · Batch 01", "Lab 2", "Conflict check"]],
  attendance: [["BATCH-001", "24 learners", "22 present", "91.7%"], ["BATCH-002", "18 learners", "18 present", "100%"], ["BATCH-003", "20 learners", "17 present", "85%"], ["BATCH-004", "16 learners", "15 present", "93.8%"]],
  exams: [["EX-2026-021", "Python for Work", "18", "14 marked"], ["EX-2026-022", "Data Storytelling", "22", "22 marked"], ["EX-2026-023", "Cyber Hygiene", "16", "Pending"], ["EX-2026-024", "AI Literacy", "25", "Scheduled"]],
  certificates: [["CERT-2026-0104", "Learner #2048", "Full-Stack", "Issued"], ["CERT-2026-0105", "Learner #2051", "AI Applications", "Eligible"], ["CERT-2026-0106", "Learner #2055", "Data Analytics", "Pending"], ["CERT-2026-0107", "Learner #2062", "Cybersecurity", "Verified"]],
  reports: [["Learner growth", "+18.4%", "vs last month", "Positive"], ["Completion rate", "86.2%", "current cycle", "On target"], ["Attendance", "93.4%", "all branches", "Strong"], ["Collected revenue", "OMR 42,680", "current cycle", "Updated today"]],
  settings: [["RBAC", "7 roles", "42 permissions", "Configured"], ["Academic", "7 programs", "4 short courses", "Configured"], ["Branches", "Active", "Branch scoped", "Configured"], ["Integrations", "API", "Database", "Connected"]],
};

export function OperationsCenter({ active }: { active?: string }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => OPERATIONS_MODULES.filter((m) => `${m.title} ${m.arTitle}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const current = OPERATIONS_MODULES.find((m) => m.slug === active);

  if (current) {
    const rows = SAMPLE_ROWS[current.slug] ?? [];
    return (
      <div className="space-y-6" dir="ltr">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><div className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-brand">Operations</div><h1 className="text-3xl font-black tracking-tight text-slate-950">{current.title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{current.description}</p><p className="mt-1 text-sm font-medium text-slate-700" dir="rtl">{current.arDescription}</p></div>
          <Link href="/operations" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-brand/30">← All modules</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{current.metrics.map((label, i) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-semibold text-slate-400">{label}</div><div className="mt-2 text-2xl font-black text-slate-950">{["24","86","93.4%","04"][i]}</div><div className="mt-1 text-[11px] text-slate-400">Live workspace view</div></div>)}</div>
        <div className="flex flex-wrap gap-2">{current.actions.map((action) => <button key={action} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark">{action}</button>)}</div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-950">Operational queue</h2></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Item</th><th className="px-5 py-3">Context</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row[0]} className="hover:bg-slate-50/70">{row.map((cell) => <td key={cell} className="px-5 py-4 text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div></div>
        <div className="rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-5"><div className="font-bold text-brand">Next connection</div><p className="mt-1 text-sm text-slate-600">This module is designed to connect to the shared bxbii Cloud identity, branch scope, audit log and PostgreSQL data layer as its API workflow is enabled.</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-7" dir="ltr">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-brand">bxbii Cloud</div><h1 className="text-3xl font-black tracking-tight text-slate-950">Institute Operations</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">One workspace for admissions, academic delivery, attendance, assessments and certification.</p><p className="mt-1 text-sm font-medium text-slate-700" dir="rtl">مساحة تشغيل موحدة للقبول والتعليم والحضور والاختبارات والشهادات.</p></div><Link href="/dashboard" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">Dashboard</Link></div>
      <div className="relative"><span className="absolute left-4 top-3 text-slate-400">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5" /></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((module) => <Link href={`/operations/${module.slug}`} key={module.slug} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-slate-200/50"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-lg font-black text-brand">{module.icon}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${module.status === "live" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{module.status === "live" ? "Live" : "Phase build"}</span></div><h2 className="mt-5 text-lg font-black text-slate-950">{module.title}</h2><div className="mt-1 text-sm font-bold text-slate-700" dir="rtl">{module.arTitle}</div><p className="mt-3 text-sm leading-6 text-slate-500">{module.description}</p><div className="mt-5 flex items-center justify-between text-xs font-bold text-brand"><span>Open workspace</span><span className="transition group-hover:translate-x-1">→</span></div></Link>)}</div>
    </div>
  );
}
