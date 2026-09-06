import type { MetadataRoute } from "next";

/**
 * robots.txt — served automatically by Next.js at /robots.txt.
 * Keeps the admin/auth surfaces out of search indexes and points crawlers
 * at the sitemap so the public marketing + training pages get indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/", "/login"],
      },
    ],
    sitemap: "https://www.bxbii.com/sitemap.xml",
    host: "https://www.bxbii.com",
  };
}
