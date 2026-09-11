const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Minimal in-memory token store. A production build should move the
// refresh token into an httpOnly cookie set by the API — kept simple here
// since this is a foundation scaffold, not the finished auth UX.
let accessToken: string | null = null;
let refreshToken: string | null =
typeof window !== "undefined" ? window.sessionStorage.getItem("bxbii.refreshToken") : null;
let refreshPromise: Promise<void> | null = null;

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
accessToken = tokens.accessToken;
refreshToken = tokens.refreshToken;
if (typeof window !== "undefined") {
window.sessionStorage.setItem("bxbii.refreshToken", tokens.refreshToken);
}
}

export function clearTokens() {
accessToken = null;
refreshToken = null;
if (typeof window !== "undefined") {
window.sessionStorage.removeItem("bxbii.refreshToken");
}
}

/**
* Whether a session is stored at all (a refresh token we could rehydrate
* an access token from), regardless of whether that refresh token still
* turns out to be valid server-side. Used by route guards (e.g. the
* (dashboard) layout) to decide "send this visitor to /login" vs. "let
* them through and let the existing 401/refresh handling in request()
* take it from there" — it intentionally does not call the API, so it
* can run synchronously on mount before any request is made.
*/
export function hasSession(): boolean {
return !!refreshToken;
}

/**
* The access token only ever lives in memory, so it's gone after any full
* page load (typing a URL, hitting refresh, opening a new tab). The refresh
* token survives in sessionStorage, so on the first request after a reload
* we exchange it for a fresh access token before calling the API. This is
* what fixes admin pages (e.g. /cms/navigation) showing "Unauthorized" and
* a false empty state whenever they're reached other than by clicking
* through the app right after logging in — previously nothing ever
* rehydrated the access token from the stored refresh token.
*
* Concurrent callers (e.g. a page that fires two requests in parallel)
* share one in-flight refresh so the single-use refresh token isn't
* consumed twice.
*/
async function ensureAccessToken(): Promise<void> {
if (accessToken || !refreshToken) return;

if (!refreshPromise) {
const tokenToUse = refreshToken;
refreshPromise = fetch(`${API_URL}/api/v1/auth/refresh`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ refreshToken: tokenToUse }),
})
.then(async (res) => {
if (!res.ok) {
clearTokens();
return;
}
const data = (await res.json()) as { accessToken: string; refreshToken: string };
setTokens(data);
})
.catch(() => {
clearTokens();
})
.finally(() => {
refreshPromise = null;
});
}

return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
await ensureAccessToken();

const res = await fetch(`${API_URL}/api/v1${path}`, {
...options,
headers: {
"Content-Type": "application/json",
...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
...options.headers,
},
});

// Access tokens are short-lived (15m). If one expired mid-session, do a
// single transparent refresh-and-retry before giving up.
if (res.status === 401 && !_retried && refreshToken) {
accessToken = null;
await ensureAccessToken();
if (accessToken) return request<T>(path, options, true);
}

if (!res.ok) {
const body = await res.json().catch(() => ({}));
throw new Error(body.message ?? `Request to ${path} failed with ${res.status}`);
}

if (res.status === 204) return undefined as T;
return res.json();
}

/**
 * Downloads a binary file (the invoice PDF) and triggers a browser save —
 * can't reuse request<T>() since the response isn't JSON, but still needs
 * the same bearer-token auth as every other admin call (the endpoint is
 * behind erp.invoices.view like the rest of the Invoices API).
 */
