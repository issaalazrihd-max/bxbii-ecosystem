const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Minimal in-memory token store. A production build should move the
// refresh token into an httpOnly cookie set by the API — kept simple here
// since this is a foundation scaffold, not the finished auth UX.
let accessToken: string | null = null;
let refreshToken: string | null = null;

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

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
};
