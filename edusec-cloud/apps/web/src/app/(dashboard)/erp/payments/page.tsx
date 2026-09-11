"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, type AdminPayment, type AdminInvoice, type PaymentStatus } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Draft = {
invoiceId: string;
amount: string;
notes: string;
};

const STATUS_TONE: Record<PaymentStatus, "success" | "warning" | "danger" | "info"> = {
PENDING: "info",
SUCCEEDED: "success",
FAILED: "danger",
REFUNDED: "warning",
};

/**
* ERP Phase 2 — Payments admin: record a MANUAL payment (cash / bank
* transfer) against an invoice, and see the full payment history including
* ones created by an online gateway checkout (those show gateway/status and
* are updated automatically by the webhook, never edited by hand here).
* Reached from an invoice's "Payments" link with ?invoiceId= pre-filled.
* Wrapped in Suspense because it reads useSearchParams(), which Next.js's
* App Router requires (same pattern as erp/enrollments/page.tsx).
*/
export default function ErpPaymentsPage() {
return (
<Suspense fallback={null}>
<ErpPaymentsPageInner />
</Suspense>
);
}

function ErpPaymentsPageInner() {
const searchParams = useSearchParams();
const presetInvoiceId = searchParams.get("invoiceId") ?? "";

const [payments, setPayments] = useState<AdminPayment[]>([]);
const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
const [filterInvoiceId, setFilterInvoiceId] = useState(presetInvoiceId);
const [error, setError] = useState<string | null>(null);
const [creating, setCreating] = useState(!!presetInvoiceId);
const [draft, setDraft] = useState<Draft>({ invoiceId: presetInvoiceId, amount: "", notes: "" });
const [saving, setSaving] = useState(false);

const load = (invoiceId?: string) => {
api
.listPayments(invoiceId || undefined)
.then(setPayments)
.catch((err) => setError(err.message));
};

useEffect(() => {
load(filterInvoiceId);
}, [filterInvoiceId]);

useEffect(() => {
api.listInvoices().then(setInvoices).catch(() => undefined);
}, []);

const onCreate = async (e: React.FormEvent) => {
e.preventDefault();
setSaving(true);
setError(null);
try {
await api.createPayment({
invoiceId: draft.invoiceId,
amount: Number(draft.amount),
gateway: "MANUAL",
notes: draft.notes.trim() || undefined,
});
setDraft({ invoiceId: draft.invoiceId, amount: "", notes: "" });
setCreating(false);
load(filterInvoiceId);
} catch (err) {
setError((err as Error).message);
} finally {
setSaving(false);
}
};

const remove = async (p: AdminPayment) => {
try {
await api.deletePayment(p.id);
load(filterInvoiceId);
} catch (err) {
setError((err as Error).message);
}
};

const invoiceLabel = (id: string) => {
const inv = invoices.find((i) => i.id === id);
return inv ? `${inv.invoiceNumber} (${inv.currency} ${Number(inv.totalAmount).toFixed(2)})` : id;
};

return (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h1 className="text-xl font-semibold text-slate-900">Payments</h1>
<Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "Record Manual Payment"}</Button>
</div>

{error && <p className="text-sm text-status-danger">{error}</p>}

<div className="max-w-sm">
<label className="mb-1 block text-xs font-medium text-slate-500">Filter by invoice</label>
<select
value={filterInvoiceId}
onChange={(e) => setFilterInvoiceId(e.target.value)}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
>
<option value="">All invoices</option>
{invoices.map((inv) => (
<option key={inv.id} value={inv.id}>
{invoiceLabel(inv.id)}
</option>
))}
</select>
</div>

{creating && (
<Card>
<form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Invoice</label>
<select
required
value={draft.invoiceId}
onChange={(e) => setDraft({ ...draft, invoiceId: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
>
<option value="" disabled>
Select an invoice
</option>
{invoices.map((inv) => (
<option key={inv.id} value={inv.id}>
{invoiceLabel(inv.id)}
</option>
))}
</select>
</div>
<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Amount Received</label>
<input
required
type="number"
min={0.01}
step="0.01"
value={draft.amount}
onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
/>
</div>
<div className="sm:col-span-2">
<label className="mb-1 block text-xs font-medium text-slate-500">Notes (optional)</label>
<input
placeholder="e.g. Cash received at front desk, receipt #123"
value={draft.notes}
onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
/>
</div>
<div className="sm:col-span-2">
<Button type="submit" disabled={saving}>
{saving ? "Saving..." : "Record payment"}
</Button>
</div>
</form>
</Card>
)}

<Card className="divide-y divide-surface-border p-0">
{payments.map((p) => (
<div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
<div className="flex flex-wrap items-center gap-3">
<span className="text-sm font-medium text-slate-800">{invoiceLabel(p.invoiceId)}</span>
<span className="text-sm text-slate-600">
{p.currency} {Number(p.amount).toFixed(2)}
</span>
<Badge tone={p.gateway === "MANUAL" ? "neutral" : "info"}>{p.gateway}</Badge>
<Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
{p.paidAt && <span className="text-xs text-slate-400">{new Date(p.paidAt).toLocaleString()}</span>}
{p.notes && <span className="text-xs text-slate-400">{p.notes}</span>}
</div>
<div className="flex items-center gap-1">
<button onClick={() => remove(p)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
🗑
</button>
</div>
</div>
))}
{payments.length === 0 && (
<p className="px-4 py-6 text-center text-sm text-slate-400">
No payments recorded yet — record one manually, or wait for a gateway checkout to complete.
</p>
)}
</Card>
</div>
);
}
