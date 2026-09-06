"use client";

import { useEffect, useState } from "react";
import { api, type AdminProgram } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Draft = {
  slug: string;
  arDomain: string;
  enDomain: string;
  arName: string;
  enName: string;
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
  arDomain: "",
  enDomain: "",
  arName: "",
  enName: "",
  arDescription: "",
  enDescription: "",
  arDuration: "",
  enDuration: "",
  arFormat: "",
  enFormat: "",
  status: "COMING_SOON",
  hrefOverride: "",
};

function toDraft(p: AdminProgram): Draft {
  return {
    slug: p.slug,
    arDomain: p.arDomain,
    enDomain: p.enDomain,
    arName: p.arName,
    enName: p.enName,
    arDescription: p.arDescription,
    enDescription: p.enDescription,
    arDuration: p.arDuration,
    enDuration: p.enDuration,
    arFormat: p.arFormat,
    enFormat: p.enFormat,
    status: p.status,
    hrefOverride: p.hrefOverride ?? "",
  };
}

function toDto(d: Draft) {
  return {
    slug: d.slug.trim(),
    arDomain: d.arDomain,
    enDomain: d.enDomain,
    arName: d.arName,
    enName: d.enName,
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
 * Programs catalog admin (Task #44 — Programs module) — the CMS backing the
 * public /programs page. Modeled on the CMS Pages list (create form + table)
 * and the Navigation manager (reorder, visibility toggle, delete) — Programs
 * needed both: a create form with more fields than Navigation's, but no
 * nested sub-resource the way Pages has Sections, so a full field-level edit
 * happens inline in the row rather than a separate [programId] route.
 */
export default function CmsProgramsListPage() {
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .listPrograms()
      .then(setPrograms)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createProgram(toDto(createDraft));
      setCreateDraft(EMPTY_DRAFT);
      setCreating(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: AdminProgram) => {
    setEditingId(p.id);
    setEditDraft(toDraft(p));
  };

  const onSaveEdit = async (e: React.FormEvent, programId: string) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updateProgram(programId, toDto(editDraft));
      setEditingId(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (p: AdminProgram) => {
    try {
      await api.updateProgram(p.id, { isVisible: !p.isVisible });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (p: AdminProgram) => {
    try {
      await api.deleteProgram(p.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...programs];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await api.reorderPrograms(next.map((p) => p.id));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Programs</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New Program"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <ProgramForm draft={createDraft} onChange={setCreateDraft} onSubmit={onCreate} saving={saving} submitLabel="Create program" />
        </Card>
      )}

      <Card className="divide-y divide-surface-border p-0">
        {programs.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-800">{p.enName}</span>
                <span className="text-sm text-slate-400" dir="rtl">
                  {p.arName}
                </span>
                <Badge tone={p.status === "OPEN" ? "success" : "warning"}>{p.status}</Badge>
                {!p.isVisible && <Badge tone="neutral">Hidden</Badge>}
                {p.hrefOverride && <span className="font-mono text-xs text-slate-400">{p.hrefOverride}</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} disabled={i === programs.length - 1} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
                  ↓
                </button>
                <button onClick={() => toggleVisible(p)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
                  {p.isVisible ? "🙈" : "👁"}
                </button>
                <button onClick={() => (editingId === p.id ? setEditingId(null) : startEdit(p))} className="rounded px-2 py-1 text-sm font-medium text-accent hover:underline">
                  {editingId === p.id ? "Close" : "Edit"}
                </button>
                <button onClick={() => remove(p)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
                  🗑
                </button>
              </div>
            </div>
            {editingId === p.id && (
              <div className="border-t border-surface-border bg-surface-subtle px-4 py-4">
                <ProgramForm
                  draft={editDraft}
                  onChange={setEditDraft}
                  onSubmit={(e) => onSaveEdit(e, p.id)}
                  saving={saving}
                  submitLabel="Save changes"
                />
              </div>
            )}
          </div>
        ))}
        {programs.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No programs yet — create one to populate /programs.</p>
        )}
      </Card>
    </div>
  );
}

function ProgramForm({
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
          placeholder="finance-non-financials"
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
          <option value="OPEN">Open (registration open)</option>
          <option value="COMING_SOON">Coming soon</option>
        </select>
      </div>

      {field("Domain (EN)", "enDomain")}
      {field("Domain (AR)", "arDomain", { rtl: true })}
      {field("Name (EN)", "enName")}
      {field("Name (AR)", "arName", { rtl: true })}
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
