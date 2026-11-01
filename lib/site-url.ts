// The sitemap and robots routes are static metadata routes: they are generated
// at build time and cannot read the request Host header the way
// lib/public-origin.ts does for OAuth callbacks. Resolve the canonical origin
// from configuration instead, and fall back to the known deployment domains.

const PRODUCTION_ORIGIN = "https://www.vortexservers.co.uk";
const DEVELOPMENT_ORIGIN = "https://dev.vortexservers.co.uk";

function parseConfiguredOrigin(value: string | undefined) {
  const candidate = value?.trim();

  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    // Per-deployment Vercel hosts must never leak into a sitemap: a sitemap
    // full of *.vercel.app URLs is actively harmful. Ignore them and use the
    // canonical domain for the branch instead.
    if (url.hostname === "vercel.app" || url.hostname.endsWith(".vercel.app")) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteOrigin() {
  const configured = parseConfiguredOrigin(process.env.SITE_URL);

  if (configured) {
    return configured;
  }

  // Vercel exposes the deployed branch as VERCEL_GIT_COMMIT_REF. The dev
  // preview branch has its own custom domain, so it must not inherit the
  // production origin. VERCEL_URL and VERCEL_BRANCH_URL are intentionally
  // ignored because they point at per-deployment *.vercel.app hosts.
  if (process.env.VERCEL_GIT_COMMIT_REF?.trim() === "dev") {
    return DEVELOPMENT_ORIGIN;
  }

  // Production on Vercel and the Docker/Portainer image both serve the
  // canonical www host. SITE_URL overrides this when a deployment differs.
  return PRODUCTION_ORIGIN;
}

export function absoluteSiteUrl(pathname: string) {
  return new URL(pathname, `${getSiteOrigin()}/`).toString();
}
