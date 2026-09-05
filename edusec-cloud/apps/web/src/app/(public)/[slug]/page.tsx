import { notFound } from "next/navigation";
import { publicApi } from "@/lib/public-api";
import { SectionRenderer } from "@/components/public/section-renderer";

/**
 * Generic CMS page route (brief Section 29) — every page created in the
 * admin Page Builder is reachable at /<slug> automatically, with no route
 * code to add per page. The home page ("") is handled by the root page.tsx
 * instead, since Next can't route an empty [slug] segment here.
 */
export default async function CmsPage({ params }: { params: { slug: string } }) {
  const page = await publicApi.getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <article>
      <SectionRenderer sections={page.sections} />
    </article>
  );
}
