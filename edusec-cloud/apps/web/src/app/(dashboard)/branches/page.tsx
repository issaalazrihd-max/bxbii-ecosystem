"use client";

import { useEffect, useState } from "react";
import { api, type AdminBranch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EMPTY_DRAFT = {
  branchCode: "",
  branchName: "",
  branchType: "BRANCH" as "HEAD_OFFICE" | "BRANCH",
  city: "",
  country: "",
};

/**
 * Branches admin. Previously list-only with no way to actually add a
 * branch from the UI even though the API has supported POST /branches
 * since the platform foundation was built — a direct answer to "is there
 * an admin account to add students, branches, courses?" for the branches
 * half of that question.
 */
export default function BranchesPage() {
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .listBranches()
      .then(setBranches)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createBranch({
        branchCode: draft.branchCode.trim(),
        branchName: draft.branchName.trim(),
        branchType: draft.branchType,
        city: draft.city.trim() || undefined,
        country: draft.country.trim() || undefined,
      });
      setDraft(EMPTY_DRAFT);
      setCreating(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Branches</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "Add Branch"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Branch Code</label>
              <input
                required
                value={draft.branchCode}
                onChange={(e) => setDraft({ ...draft, branchCode: e.target.value })}
                placeholder="MCT-02"
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Branch Name</label>
              <input
                required
                value={draft.branchName}
                onChange={(e) => setDraft({ ...draft, branchName: e.target.value })}
                placeholder="Muscat Branch 2"
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
              <select
                value={draft.branchType}
                onChange={(e) => setDraft({ ...draft, branchType: e.target.value as "HEAD_OFFICE" | "BRANCH" })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              >
                <option value="BRANCH">Branch</option>
                <option value="HEAD_OFFICE">Head Office</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">City</label>
              <input
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Country</label>
              <input
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create branch"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle text-slate-500">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-t border-surface-border">
                <td className="px-4 py-2 font-mono">{b.branchCode}</td>
                <td className="px-4 py-2">{b.branchName}</td>
                <td className="px-4 py-2">
                  {b.branchType === "HEAD_OFFICE" ? (
                    <Badge tone="info">Head Office</Badge>
                  ) : (
                    <Badge tone="neutral">Branch</Badge>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Badge tone={b.status === "ACTIVE" ? "success" : "neutral"}>{b.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
