import type { MetadataRoute } from "next";
import { absoluteSiteUrl, getSiteOrigin } from "@/lib/site-url";

// Keep robots.txt in lockstep with the sitemap: both are static metadata
// routes generated at build time from the same canonical origin.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or non-page endpoints. /api/ covers every API route.
      disallow: ["/admin", "/admin/", "/api/", "/auth", "/callback"],
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: getSiteOrigin(),
  };
}
