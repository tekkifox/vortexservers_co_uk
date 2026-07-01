import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl, createState, createStateCookie } from "@/lib/github-oauth";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const state = createState();
  const response = NextResponse.redirect(buildAuthorizeUrl(request, state), 302);
  response.cookies.set(createStateCookie(state, request));

  return response;
}
