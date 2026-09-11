"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
api,
type AdminInvoice,
type AdminBranch,
type InvoiceLineItem,
type PaymentGateway,
} from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StudentOption = { id: string; studentCode: string; firstName: string; lastName: string };

type Draft = {
branchId: string;
studentId: string;
currency: string;
lineItems: InvoiceLineItem[];
discountAmount: string;
taxAmount: string;
dueDate: string;
notes: string;
};

const EMPTY_LINE_ITEM: InvoiceLineItem = { description: "", quantity: 1, unitPrice: 0 };

const EMPTY_DRAFT: Draft = {
branchId: "",
studentId: "",
currency: "OMR",
lineItems: [{ ...EMPTY_LINE_ITEM }],
discountAmount: "0",
taxAmount: "0",
dueDate: "",
notes: "",
};

const STATUS_TONE: Record<AdminInvoice["status"], "success" | "warning" | "danger" | "info" | "neutral"> = {
DRAFT: "neutral",
SENT: "info",
PARTIALLY_PAID: "warning",
PAID: "success",
OVERDUE: "danger",
CANCELLED: "neutral",
};

function computeTotals(d: Draft) {
const subtotal = d.lineItems.reduce((sum, li) => sum + (Number(li.quantity) || 0) * (Number(li.unitPrice) || 0), 0);
const total = Math.max(0, subtotal - (Number(d.discountAmount) || 0) + (Number(d.taxAmount) || 0));
return { subtotal, total };
}

function toDto(d: Draft) {
return {
branchId: d.branchId,
studentId: d.studentId,
currency: d.currency || "OMR",
lineItems: d.lineItems
.filter((li) => li.description.trim())
.map((li) => ({ description: li.description.trim(), quantity: Number(li.quantity) || 0, unitPrice: Number(li.unitPrice) || 0 })),
discountAmount: Number(d.discountAmount) || 0,
taxAmount: Number(d.taxAmount) || 0,
dueDate: d.dueDate || undefined,
notes: d.notes.trim() || undefined,
};
}

/**
* ERP Phase 2 — Invoices admin: create/edit invoices with server-computed
* totals, see each invoice's balance (sum of SUCCEEDED payments), and start
* a real online checkout when a gateway is configured. Manual payments are
* still recorded from /erp/payments — this page never assumes a gateway is
* wired up, since PayTabs/Thawani need real merchant credentials the user
* has to obtain himself.
*/
export default function ErpInvoicesPage() {
const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
const [branches, setBranches] = useState<AdminBranch[]>([]);
const [students, setStudents] = useState<StudentOption[]>([]);
const [gateways, setGateways] = useState<Array<{ gateway: Exclude<PaymentGateway, "MANUAL">; configured: boolean }>>([]);
const [error, setError] = useState<string | null>(null);
const [creating, setCreating] = useState(false);
const [createDraft, setCreateDraft] = useState<Draft>(EMPTY_DRAFT);
const [saving, setSaving] = useState(false);
const [balances, setBalances] = useState<Record<string, { totalAmount: number; paidAmount: number; balanceDue: number }>>({});
const [checkoutBusy, setCheckoutBusy] = useState<string | null>(null);

const load = () => {
api.listInvoices().then(setInvoices).catch((err) => setError(err.message));
};

useEffect(() => {
load();
api.listBranches().then(setBranches).catch(() => undefined);
api.searchStudents().then((s) => setStudents(s as StudentOption[])).catch(() => undefined);
api.listInvoiceGateways().then(setGateways).catch(() => undefined);
}, []);

useEffect(() => {
invoices.forEach((inv) => {
if (balances[inv.id]) return;
api
.getInvoiceBalance(inv.id)
.then((b) => setBalances((prev) => ({ ...prev, [inv.id]: b })))
.catch(() => undefined);
});
}, [invoices]);

const onCreate = async (e: React.FormEvent) => {
e.preventDefault();
setSaving(true);
setError(null);
try {
await api.createInvoice(toDto(createDraft) as any);
setCreateDraft(EMPTY_DRAFT);
setCreating(false);
load();
} catch (err) {
setError((err as Error).message);
} finally {
setSaving(false);
}
};

const remove = async (inv: AdminInvoice) => {
try {
await api.deleteInvoice(inv.id);
load();
} catch (err) {
setError((err as Error).message);
}
};

const payNow = async (inv: AdminInvoice, gateway: Exclude<PaymentGateway, "MANUAL">) => {
setCheckoutBusy(inv.id);
setError(null);
try {
const { redirectUrl } = await api.initiateInvoiceCheckout(inv.id, gateway);
window.location.href = redirectUrl;
} catch (err) {
setError((err as Error).message);
} finally {
setCheckoutBusy(null);
}
};

const studentLabel = (id: string) => {
const s = students.find((x) => x.id === id);
return s ? `${s.firstName} ${s.lastName} (${s.studentCode})` : "—";
};

return (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
<Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New Invoice"}</Button>
</div>

{error && <p className="text-sm text-status-danger">{error}</p>}

{gateways.length > 0 && gateways.every((g) => !g.configured) && (
<p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
No online payment gateway is configured yet (PayTabs / Thawani). Invoices can still be created and
settled with manually recorded payments from the Payments page.
</p>
)}

{creating && (
<Card>
<InvoiceForm
draft={createDraft}
onChange={setCreateDraft}
onSubmit={onCreate}
saving={saving}
submitLabel="Create invoice"
branches={branches}
students={students}
/>
</Card>
)}

<Card className="divide-y divide-surface-border p-0">
{invoices.map((inv) => {
const bal = balances[inv.id];
const availableGateways = gateways.filter((g) => g.configured);
return (
<div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
<div className="flex flex-wrap items-center gap-3">
<span className="font-mono text-sm font-medium text-slate-800">{inv.invoiceNumber}</span>
<span className="text-sm text-slate-600">{studentLabel(inv.studentId)}</span>
<span className="text-xs text-slate-400">{inv.branch?.branchName}</span>
<Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
<span className="text-xs text-slate-500">
{inv.currency} {Number(inv.totalAmount).toFixed(2)}
{bal ? ` · balance ${bal.balanceDue.toFixed(2)}` : ""}
</span>
</div>
<div className="flex items-center gap-1">
{availableGateways.map((g) => (
<button
key={g.gateway}
disabled={checkoutBusy === inv.id || inv.status === "PAID" || inv.status === "CANCELLED"}
onClick={() => payNow(inv, g.gateway)}
className="rounded px-2 py-1 text-sm font-medium text-accent hover:underline disabled:opacity-40"
>
Pay via {g.gateway === "PAYTABS" ? "PayTabs" : "Thawani"}
</button>
))}
<Link
href={`/erp/payments?invoiceId=${inv.id}`}
className="rounded px-2 py-1 text-sm font-medium text-accent hover:underline"
>
Payments
</Link>
<button onClick={() => remove(inv)} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
🗑
</button>
</div>
</div>
);
})}
{invoices.length === 0 && (
<p className="px-4 py-6 text-center text-sm text-slate-400">
No invoices yet — create one to bill a student for a program, course, or one-off charge.
</p>
)}
</Card>
</div>
);
}

