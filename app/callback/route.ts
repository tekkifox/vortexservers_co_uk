import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGitHubCode,
  getStateCookie,
  renderOauthResponse,
} from "@/lib/github-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expectedState = getStateCookie(request);

    if (!code) {
      return new NextResponse(renderOauthResponse(request, "github", "error", { error: "Missing code" }), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (!state || !expectedState || state !== expectedState) {
      return new NextResponse(
        renderOauthResponse(request, "github", "error", { error: "Invalid OAuth state" }),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }

    const token = await exchangeGitHubCode(request, code);
    return new NextResponse(
      renderOauthResponse(request, "github", "success", {
        token,
        provider: "github",
      }),
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub OAuth failed";

    return new NextResponse(renderOauthResponse(request, "github", "error", { error: message }), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
