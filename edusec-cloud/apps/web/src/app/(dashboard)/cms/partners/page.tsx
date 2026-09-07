"use client";

import { useEffect, useState } from "react";
import { api, type AdminPartner } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Draft = {
  name: string;
  logoUrl: string;
  websiteUrl: string;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  logoUrl: "",
  websiteUrl: "",
};

function toDraft(p: AdminPartner): Draft {
  return {
    name: p.name,
    logoUrl: p.logoUrl,
    websiteUrl: p.websiteUrl ?? "",
  };
}

function toDto(d: Draft) {
  return {
    name: d.name.trim(),
    logoUrl: d.logoUrl.trim(),
    websiteUrl: d.websiteUrl.trim() || undefined,
  };
}

/**
 * Partner logos admin (Partners module) — the CMS backing the PARTNERS
 * page-builder block. Modeled directly on the Programs admin page (create
 * form + table, inline per-row edit) since Partner has the same flat shape
 * (no nested sub-resource) as Program, just fewer fields.
 */
export default function CmsPartnersListPage() {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .listPartners()
      .then(setPartners)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createPartner(toDto(createDraft));
      setCreateDraft(EMPTY_DRAFT);
      setCreating(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: AdminPartner) => {
    setEditingId(p.id);
    setEditDraft(toDraft(p));
  };

  const onSaveEdit = async (e: React.FormEvent, partnerId: string) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updatePartner(partnerId, toDto(editDraft));
      setEditingId(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (p: AdminPartner) => {
    try {
      await api.updatePartner(p.id, { isVisible: !p.isVisible });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (p: AdminPartner) => {
    try {
      await api.deletePartner(p.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...partners];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await api.reorderPartners(next.map((p) => p.id));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Partners</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New Partner"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <PartnerForm draft={createDraft} onChange={setCreateDraft} onSubmit={onCreate} saving={saving} submitLabel="Create partner" />
        </Card>
      )}

      <Card className="divide-y divide-surface-border p-0">
        {partners.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                {p.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logoUrl} alt="" className="h-8 w-8 rounded object-contain" />
                )}
                <span className="text-sm font-medium text-slate-800">{p.name}</span>
                {!p.isVisible && <Badge tone="neutral">Hidden</Badge>}
                {p.websiteUrl && <span className="font-mono text-xs text-slate-400">{p.websiteUrl}</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} disabled={i === partners.length - 1} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
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
                <PartnerForm
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
        {partners.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No partners yet — add one to populate the Partners block.</p>
        )}
      </Card>
    </div>
  );
}

function PartnerForm({
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
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
        <input
          required
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          placeholder="Acme Corp"
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Website (optional)</label>
        <input
          value={draft.websiteUrl}
          onChange={(e) => onChange({ ...draft, websiteUrl: e.target.value })}
          placeholder="https://example.com"
          className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-500">Logo URL</label>
        <input
          required
          value={draft.logoUrl}
          onChange={(e) => onChange({ ...draft, logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
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
