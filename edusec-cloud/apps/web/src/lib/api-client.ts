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

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  listBranches: () => request<unknown[]>("/branches"),
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
};
