import type { MetadataRoute } from "next";

/**
 * sitemap.xml — served automatically by Next.js at /sitemap.xml.
 * Lists the known public routes so search engines can discover the
 * homepage and the Miran Studio training course directly. CMS-authored
 * pages (app/(public)/[slug]) aren't enumerable here without a live DB
 * call at build/request time, so this starts with the routes that are
 * guaranteed to exist in code and can grow as more static routes ship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.bxbii.com";
  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/training`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
