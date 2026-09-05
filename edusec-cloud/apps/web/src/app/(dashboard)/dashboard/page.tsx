"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { api } from "@/lib/api-client";

/**
 * Executive dashboard (Institute Management System spec, Section 7).
 * Phase 1 scope: tenant-wide counts backed by real data (students, staff,
 * branches). Revenue/attendance/course widgets and branch/date filters land
 * once Finance, Attendance, and Programs/Courses ship in later phases.
 */
export default function DashboardPage() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.getDashboardSummary>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError((err as Error).message));
  }, []);

  const value = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <select className="rounded border border-surface-border px-3 py-1.5 text-sm">
          <option>All branches</option>
          <option>Head Office</option>
          <option>Muscat</option>
          <option>Salalah</option>
          <option>Sohar</option>
        </select>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle>Total Students</CardTitle>
          <CardValue>{value(summary?.totalStudents)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Active Students</CardTitle>
          <CardValue>{value(summary?.activeStudents)}</CardValue>
        </Card>
        <Card>
          <CardTitle>New Students This Month</CardTitle>
          <CardValue>{value(summary?.newStudentsThisMonth)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Branches</CardTitle>
          <CardValue>{value(summary?.totalBranches)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Employees</CardTitle>
          <CardValue>{value(summary?.totalEmployees)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Trainers</CardTitle>
          <CardValue>{value(summary?.totalTrainers)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Active Trainers</CardTitle>
          <CardValue>{value(summary?.activeTrainers)}</CardValue>
        </Card>
      </div>

      <Card>
        <CardTitle>Getting started</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Phase 1 (auth, roles &amp; permissions, branch management, student management, demo
          data) is live — the counts above come from the seeded demo dataset. Revenue,
          attendance, and course-popularity widgets light up once Programs, Courses, Attendance,
          and Finance ship in later phases — see the Phase roadmap.
        </p>
      </Card>
    </div>
  );
}
