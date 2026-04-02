import type { MetadataRoute } from "next";

import { resolveAbsoluteUrl } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const sitemapUrl = await resolveAbsoluteUrl("/sitemap.xml");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: sitemapUrl ? [sitemapUrl] : undefined,
  };
}
