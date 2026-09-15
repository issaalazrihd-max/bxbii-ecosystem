"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

type Summary = Awaited<ReturnType<typeof api.getDashboardSummary>>;

const quickLinks = [
  ["/students", "Add student", "Register a new learner"],
  ["/erp/batches", "Create batch", "Schedule a program or course"],
  ["/erp/enrollments", "Enroll learner", "Assign a student to a batch"],
  ["/erp/invoices", "New invoice", "Create a learner invoice"],
] as const;

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboardSummary().then(setSummary).catch((err) => setError((err as Error).message));
  }, []);

  const value = (n?: number) => n == null ? "—" : n.toLocaleString();
  const activeRate = summary && summary.totalStudents ? Math.round((summary.activeStudents / summary.totalStudents) * 100) : 0;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#24135F] px-6 py-8 text-white shadow-xl shadow-brand/10 sm:px-8 lg:px-10">
        <div className="absolute -end-16 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/45">bxbii cloud</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Good afternoon, Administrator.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Your learning operations at a glance. Manage learners, programs, batches and finance from one workspace.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/students" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-brand shadow-sm hover:bg-white/90">Add student</Link>
            <Link href="/erp/batches" className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/15">New batch</Link>
          </div>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-danger">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total students" value={value(summary?.totalStudents)} hint={`${activeRate}% active`} icon="◉" />
        <Metric label="New this month" value={value(summary?.newStudentsThisMonth)} hint="Learner registrations" icon="＋" />
        <Metric label="Trainers" value={value(summary?.totalTrainers)} hint={`${value(summary?.activeTrainers)} active`} icon="◇" />
        <Metric label="Branches" value={value(summary?.totalBranches)} hint="Across your network" icon="⌘" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Operations</p><h2 className="mt-1 text-xl font-black text-slate-900">Quick actions</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Workspace</span></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {quickLinks.map(([href, title, body], i) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-md"><div className="flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-sm font-black text-brand">0{i + 1}</span><span className="text-slate-300 transition group-hover:text-brand">↗</span></div><h3 className="mt-5 font-black text-slate-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{body}</p></Link>)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">System status</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Platform overview</h2>
          <div className="mt-6 space-y-5">
            <StatusRow label="Student records" value={summary ? `${summary.totalStudents} records` : "Loading…"} tone="bg-status-success" />
            <StatusRow label="Active trainers" value={summary ? `${summary.activeTrainers} active` : "Loading…"} tone="bg-status-info" />
            <StatusRow label="Branches" value={summary ? `${summary.totalBranches} locations` : "Loading…"} tone="bg-accent" />
          </div>
          <div className="mt-7 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">Next layer</p><p className="mt-1 text-sm font-bold text-slate-700">Attendance, assessments and certificates will plug into the same academic workflow.</p></div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <MiniCard title="Academic" items={["Programs", "Courses", "Batches"]} links={["/cms/programs", "/cms/courses", "/erp/batches"]} />
        <MiniCard title="People" items={["Students", "Trainers", "Branches"]} links={["/students", "/branches", "/branches"]} />
        <MiniCard title="Finance" items={["Invoices", "Payments", "Collections"]} links={["/erp/invoices", "/erp/payments", "/erp/invoices"]} />
      </section>
    </div>
  );
}

function Metric({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 font-black text-brand">{icon}</span></div><p className="mt-5 text-3xl font-black tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs font-semibold text-slate-400">{hint}</p></div>;
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div><div className="flex items-center justify-between text-sm"><span className="font-bold text-slate-700">{label}</span><span className="text-xs font-semibold text-slate-400">{value}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className={`h-1.5 w-full rounded-full ${tone}`} /></div></div>;
}

function MiniCard({ title, items, links }: { title: string; items: string[]; links: string[] }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">{title}</h3><div className="mt-4 divide-y divide-slate-100">{items.map((item, i) => <Link key={item} href={links[i]} className="flex items-center justify-between py-3 text-sm font-semibold text-slate-600 hover:text-brand"><span>{item}</span><span className="text-slate-300">→</span></Link>)}</div></div>;
}
