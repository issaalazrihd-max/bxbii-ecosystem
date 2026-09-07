"use client";

import { useEffect, useState } from "react";
import { api, type AdminCourse } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Draft = {
  slug: string;
  arTitle: string;
  enTitle: string;
  arDescription: string;
  enDescription: string;
  arDuration: string;
  enDuration: string;
  arFormat: string;
  enFormat: string;
  status: "OPEN" | "COMING_SOON";
  hrefOverride: string;
};

const EMPTY_DRAFT: Draft = {
  slug: "",
  arTitle: "",
  enTitle: "",
  arDescription: "",
  enDescription: "",
  arDuration: "",
  enDuration: "",
  arFormat: "",
  enFormat: "",
  status: "COMING_SOON",
  hrefOverride: "",
};

function toDraft(c: AdminCourse): Draft {
  return {
    slug: c.slug,
    arTitle: c.arTitle,
    enTitle: c.enTitle,
    arDescription: c.arDescription,
    enDescription: c.enDescription,
    arDuration: c.arDuration,
    enDuration: c.enDuration,
    arFormat: c.arFormat,
    enFormat: c.enFormat,
    status: c.status,
    hrefOverride: c.hrefOverride ?? "",
  };
}

function toDto(d: Draft) {
  return {
    slug: d.slug.trim(),
    arTitle: d.arTitle,
    enTitle: d.enTitle,
    arDescription: d.arDescription,
    enDescription: d.enDescription,
    arDuration: d.arDuration,
    enDuration: d.enDuration,
    arFormat: d.arFormat,
    enFormat: d.enFormat,
    status: d.status,
    hrefOverride: d.hrefOverride.trim() || null,
  };
}

/**
 * Courses catalog admin (Courses module) — the CMS backing the COURSES
 * page-builder block. Modeled directly on the Programs admin page (create
 * form + table, inline per-row edit, same OPEN/COMING_SOON status and
 * optional link) since Course is Program's shape minus the domain-grouping
 * fields.
 */
export default function CmsCoursesListPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .listCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createCourse(toDto(createDraft));
      setCreateDraft(EMPTY_DRAFT);
      setCreating(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: AdminCourse) => {
    setEditingId(c.id);
    setEditDraft(toDraft(c));
  };

  const onSaveEdit = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updateCourse(courseId, toDto(editDraft));
      setEditingId(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (c: AdminCourse) => {
    try {
      await api.updateCourse(c.id, { isVisible: !c.isVisible });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (c: AdminCourse) => {
    try {
      await api.deleteCourse(c.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...courses];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await api.reorderCourses(next.map((c) => c.id));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Courses</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New Course"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <CourseForm draft={createDraft} onChange={setCreateDraft} onSubmit={onCreate} saving={saving} submitLabel="Create course" />
        </Card>
      )}

      <Card className="divide-y divide-surface-border p-0">
        {courses.map((c, i) => (
          <div key={c.id}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-800">{c.enTitle}</span>
                <span className="text-sm text-slate-400" dir="rtl">
                  {c.arTitle}
                </span>
                <Badge tone={c.status === "OPEN" ? "success" : "warning"}>{c.status}</Badge>
                {!c.isVisible && <Badge tone="neutral">Hidden</Badge>}
                {c.hrefOverride && <span className="font-mono text-xs text-slate-400">{c.hrefOverride}</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} disabled={i === courses.length - 1} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
                  ↓
                </button>
                <button onClick={() => toggleVisible(c)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
                  {c.isVisible ? "🙈" : "👁"}
                </button>
                <button onClick={() => (editingId === c.id ? setEditingId(null) : startEdit(c))} className="rounded px-2 py-1 text-sm font-medium text-accent hover:underline">
                  {editingId === c.id ? "Close" : "Edit"}
                </button>
                <button onClick={() => remove(c)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
                  🗑
                </button>
              </div>
            </div>
            {editingId === c.id && (
              <div className="border-t border-surface-border bg-surface-subtle px-4 py-4">
                <CourseForm
                  draft={editDraft}
                  onChange={setEditDraft}
                  onSubmit={(e) => onSaveEdit(e, c.id)}
                  saving={saving}
                  submitLabel="Save changes"
                />
              </div>
            )}
          </div>
        ))}
        {courses.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No courses yet — create one to populate the Courses block.</p>
        )}
      </Card>
    </div>
  );
}

function CourseForm({
  draft,
  onChange,
  onSubmit,
  saving,
  submitLabel,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  submitLabel: string;
}) {
  const field = (label: string, key: keyof Draft, opts?: { rtl?: boolean; textarea?: boolean }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {opts?.textarea ? (
        <textarea
          required
          dir={opts?.rtl ? "rtl" : undefined}
          rows={2}
          value={draft[key] as string}
          onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      ) : (
        <input
          required
          dir={opts?.rtl ? "rtl" : undefined}
          value={draft[key] as string}
          onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
        <input
          required
          pattern="[a-z0-9-]+"
          value={draft.slug}
          onChange={(e) => onChange({ ...draft, slug: e.target.value })}
          placeholder="intro-to-bookkeeping"
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
        <select
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value as Draft["status"] })}
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="OPEN">Open (enrollment open)</option>
          <option value="COMING_SOON">Coming soon</option>
        </select>
      </div>

      {field("Title (EN)", "enTitle")}
      {field("Title (AR)", "arTitle", { rtl: true })}
      {field("Description (EN)", "enDescription", { textarea: true })}
      {field("Description (AR)", "arDescription", { rtl: true, textarea: true })}
      {field("Duration (EN)", "enDuration")}
      {field("Duration (AR)", "arDuration", { rtl: true })}
      {field("Format (EN)", "enFormat")}
      {field("Format (AR)", "arFormat", { rtl: true })}

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-500">
          Link (only used when status is Open — e.g. /training)
        </label>
        <input
          value={draft.hrefOverride}
          onChange={(e) => onChange({ ...draft, hrefOverride: e.target.value })}
          placeholder="/training"
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