function InvoiceForm({
draft,
onChange,
onSubmit,
saving,
submitLabel,
branches,
students,
}: {
draft: Draft;
onChange: (d: Draft) => void;
onSubmit: (e: React.FormEvent) => void;
saving: boolean;
submitLabel: string;
branches: AdminBranch[];
students: StudentOption[];
}) {
const { subtotal, total } = useMemo(() => computeTotals(draft), [draft]);

const updateLineItem = (idx: number, patch: Partial<InvoiceLineItem>) => {
const next = draft.lineItems.slice();
next[idx] = { ...next[idx], ...patch };
onChange({ ...draft, lineItems: next });
};

const addLineItem = () => onChange({ ...draft, lineItems: [...draft.lineItems, { ...EMPTY_LINE_ITEM }] });
const removeLineItem = (idx: number) =>
onChange({ ...draft, lineItems: draft.lineItems.filter((_, i) => i !== idx) });

return (
<form onSubmit={onSubmit} className="space-y-4">
<div className="grid gap-3 sm:grid-cols-2">
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
<label className="mb-1 block text-xs font-medium text-slate-500">Student</label>
<select
required
value={draft.studentId}
onChange={(e) => onChange({ ...draft, studentId: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
>
<option value="" disabled>
Select a student
</option>
{students.map((s) => (
<option key={s.id} value={s.id}>
{s.firstName} {s.lastName} ({s.studentCode})
</option>
))}
</select>
</div>
<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Currency</label>
<input
value={draft.currency}
onChange={(e) => onChange({ ...draft, currency: e.target.value.toUpperCase() })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
/>
</div>
<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Due Date (optional)</label>
<input
type="date"
value={draft.dueDate}
onChange={(e) => onChange({ ...draft, dueDate: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
/>
</div>
</div>

<div>
<label className="mb-2 block text-xs font-medium text-slate-500">Line Items</label>
<div className="space-y-2">
{draft.lineItems.map((li, idx) => (
<div key={idx} className="grid grid-cols-12 gap-2">
<input
placeholder="Description"
required
value={li.description}
onChange={(e) => updateLineItem(idx, { description: e.target.value })}
className="col-span-6 rounded border border-surface-border px-3 py-1.5 text-sm"
/>
<input
type="number"
min={0.01}
step="0.01"
placeholder="Qty"
value={li.quantity}
onChange={(e) => updateLineItem(idx, { quantity: Number(e.target.value) })}
className="col-span-2 rounded border border-surface-border px-3 py-1.5 text-sm"
/>
<input
type="number"
min={0}
step="0.01"
placeholder="Unit price"
value={li.unitPrice}
onChange={(e) => updateLineItem(idx, { unitPrice: Number(e.target.value) })}
className="col-span-3 rounded border border-surface-border px-3 py-1.5 text-sm"
/>
<button
type="button"
onClick={() => removeLineItem(idx)}
disabled={draft.lineItems.length <= 1}
className="col-span-1 rounded text-sm text-slate-400 hover:text-status-danger disabled:opacity-30"
>
🗑
</button>
</div>
))}
</div>
<button type="button" onClick={addLineItem} className="mt-2 text-sm font-medium text-accent hover:underline">
+ Add line item
</button>
</div>

<div className="grid gap-3 sm:grid-cols-3">
<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Discount</label>
<input
type="number"
min={0}
step="0.01"
value={draft.discountAmount}
onChange={(e) => onChange({ ...draft, discountAmount: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
/>
</div>
<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Tax</label>
<input
type="number"
min={0}
step="0.01"
value={draft.taxAmount}
onChange={(e) => onChange({ ...draft, taxAmount: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
/>
</div>
<div className="flex flex-col justify-end text-sm text-slate-600">
<span>Subtotal: {subtotal.toFixed(2)}</span>
<span className="font-medium text-slate-900">Total: {total.toFixed(2)}</span>
</div>
</div>

<div>
<label className="mb-1 block text-xs font-medium text-slate-500">Notes (optional)</label>
<textarea
value={draft.notes}
onChange={(e) => onChange({ ...draft, notes: e.target.value })}
className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
rows={2}
/>
</div>

<Button type="submit" disabled={saving}>
{saving ? "Saving..." : submitLabel}
</Button>
</form>
);
}
