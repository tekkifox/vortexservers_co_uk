// The CSP is built in middleware, which runs on the edge runtime where only
// NEXT_PUBLIC_* values are available. Sources are therefore kept static: the
// browser only talks to this origin (API calls are proxied through /api) plus
// Decap CMS and the GitHub API used by the admin OAuth flow.
const DECAP_SCRIPT_ORIGIN = "https://unpkg.com";
const GITHUB_API_ORIGIN = "https://api.github.com";
const GITHUB_ORIGIN = "https://github.com";

export function buildContentSecurityPolicy(
  nonce: string,
  options: { isDev: boolean; allowEval: boolean },
) {
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    DECAP_SCRIPT_ORIGIN,
    GITHUB_API_ORIGIN,
  ];

  // The Decap CMS bundle evaluates code at runtime, so the admin routes need
  // 'unsafe-eval'. It is scoped to /admin rather than the whole site.
  if (options.allowEval || options.isDev) {
    scriptSources.push("'unsafe-eval'");
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'self'"],
    "script-src": scriptSources,
    "script-src-attr": ["'none'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "media-src": ["'self'", "data:", "blob:"],
    "connect-src": ["'self'", GITHUB_API_ORIGIN, GITHUB_ORIGIN],
    "frame-src": ["'self'", "blob:"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "form-action": ["'self'", GITHUB_ORIGIN],
  };

  if (!options.isDev) {
    directives["upgrade-insecure-requests"] = [];
  }

  return Object.entries(directives)
    .map(([directive, sources]) =>
      sources.length > 0 ? `${directive} ${sources.join(" ")}` : directive,
    )
    .join("; ");
}

export function buildSecurityHeaders(nonce: string, allowEval = false) {
  const isDev = process.env.NODE_ENV === "development";

  const headers: Record<string, string> = {
    "Content-Security-Policy": buildContentSecurityPolicy(nonce, { isDev, allowEval }),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": [
      "accelerometer=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-origin",
  };

  if (!isDev) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}
