const DECAP_SCRIPT_ORIGIN = "https://unpkg.com";
const GITHUB_API_ORIGIN = "https://api.github.com";
const GITHUB_ORIGIN = "https://github.com";

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function parseOrigin(value: string | undefined, fallback: string) {
  const raw = value?.trim();

  if (!raw) {
    return fallback;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return fallback;
  }
}

function githubOrigin() {
  return parseOrigin(process.env.GITHUB_HOSTNAME, GITHUB_ORIGIN);
}

function pelicanOrigins() {
  const configured = [
    process.env.NEXT_PUBLIC_PELICAN_PANEL_URL,
    process.env.PELICAN_PANEL_URL,
    process.env.PELICAN_API_BASE_URL,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  const origins = new Set<string>();

  for (const value of configured) {
    try {
      origins.add(new URL(value).origin);
    } catch {
      // Ignore malformed configuration instead of emitting an invalid CSP source.
    }
  }

  return [...origins];
}

export function buildContentSecurityPolicy(nonce: string, isDev: boolean) {
  const scriptSources = [
    `'self'`,
    `'nonce-${nonce}'`,
    DECAP_SCRIPT_ORIGIN,
    GITHUB_API_ORIGIN,
  ];

  if (isDev) {
    scriptSources.push("'unsafe-eval'");
  }

  const connectSources = unique([
    "'self'",
    GITHUB_API_ORIGIN,
    githubOrigin(),
    ...pelicanOrigins(),
  ]);

  const formActions = unique(["'self'", githubOrigin()]);

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
    "connect-src": connectSources,
    "frame-src": ["'self'", "blob:"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "form-action": formActions,
  };

  if (!isDev) {
    directives["upgrade-insecure-requests"] = [];
  }

  return Object.entries(directives)
    .map(([directive, sources]) =>
      sources.length > 0 ? `${directive} ${sources.join(" ")}` : directive,
    )
    .join("; ");
}

export function buildSecurityHeaders(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";

  const headers: Record<string, string> = {
    "Content-Security-Policy": buildContentSecurityPolicy(nonce, isDev),
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