async function downloadBlob(path: string, filename: string): Promise<void> {
  await ensureAccessToken();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request to ${path} failed with ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface AdminPage {
id: string;
slug: string;
arTitle: string;
enTitle: string;
status: "DRAFT" | "PUBLISHED" | "HIDDEN";
isSystem: boolean;
sections: AdminSection[];
}

export interface AdminSection {
id: string;
sectionType: string;
arContent: Record<string, unknown>;
enContent: Record<string, unknown>;
isVisible: boolean;
position: number;
}

export interface AdminNavItem {
id: string;
parentId: string | null;
arLabel: string;
enLabel: string;
linkType: "PAGE" | "EXTERNAL_URL" | "COURSE" | "PROJECT" | "PRODUCT";
targetPageId: string | null;
externalUrl: string | null;
openInNewTab: boolean;
isVisible: boolean;
position: number;
href: string | null;
children: AdminNavItem[];
}

export interface AdminProgram {
id: string;
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
hrefOverride: string | null;
position: number;
isVisible: boolean;
}

export interface AdminContactSubmission {
id: string;
name: string;
email: string;
phone: string | null;
subject: string | null;
message: string;
status: "NEW" | "READ" | "ARCHIVED";
createdAt: string;
}

export interface AdminPartner {
id: string;
name: string;
logoUrl: string;
websiteUrl: string | null;
position: number;
isVisible: boolean;
}

export interface AdminCourse {
id: string;
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
hrefOverride: string | null;
position: number;
isVisible: boolean;
}

export interface AdminBranch {
id: string;
branchCode: string;
branchName: string;
branchType: "HEAD_OFFICE" | "BRANCH";
status: "ACTIVE" | "INACTIVE";
}

export interface AdminTrainer {
id: string;
trainerCode: string;
fullName: string;
specialization: string | null;
email: string | null;
mobile: string | null;
teachingHours: number;
status: "ACTIVE" | "INACTIVE";
primaryBranchId: string;
primaryBranch?: AdminBranch;
}

export interface AdminBatch {
id: string;
branchId: string;
branch?: AdminBranch;
programId: string | null;
program?: AdminProgram | null;
courseId: string | null;
course?: AdminCourse | null;
trainerId: string | null;
trainer?: AdminTrainer | null;
batchCode: string;
arLabel: string | null;
enLabel: string | null;
startDate: string;
endDate: string | null;
schedule: string | null;
capacity: number;
status: "PLANNED" | "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
_count?: { enrollments: number };
}

export interface AdminEnrollment {
id: string;
studentId: string;
student?: { id: string; studentCode: string; firstName: string; lastName: string };
batchId: string;
batch?: AdminBatch;
status: "ENROLLED" | "WAITLISTED" | "COMPLETED" | "WITHDRAWN" | "CANCELLED";
enrollmentDate: string;
notes: string | null;
}

export interface CreateBatchDto {
batchCode: string;
branchId: string;
programId?: string;
courseId?: string;
trainerId?: string;
arLabel?: string;
enLabel?: string;
startDate: string;
endDate?: string;
schedule?: string;
capacity?: number;
status?: AdminBatch["status"];
}

// --- ERP Phase 2: Invoices & Payments (financial and operational
// management, requested directly by the user) ------------------------------

export interface InvoiceLineItem {
description: string;
quantity: number;
unitPrice: number;
}

export type PaymentGateway = "MANUAL" | "PAYTABS" | "THAWANI";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface AdminPayment {
id: string;
invoiceId: string;
invoice?: AdminInvoice;
amount: string;
currency: string;
gateway: PaymentGateway;
gatewaySessionId: string | null;
gatewayTxnRef: string | null;
status: PaymentStatus;
paidAt: string | null;
notes: string | null;
createdAt: string;
}

export interface AdminInvoice {
id: string;
branchId: string;
branch?: AdminBranch;
studentId: string;
student?: { id: string; studentCode: string; firstName: string; lastName: string };
enrollmentId: string | null;
enrollment?: AdminEnrollment | null;
invoiceNumber: string;
currency: string;
lineItems: InvoiceLineItem[];
subtotal: string;
discountAmount: string;
taxAmount: string;
totalAmount: string;
status: "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
issueDate: string;
dueDate: string | null;
notes: string | null;
sentAt: string | null;
payments?: AdminPayment[];
}

export interface CreateInvoiceDto {
branchId: string;
studentId: string;
enrollmentId?: string;
currency?: string;
lineItems: InvoiceLineItem[];
discountAmount?: number;
taxAmount?: number;
issueDate?: string;
dueDate?: string;
notes?: string;
status?: AdminInvoice["status"];
}

export interface CreatePaymentDto {
invoiceId: string;
amount: number;
currency?: string;
gateway?: PaymentGateway;
gatewayTxnRef?: string;
status?: PaymentStatus;
paidAt?: string;
notes?: string;
}

export const api = {
login: (email: string, password: string) =>
request<{ accessToken: string; refreshToken: string; user: unknown }>("/auth/login", {
method: "POST",
body: JSON.stringify({ email, password }),
}),
listBranches: () => request<AdminBranch[]>("/branches"),
createBranch: (dto: { branchCode: string; branchName: string; branchType?: "HEAD_OFFICE" | "BRANCH"; city?: string; country?: string }) =>
request<AdminBranch>("/branches", { method: "POST", body: JSON.stringify(dto) }),
getDashboardSummary: () =>
request<{
totalStudents: number;
activeStudents: number;
newStudentsThisMonth: number;
studentsByStatus: Record<string, number>;
totalEmployees: number;
totalTrainers: number;
activeTrainers: number;
totalBranches: number;
}>("/dashboard/summary"),
searchStudents: (query?: string, branchId?: string) => {
const params = new URLSearchParams();
if (query) params.set("query", query);
if (branchId) params.set("branchId", branchId);
return request<unknown[]>(`/students?${params.toString()}`);
},
createStudent: (dto: { studentCode: string; firstName: string; middleName?: string; lastName: string; email?: string; mobile?: string; branchId: string }) =>
request<unknown>("/students", { method: "POST", body: JSON.stringify(dto) }),

// --- Trainers (Phase 1 demo scope) --------------------------------------
listTrainers: () => request<AdminTrainer[]>("/trainers"),
createTrainer: (dto: { trainerCode: string; fullName: string; specialization?: string; email?: string; mobile?: string; branchId: string }) =>
request<AdminTrainer>("/trainers", { method: "POST", body: JSON.stringify(dto) }),

// --- ERP Phase 1: Batches & Enrollments (Institute Management System) ---
listBatches: (branchId?: string) => {
const params = new URLSearchParams();
if (branchId) params.set("branchId", branchId);
const qs = params.toString();
return request<AdminBatch[]>(`/erp/batches${qs ? `?${qs}` : ""}`);
},
createBatch: (dto: CreateBatchDto) => request<AdminBatch>("/erp/batches", { method: "POST", body: JSON.stringify(dto) }),
updateBatch: (batchId: string, dto: Partial<CreateBatchDto>) =>
request<AdminBatch>(`/erp/batches/${batchId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deleteBatch: (batchId: string) =>
request<{ id: string; deleted: boolean }>(`/erp/batches/${batchId}`, { method: "DELETE" }),

listEnrollments: (filters?: { batchId?: string; studentId?: string }) => {
const params = new URLSearchParams();
if (filters?.batchId) params.set("batchId", filters.batchId);
if (filters?.studentId) params.set("studentId", filters.studentId);
const qs = params.toString();
return request<AdminEnrollment[]>(`/erp/enrollments${qs ? `?${qs}` : ""}`);
},
createEnrollment: (dto: { studentId: string; batchId: string; status?: AdminEnrollment["status"]; notes?: string }) =>
request<AdminEnrollment>("/erp/enrollments", { method: "POST", body: JSON.stringify(dto) }),
updateEnrollment: (enrollmentId: string, dto: { status?: AdminEnrollment["status"]; notes?: string }) =>
request<AdminEnrollment>(`/erp/enrollments/${enrollmentId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deleteEnrollment: (enrollmentId: string) =>
request<{ id: string; deleted: boolean }>(`/erp/enrollments/${enrollmentId}`, { method: "DELETE" }),

// --- ERP Phase 2: Invoices & Payments (financial and operational
// management) -------------------------------------------------------------
listInvoices: (filters?: { branchId?: string; studentId?: string; status?: string }) => {
const params = new URLSearchParams();
if (filters?.branchId) params.set("branchId", filters.branchId);
if (filters?.studentId) params.set("studentId", filters.studentId);
if (filters?.status) params.set("status", filters.status);
const qs = params.toString();
return request<AdminInvoice[]>(`/erp/invoices${qs ? `?${qs}` : ""}`);
},
getInvoice: (invoiceId: string) => request<AdminInvoice>(`/erp/invoices/${invoiceId}`),
getInvoiceBalance: (invoiceId: string) =>
request<{ totalAmount: number; paidAmount: number; balanceDue: number }>(`/erp/invoices/${invoiceId}/balance`),
listInvoiceGateways: () =>
request<Array<{ gateway: Exclude<PaymentGateway, "MANUAL">; configured: boolean }>>("/erp/invoices/gateways"),
createInvoice: (dto: CreateInvoiceDto) =>
request<AdminInvoice>("/erp/invoices", { method: "POST", body: JSON.stringify(dto) }),
updateInvoice: (invoiceId: string, dto: Partial<CreateInvoiceDto>) =>
request<AdminInvoice>(`/erp/invoices/${invoiceId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deleteInvoice: (invoiceId: string) =>
request<{ id: string; deleted: boolean }>(`/erp/invoices/${invoiceId}`, { method: "DELETE" }),
initiateInvoiceCheckout: (invoiceId: string, gateway: Exclude<PaymentGateway, "MANUAL">) =>
request<{ redirectUrl: string }>(`/erp/invoices/${invoiceId}/checkout`, {
method: "POST",
body: JSON.stringify({ gateway }),
}),
downloadInvoicePdf: (invoiceId: string, invoiceNumber: string) =>
downloadBlob(`/erp/invoices/${invoiceId}/pdf`, `${invoiceNumber}.pdf`),
sendInvoiceEmail: (invoiceId: string) =>
request<AdminInvoice>(`/erp/invoices/${invoiceId}/send-email`, { method: "POST" }),

listPayments: (invoiceId?: string) => {
const params = new URLSearchParams();
if (invoiceId) params.set("invoiceId", invoiceId);
const qs = params.toString();
return request<AdminPayment[]>(`/erp/payments${qs ? `?${qs}` : ""}`);
},
createPayment: (dto: CreatePaymentDto) =>
request<AdminPayment>("/erp/payments", { method: "POST", body: JSON.stringify(dto) }),
updatePayment: (paymentId: string, dto: Partial<CreatePaymentDto>) =>
request<AdminPayment>(`/erp/payments/${paymentId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deletePayment: (paymentId: string) =>
request<{ id: string; deleted: boolean }>(`/erp/payments/${paymentId}`, { method: "DELETE" }),

// --- CMS: Pages & Page Builder (brief Sections 29-30) --------------------
listPages: () => request<AdminPage[]>("/cms/pages"),
getPage: (pageId: string) => request<AdminPage>(`/cms/pages/${pageId}`),
createPage: (dto: { slug: string; arTitle: string; enTitle: string; status?: string }) =>
request<AdminPage>("/cms/pages", { method: "POST", body: JSON.stringify(dto) }),
updatePage: (pageId: string, dto: Partial<{ slug: string; arTitle: string; enTitle: string; status: string }>) =>
request<AdminPage>(`/cms/pages/${pageId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deletePage: (pageId: string) => request<{ id: string; deleted: boolean }>(`/cms/pages/${pageId}`, { method: "DELETE" }),

addSection: (
pageId: string,
dto: { sectionType: string; arContent?: Record<string, unknown>; enContent?: Record<string, unknown>; isVisible?: boolean },
) => request<AdminSection>(`/cms/pages/${pageId}/sections`, { method: "POST", body: JSON.stringify(dto) }),
updateSection: (
pageId: string,
sectionId: string,
dto: Partial<{ arContent: Record<string, unknown>; enContent: Record<string, unknown>; isVisible: boolean }>,
) =>
request<AdminSection>(`/cms/pages/${pageId}/sections/${sectionId}`, {
method: "PATCH",
body: JSON.stringify(dto),
}),
removeSection: (pageId: string, sectionId: string) =>
request<{ id: string; deleted: boolean }>(`/cms/pages/${pageId}/sections/${sectionId}`, { method: "DELETE" }),
reorderSections: (pageId: string, orderedSectionIds: string[]) =>
request<AdminPage>(`/cms/pages/${pageId}/sections/reorder`, {
method: "POST",
body: JSON.stringify({ orderedSectionIds }),
}),

// --- CMS: Navigation (brief Section 31) ----------------------------------
listNavigation: () => request<AdminNavItem[]>("/cms/navigation?onlyVisible=false"),
createNavItem: (dto: {
arLabel: string;
enLabel: string;
linkType: string;
targetPageId?: string;
externalUrl?: string;
openInNewTab?: boolean;
parentId?: string;
}) => request<AdminNavItem>("/cms/navigation", { method: "POST", body: JSON.stringify(dto) }),
updateNavItem: (itemId: string, dto: Partial<AdminNavItem>) =>
request<AdminNavItem>(`/cms/navigation/${itemId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deleteNavItem: (itemId: string) =>
request<{ id: string; deleted: boolean }>(`/cms/navigation/${itemId}`, { method: "DELETE" }),
reorderNavigation: (items: { id: string; parentId?: string | null }[]) =>
request<AdminNavItem[]>("/cms/navigation/reorder", { method: "POST", body: JSON.stringify({ items }) }),

// --- CMS: Programs catalog (Programs module, backs the public /programs
// page) --------------------------------------------------------------
listPrograms: () => request<AdminProgram[]>("/cms/programs"),
createProgram: (dto: Omit<AdminProgram, "id" | "position" | "isVisible"> & { isVisible?: boolean }) =>
request<AdminProgram>("/cms/programs", { method: "POST", body: JSON.stringify(dto) }),
updateProgram: (programId: string, dto: Partial<Omit<AdminProgram, "id">>) =>
request<AdminProgram>(`/cms/programs/${programId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deleteProgram: (programId: string) =>
request<{ id: string; deleted: boolean }>(`/cms/programs/${programId}`, { method: "DELETE" }),
reorderPrograms: (orderedProgramIds: string[]) =>
request<AdminProgram[]>("/cms/programs/reorder", { method: "POST", body: JSON.stringify({ orderedProgramIds }) }),

// --- CMS: Contact submissions inbox (Contact module, fed by the public
// /contact-us page's form) -----------------------------------------------
listContactSubmissions: () => request<AdminContactSubmission[]>("/cms/contact"),
updateContactSubmissionStatus: (submissionId: string, status: AdminContactSubmission["status"]) =>
request<AdminContactSubmission>(`/cms/contact/${submissionId}`, {
method: "PATCH",
body: JSON.stringify({ status }),
}),
deleteContactSubmission: (submissionId: string) =>
request<{ id: string; deleted: boolean }>(`/cms/contact/${submissionId}`, { method: "DELETE" }),

// --- CMS: Partners roster (Partners module, backs the PARTNERS
// page-builder block) -----------------------------------------------------
listPartners: () => request<AdminPartner[]>("/cms/partners"),
createPartner: (dto: Omit<AdminPartner, "id" | "position" | "isVisible"> & { isVisible?: boolean }) =>
request<AdminPartner>("/cms/partners", { method: "POST", body: JSON.stringify(dto) }),
updatePartner: (partnerId: string, dto: Partial<Omit<AdminPartner, "id">>) =>
request<AdminPartner>(`/cms/partners/${partnerId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deletePartner: (partnerId: string) =>
request<{ id: string; deleted: boolean }>(`/cms/partners/${partnerId}`, { method: "DELETE" }),
reorderPartners: (orderedPartnerIds: string[]) =>
request<AdminPartner[]>("/cms/partners/reorder", { method: "POST", body: JSON.stringify({ orderedPartnerIds }) }),

// --- CMS: Courses catalog (Courses module, backs the COURSES
// page-builder block) -----------------------------------------------------
listCourses: () => request<AdminCourse[]>("/cms/courses"),
createCourse: (dto: Omit<AdminCourse, "id" | "position" | "isVisible"> & { isVisible?: boolean }) =>
request<AdminCourse>("/cms/courses", { method: "POST", body: JSON.stringify(dto) }),
updateCourse: (courseId: string, dto: Partial<Omit<AdminCourse, "id">>) =>
request<AdminCourse>(`/cms/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(dto) }),
deleteCourse: (courseId: string) =>
request<{ id: string; deleted: boolean }>(`/cms/courses/${courseId}`, { method: "DELETE" }),
reorderCourses: (orderedCourseIds: string[]) =>
request<AdminCourse[]>("/cms/courses/reorder", { method: "POST", body: JSON.stringify({ orderedCourseIds }) }),
};
