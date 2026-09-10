"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, type AdminEnrollment, type AdminBatch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudentResult {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
}

const STATUS_TONE: Record<AdminEnrollment["status"], "success" | "warning" | "neutral" | "info"> = {
  ENROLLED: "success",
  WAITLISTED: "warning",
  COMPLETED: "info",
  WITHDRAWN: "neutral",
  CANCELLED: "neutral",
};

/**
 * ERP Phase 1 — Enrollments admin: links a Student to a Batch. Opening this
 * page from a batch row (Batches admin → "Enrollments") pre-filters to
 * that batch via ?batchId=; it also works standalone to look up a
 * student's enrollments. Wrapped in Suspense because it reads
 * useSearchParams(), which Next.js's App Router requires for any page
 * that isn't otherwise forced dynamic.
 */
export default function ErpEnrollmentsPage() {
  return (
    <Suspense fallback={null}>
      <ErpEnrollmentsPageInner />
    </Suspense>
  );
}

function ErpEnrollmentsPageInner() {
  const searchParams = useSearchParams();
  const initialBatchId = searchParams.get("batchId") ?? "";

  const [batchId, setBatchId] = useState(initialBatchId);
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [enrollBatchId, setEnrollBatchId] = useState(initialBatchId);
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const load = (forBatchId: string) => {
    api
      .listEnrollments(forBatchId ? { batchId: forBatchId } : undefined)
      .then(setEnrollments)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    api.listBatches().then(setBatches).catch(() => undefined);
    load(initialBatchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(batchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  const searchStudents = async () => {
    try {
      const results = await api.searchStudents(studentQuery || undefined);
      setStudentResults(results as StudentResult[]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !enrollBatchId) {
      setError("Pick both a student and a batch.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.createEnrollment({ studentId: selectedStudent.id, batchId: enrollBatchId });
      setSelectedStudent(null);
      setStudentQuery("");
      setStudentResults([]);
      setShowEnrollForm(false);
      load(batchId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (enrollment: AdminEnrollment, status: AdminEnrollment["status"]) => {
    try {
      await api.updateEnrollment(enrollment.id, { status });
      load(batchId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (enrollment: AdminEnrollment) => {
    try {
      await api.deleteEnrollment(enrollment.id);
      load(batchId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Enrollments</h1>
        <Button onClick={() => setShowEnrollForm((v) => !v)}>{showEnrollForm ? "Cancel" : "Enroll Student"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Filter by batch</label>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="rounded border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batchCode} — {b.program?.enName ?? b.course?.enTitle ?? ""}
            </option>
          ))}
        </select>
      </div>

      {showEnrollForm && (
        <Card>
          <form onSubmit={onEnroll} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Batch</label>
              <select
                required
                value={enrollBatchId}
                onChange={(e) => setEnrollBatchId(e.target.value)}
                className="w-full max-w-md rounded border border-surface-border px-3 py-1.5 text-sm"
              >
                <option value="" disabled>
                  Select a batch
                </option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchCode} — {b.program?.enName ?? b.course?.enTitle ?? ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Find student</label>
              <div className="flex max-w-md gap-2">
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchStudents();
                    }
                  }}
                  placeholder="Name, student code, mobile, or email"
                  className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
                />
                <Button type="button" onClick={searchStudents}>
                  Search
                </Button>
              </div>
            </div>

            {studentResults.length > 0 && !selectedStudent && (
              <div className="max-w-md divide-y divide-surface-border rounded border border-surface-border">
                {studentResults.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-subtle"
                  >
                    <span className="font-mono text-xs text-slate-400">{s.studentCode}</span> {s.firstName} {s.lastName}
                  </button>
                ))}
              </div>
            )}

            {selectedStudent && (
              <div className="flex max-w-md items-center justify-between rounded border border-surface-border bg-surface-subtle px-3 py-2 text-sm">
                <span>
                  {selectedStudent.firstName} {selectedStudent.lastName}{" "}
                  <span className="font-mono text-xs text-slate-400">({selectedStudent.studentCode})</span>
                </span>
                <button type="button" onClick={() => setSelectedStudent(null)} className="text-xs text-accent hover:underline">
                  Change
                </button>
              </div>
            )}

            <Button type="submit" disabled={saving || !selectedStudent}>
              {saving ? "Enrolling..." : "Enroll"}
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle text-slate-500">
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Enrolled</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((en) => (
              <tr key={en.id} className="border-t border-surface-border">
                <td className="px-4 py-2">
                  {en.student ? (
                    <>
                      {en.student.firstName} {en.student.lastName}{" "}
                      <span className="font-mono text-xs text-slate-400">({en.student.studentCode})</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2">
                  {en.batch ? `${en.batch.batchCode} — ${en.batch.program?.enName ?? en.batch.course?.enTitle ?? ""}` : "—"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONE[en.status]}>{en.status}</Badge>
                    <select
                      value={en.status}
                      onChange={(e) => changeStatus(en, e.target.value as AdminEnrollment["status"])}
                      className="rounded border border-surface-border bg-transparent px-2 py-1 text-xs"
                    >
                      <option value="ENROLLED">Enrolled</option>
                      <option value="WAITLISTED">Waitlisted</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-slate-400">{new Date(en.enrollmentDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => remove(en)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No enrollments yet — enroll a student into a batch above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
