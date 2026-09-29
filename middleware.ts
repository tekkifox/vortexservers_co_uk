import { NextResponse, type NextRequest } from "next/server";
import { buildSecurityHeaders } from "@/lib/security-headers";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

function createNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

const ADMIN_PATH = "/admin";

export function middleware(request: NextRequest) {
  const nonce = createNonce();
  const allowEval = request.nextUrl.pathname.startsWith(ADMIN_PATH);
  const headers = buildSecurityHeaders(nonce, allowEval);
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
