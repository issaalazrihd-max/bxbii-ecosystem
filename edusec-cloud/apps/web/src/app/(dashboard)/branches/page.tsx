"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  branchType: "HEAD_OFFICE" | "BRANCH";
  status: "ACTIVE" | "INACTIVE";
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listBranches()
      .then((data) => setBranches(data as Branch[]))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Branches</h1>
      {error && <p className="text-sm text-status-danger">{error}</p>}
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
