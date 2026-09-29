import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { buildSecurityHeaders } from "@/lib/security-headers";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

function createNonce() {
  return randomBytes(16).toString("base64");
}

export function middleware(request: NextRequest) {
  const nonce = createNonce();
  const headers = buildSecurityHeaders(nonce);
  const csp = headers["Content-Security-Policy"];

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
