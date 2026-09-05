"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
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

/** Global student search (Multi-Branch doc, Section 5.2) — results are already branch-scoped server-side. */
export default function StudentsPage() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    try {
      setError(null);
      const data = await api.searchStudents(query || undefined);
      setStudents(data as Student[]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Students</h1>
      </div>

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

      {error && <p className="text-sm text-status-danger">{error}</p>}

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
