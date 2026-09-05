import { publicApi } from "@/lib/public-api";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { SectionRenderer } from "@/components/public/section-renderer";

/**
 * The bxbii public home page (brief Sections 1-2, 28-29) — dynamic, CMS-
 * managed, and the new front door for the site. Staff/admin sign-in moved
 * to /login (linked from the public nav and footer) instead of being the
 * default landing route.
 *
 * Not wrapped by the (public) route group's layout because that group
 * can't route an empty [slug] segment for the home page — so this reuses
 * the exact same PublicPageShell directly instead of duplicating it.
 */
export default async function RootPage() {
  const page = await publicApi.getHomePage();

  return (
    <PublicPageShell>
      {page ? (
        <SectionRenderer sections={page.sections} />
      ) : (
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-brand">bxbii</h1>
          <p className="mt-3 text-slate-500">
            The home page hasn&apos;t been published yet — add content in the CMS admin to see it here.
          </p>
        </div>
      )}
    </PublicPageShell>
  );
}
