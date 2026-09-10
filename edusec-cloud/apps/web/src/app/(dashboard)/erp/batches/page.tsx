"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api,
  type AdminBatch,
  type AdminBranch,
  type AdminProgram,
  type AdminCourse,
  type AdminTrainer,
} from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type OfferingType = "PROGRAM" | "COURSE";

type Draft = {
  batchCode: string;
  branchId: string;
  offeringType: OfferingType;
  programId: string;
  courseId: string;
  trainerId: string;
  arLabel: string;
  enLabel: string;
  startDate: string;
  endDate: string;
  schedule: string;
  capacity: string;
  status: AdminBatch["status"];
};

const EMPTY_DRAFT: Draft = {
  batchCode: "",
  branchId: "",
  offeringType: "PROGRAM",
  programId: "",
  courseId: "",
  trainerId: "",
  arLabel: "",
  enLabel: "",
  startDate: "",
  endDate: "",
  schedule: "",
  capacity: "0",
  status: "PLANNED",
};

const STATUS_TONE: Record<AdminBatch["status"], "success" | "warning" | "neutral" | "info"> = {
  PLANNED: "neutral",
  OPEN: "success",
  IN_PROGRESS: "info",
  COMPLETED: "neutral",
  CANCELLED: "warning",
};

function toDto(d: Draft) {
  return {
    batchCode: d.batchCode.trim(),
    branchId: d.branchId,
    programId: d.offeringType === "PROGRAM" ? d.programId : undefined,
    courseId: d.offeringType === "COURSE" ? d.courseId : undefined,
    trainerId: d.trainerId || undefined,
    arLabel: d.arLabel.trim() || undefined,
    enLabel: d.enLabel.trim() || undefined,
    startDate: d.startDate,
    endDate: d.endDate || undefined,
    schedule: d.schedule.trim() || undefined,
    capacity: d.capacity ? Number(d.capacity) : 0,
    status: d.status,
  };
}

/**
 * ERP Phase 1 — Batches admin: scheduled runs of a Program or Course at a
 * branch, with an optional trainer, dates, and capacity. This, together
 * with /erp/enrollments, is the direct answer to "there any admin account
 * to add students, branches, courses? i need to add batches scheduled and
 * ability to edit the details of them all".
 */
