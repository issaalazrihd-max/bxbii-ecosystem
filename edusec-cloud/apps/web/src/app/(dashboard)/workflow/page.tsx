"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";

const steps = [
  ["Lead", "Capture interest and follow up.", "/operations/admissions"],
  ["Student", "Create the learner record.", "/students"],
  ["Enrollment", "Place the learner in a batch.", "/erp/enrollments"],
  ["Invoice", "Issue and track fees.", "/erp/invoices"],
  ["Payment", "Record and reconcile payments.", "/erp/payments"],
  ["Attendance", "Track participation by session.", "/operations/attendance"],
  ["Assessment", "Record results and outcomes.", "/operations/exams"],
  ["Certificate", "Issue and verify completion.", "/operations/certificates"],
  ["Reports", "Measure delivery and performance.", "/operations/reports"],
] as const;

export default function WorkflowPage() {
  const [summary, setSummary] = useState({ students: 0, batches: 0, enrollments: 0, invoices: 0 });

  useEffect(() => {
    Promise.all([api.searchStudents(), api.listBatches(), api.listEnrollments(), api.listInvoices()])
      .then(([students, batches, enrollments, invoices]) =>
        setSummary({ students: students.length, batches: batches.length, enrollments: enrollments.length, invoices: invoices.length })
      )
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Institute workflow</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">From lead to certificate</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">One operating flow for admissions, academic delivery and finance.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[['Students', summary.students], ['Batches', summary.batches], ['Enrollments', summary.enrollments], ['Invoices', summary.invoices]].map(([label, value]) => (
          <Card key={String(label)}><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div></Card>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map(([title, description, href], index) => (
          <Link href={href} key={title}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
              <div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-xs font-bold text-accent">{String(index + 1).padStart(2, '0')}</span><span className="text-slate-300">→</span></div>
              <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
