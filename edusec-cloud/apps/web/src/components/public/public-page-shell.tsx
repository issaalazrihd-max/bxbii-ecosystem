import { publicApi } from "@/lib/public-api";
import { LanguageProvider } from "./language-provider";
import { PublicNav } from "./public-nav";
import { PublicFooter } from "./public-footer";

/**
 * Shared chrome for every public bxbii page: fetches the CMS navigation
 * tree server-side (Section 31) and wraps the page content in the
 * language provider, header, and footer. Used directly as the root "/"
 * page's wrapper and as the (public) route group's layout, so both the
 * home page and every generic [slug] page share exactly one chrome
 * implementation instead of two copies drifting apart.
 */
export async function PublicPageShell({ children }: { children: React.ReactNode }) {
  const nav = (await publicApi.getNavigation()) ?? [];

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-surface">
        <PublicNav items={nav} />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </LanguageProvider>
  );
}
