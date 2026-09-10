"use client";

import { useEffect, useState } from "react";
import { api, type AdminBranch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  status: string;
  currentBranch: { branchCode: string; branchName: string };
}

const EMPTY_DRAFT = {
  studentCode: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  mobile: "",
  branchId: "",
};

/**
 * Global student search (Multi-Branch doc, Section 5.2) — results are
 * already branch-scoped server-side. Previously search-only with no way to
 * actually register a student from the UI even though POST /students has
 * existed since the platform foundation was built — this adds the "Add
 * Student" form, a direct answer to "how do I register the students??".
 */
export default function StudentsPage() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listBranches().then(setBranches).catch(() => undefined);
  }, []);

  const runSearch = async () => {
    try {
      setError(null);
      const data = await api.searchStudents(query || undefined);
      setStudents(data as Student[]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createStudent({
        studentCode: draft.studentCode.trim(),
        firstName: draft.firstName.trim(),
        middleName: draft.middleName.trim() || undefined,
        lastName: draft.lastName.trim(),
        email: draft.email.trim() || undefined,
        mobile: draft.mobile.trim() || undefined,
        branchId: draft.branchId,
      });
      setDraft(EMPTY_DRAFT);
      setCreating(false);
      runSearch();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Students</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "Add Student"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Student Code</label>
              <input
                required
                value={draft.studentCode}
                onChange={(e) => setDraft({ ...draft, studentCode: e.target.value })}
                placeholder="STU-1001"
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Branch</label>
              <select
                required
                value={draft.branchId}
                onChange={(e) => setDraft({ ...draft, branchId: e.target.value })}
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
              <label className="mb-1 block text-xs font-medium text-slate-500">First Name</label>
              <input
                required
                value={draft.firstName}
                onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Last Name</label>
              <input
                required
                value={draft.lastName}
                onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Middle Name</label>
              <input
                value={draft.middleName}
                onChange={(e) => setDraft({ ...draft, middleName: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Mobile</label>
              <input
                value={draft.mobile}
                onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Register student"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Name, student code, mobile, or email"
          className="w-96 rounded border border-surface-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <Button onClick={runSearch}>Search</Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle text-slate-500">
            <tr>
              <th className="px-4 py-2">Student Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Current Branch</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-surface-border">
                <td className="px-4 py-2 font-mono">{s.studentCode}</td>
                <td className="px-4 py-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-4 py-2">{s.currentBranch?.branchName}</td>
                <td className="px-4 py-2">
                  <Badge tone="neutral">{s.status}</Badge>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Search to see students within your branch access.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