export default function ErpBatchesPage() {
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.listBatches().then(setBatches).catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
    api.listBranches().then(setBranches).catch(() => undefined);
    api.listPrograms().then(setPrograms).catch(() => undefined);
    api.listCourses().then(setCourses).catch(() => undefined);
    api.listTrainers().then(setTrainers).catch(() => undefined);
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createBatch(toDto(createDraft));
      setCreateDraft(EMPTY_DRAFT);
      setCreating(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b: AdminBatch) => {
    setEditingId(b.id);
    setEditDraft({
      batchCode: b.batchCode,
      branchId: b.branchId,
      offeringType: b.programId ? "PROGRAM" : "COURSE",
      programId: b.programId ?? "",
      courseId: b.courseId ?? "",
      trainerId: b.trainerId ?? "",
      arLabel: b.arLabel ?? "",
      enLabel: b.enLabel ?? "",
      startDate: b.startDate.slice(0, 10),
      endDate: b.endDate ? b.endDate.slice(0, 10) : "",
      schedule: b.schedule ?? "",
      capacity: String(b.capacity),
      status: b.status,
    });
  };

  const onSaveEdit = async (e: React.FormEvent, batchId: string) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updateBatch(batchId, toDto(editDraft));
      setEditingId(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b: AdminBatch) => {
    try {
      await api.deleteBatch(b.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const offeringLabel = (b: AdminBatch) => b.program?.enName ?? b.course?.enTitle ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Batches</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New Batch"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <BatchForm
            draft={createDraft}
            onChange={setCreateDraft}
            onSubmit={onCreate}
            saving={saving}
            submitLabel="Create batch"
            branches={branches}
            programs={programs}
            courses={courses}
            trainers={trainers}
          />
        </Card>
      )}

      <Card className="divide-y divide-surface-border p-0">
        {batches.map((b) => (
          <div key={b.id}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-medium text-slate-800">{b.batchCode}</span>
                <span className="text-sm text-slate-600">{offeringLabel(b)}</span>
                <span className="text-xs text-slate-400">{b.branch?.branchName}</span>
                <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                <span className="text-xs text-slate-400">
                  {new Date(b.startDate).toLocaleDateString()}
                  {b.endDate ? ` – ${new Date(b.endDate).toLocaleDateString()}` : ""}
                </span>
                <span className="text-xs text-slate-400">
                  {b._count?.enrollments ?? 0}
                  {b.capacity > 0 ? ` / ${b.capacity}` : ""} enrolled
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/erp/enrollments?batchId=${b.id}`}
                  className="rounded px-2 py-1 text-sm font-medium text-accent hover:underline"
                >
                  Enrollments
                </Link>
                <button
                  onClick={() => (editingId === b.id ? setEditingId(null) : startEdit(b))}
                  className="rounded px-2 py-1 text-sm font-medium text-accent hover:underline"
                >
                  {editingId === b.id ? "Close" : "Edit"}
                </button>
                <button onClick={() => remove(b)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
                  🗑
                </button>
              </div>
            </div>
            {editingId === b.id && (
              <div className="border-t border-surface-border bg-surface-subtle px-4 py-4">
                <BatchForm
                  draft={editDraft}
                  onChange={setEditDraft}
                  onSubmit={(e) => onSaveEdit(e, b.id)}
                  saving={saving}
                  submitLabel="Save changes"
                  branches={branches}
                  programs={programs}
                  courses={courses}
                  trainers={trainers}
                />
              </div>
            )}
          </div>
        ))}
        {batches.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            No batches yet — create one to schedule a class students can be enrolled into.
          </p>
        )}
      </Card>
    </div>
  );
}

function BatchForm({
  draft,
  onChange,
  onSubmit,
  saving,
  submitLabel,
  branches,
  programs,
  courses,
  trainers,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  submitLabel: string;
  branches: AdminBranch[];
  programs: AdminProgram[];
  courses: AdminCourse[];
  trainers: AdminTrainer[];
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Batch Code</label>
        <input
          required
          value={draft.batchCode}
          onChange={(e) => onChange({ ...draft, batchCode: e.target.value })}
          placeholder="FIN-2026-A"
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Branch</label>
        <select
          required
          value={draft.branchId}
          onChange={(e) => onChange({ ...draft, branchId: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="" disabled>
            Select a branch
          </option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Offering Type</label>
        <select
          value={draft.offeringType}
          onChange={(e) => onChange({ ...draft, offeringType: e.target.value as OfferingType })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="PROGRAM">Program</option>
          <option value="COURSE">Course</option>
        </select>
      </div>
      {draft.offeringType === "PROGRAM" ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Program</label>
          <select
            required
            value={draft.programId}
            onChange={(e) => onChange({ ...draft, programId: e.target.value })}
            className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
          >
            <option value="" disabled>
              Select a program
            </option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.enName}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Course</label>
          <select
            required
            value={draft.courseId}
            onChange={(e) => onChange({ ...draft, courseId: e.target.value })}
            className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
          >
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.enTitle}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Trainer (optional)</label>
        <select
          value={draft.trainerId}
          onChange={(e) => onChange({ ...draft, trainerId: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="">Unassigned</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
        <select
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value as AdminBatch["status"] })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="PLANNED">Planned</option>
          <option value="OPEN">Open (accepting enrollments)</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Start Date</label>
        <input
          required
          type="date"
          value={draft.startDate}
          onChange={(e) => onChange({ ...draft, startDate: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">End Date (optional)</label>
        <input
          type="date"
          value={draft.endDate}
          onChange={(e) => onChange({ ...draft, endDate: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Schedule</label>
        <input
          value={draft.schedule}
          onChange={(e) => onChange({ ...draft, schedule: e.target.value })}
          placeholder="Sat/Mon/Wed 6-9pm"
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Capacity (0 = unlimited)</label>
        <input
          type="number"
          min={0}
          value={draft.capacity}
          onChange={(e) => onChange({ ...draft, capacity: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Display Label (EN, optional)</label>
        <input
          value={draft.enLabel}
          onChange={(e) => onChange({ ...draft, enLabel: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Display Label (AR, optional)</label>
        <input
          dir="rtl"
          value={draft.arLabel}
          onChange={(e) => onChange({ ...draft, arLabel: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
