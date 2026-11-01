import fs from "node:fs/promises";
import path from "node:path";
import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/site-url";

// Generated once at build time. The Docker runtime image does not copy
// content/pages, and generating the XML at runtime would need that directory
// (or a GitHub API round trip); static generation keeps the route reliable.
export const dynamic = "force-static";

const PAGES_DIRECTORY = path.join(process.cwd(), "content", "pages");
const STATIC_ROUTES = ["/servers"];

// No CMS page carries a date in its front matter, and source file mtimes are
// not preserved in the deployed runtime bundle. Every entry therefore reports
// the build timestamp: each deployment regenerates the sitemap, so this is a
// conservative "this content may have changed" signal rather than a lie about
// the exact edit time.
const BUILD_TIME = new Date();

async function getContentPageRoutes() {
  try {
    const entries = await fs.readdir(PAGES_DIRECTORY, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && /\.(md|mdx)$/.test(entry.name))
      .map((entry) => entry.name.replace(/\.(md|mdx)$/, ""))
      .filter((slug) => slug.length > 0 && !slug.startsWith("_"))
      .sort()
      .map((slug) => (slug === "home" ? "/" : `/${slug}`));
  } catch {
    // A missing content directory must not break the build; the fixed routes
    // are still valid and the app would then have no marketing pages anyway.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = new Set([
    "/",
    ...(await getContentPageRoutes()),
    ...STATIC_ROUTES,
  ]);

  return [...routes].map((route) => ({
    url: absoluteSiteUrl(route),
    lastModified: BUILD_TIME,
  }));
}
