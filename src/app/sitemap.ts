import type { MetadataRoute } from "next";

import { resolveAbsoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeUrl = await resolveAbsoluteUrl("/");

  if (!homeUrl) {
    return [];
  }

  return [
    {
      url: homeUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
