const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Read-only client for the unauthenticated public-site endpoints
 * (apps/api/src/cms/public-site.controller.ts). Used by both the public
 * (public) route group (server-rendered) and, later, any client-side
 * refresh of nav/page content — plain fetch, no auth headers, so it works
 * the same on the server and in the browser.
 */

export type PublicSectionType =
  | "HERO"
  | "HEADING"
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "BUTTON"
  | "PRODUCTS"
  | "COURSES"
  | "PROJECTS"
  | "GALLERY"
  | "TEAM"
  | "PARTNERS"
  | "CONTACT_FORM"
  | "FILES"
  | "PDF"
  | "CUSTOM";

export interface PublicSection {
  id: string;
  sectionType: PublicSectionType;
  arContent: Record<string, unknown>;
  enContent: Record<string, unknown>;
  isVisible: boolean;
  position: number;
}

export interface PublicPage {
  id: string;
  slug: string;
  arTitle: string;
  enTitle: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  sections: PublicSection[];
}

export interface PublicNavItem {
  id: string;
  parentId: string | null;
  arLabel: string;
  enLabel: string;
  linkType: "PAGE" | "EXTERNAL_URL" | "COURSE" | "PROJECT" | "PRODUCT";
  externalUrl: string | null;
  openInNewTab: boolean;
  isVisible: boolean;
  position: number;
  href: string | null;
  children: PublicNavItem[];
}

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      // The CMS is meant to be editable and see changes reflected right
      // away (Section 29 page builder, Section 31 nav manager), so we
      // deliberately don't let Next cache this across requests.
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // API unreachable (e.g. local dev without the backend running yet) —
    // let callers render a graceful empty state instead of crashing.
    return null;
  }
}

export const publicApi = {
  getHomePage: () => publicFetch<PublicPage>("/public/pages/home"),
  getPageBySlug: (slug: string) => publicFetch<PublicPage>(`/public/pages/${slug}`),
  getNavigation: () => publicFetch<PublicNavItem[]>("/public/navigation"),
};
