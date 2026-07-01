import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";

const GITHUB_AUTHORIZE_PATH = "/login/oauth/authorize";
const GITHUB_TOKEN_PATH = "/login/oauth/access_token";
const STATE_COOKIE = "decap_github_oauth_state";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getGithubHost() {
  return process.env.GITHUB_HOSTNAME?.trim() || "https://github.com";
}

export function getOauthBaseUrl(request: NextRequest) {
  return trimTrailingSlash(process.env.GITHUB_OAUTH_BASE_URL?.trim() || request.nextUrl.origin);
}

export function buildAuthorizeUrl(request: NextRequest, state: string) {
  const githubHost = new URL(getGithubHost());
  const authorizeUrl = new URL(GITHUB_AUTHORIZE_PATH, githubHost);
  const params = new URLSearchParams({
    client_id: getRequiredEnv("GITHUB_OAUTH_CLIENT_ID"),
    redirect_uri: `${getOauthBaseUrl(request)}/callback`,
    scope: process.env.GITHUB_OAUTH_SCOPE?.trim() || "repo,user",
    state,
    allow_signup: "true",
  });

  authorizeUrl.search = params.toString();
  return authorizeUrl.toString();
}

export function createState() {
  return randomBytes(24).toString("hex");
}

export function createStateCookie(state: string, request: NextRequest) {
  const secure = request.nextUrl.protocol === "https:";

  return {
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/callback",
    maxAge: 10 * 60,
  };
}

export function getStateCookie(request: NextRequest) {
  return request.cookies.get(STATE_COOKIE)?.value;
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function exchangeGitHubCode(request: NextRequest, code: string) {
  const tokenUrl = new URL(GITHUB_TOKEN_PATH, new URL(getGithubHost()));
  const body = new URLSearchParams({
    client_id: getRequiredEnv("GITHUB_OAUTH_CLIENT_ID"),
    client_secret: getRequiredEnv("GITHUB_OAUTH_CLIENT_SECRET"),
    code,
    redirect_uri: `${getOauthBaseUrl(request)}/callback`,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    const description = data.error_description || data.error || "GitHub OAuth token exchange failed";
    throw new Error(description);
  }

  return data.access_token;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

function toOriginList(request: NextRequest) {
  return [new URL(getOauthBaseUrl(request)).origin];
}

export function renderOauthResponse(request: NextRequest, provider: string, message: string, content: unknown) {
  const payload = `authorization:${provider}:${message}:${JSON.stringify(content)}`;
  const origins = toOriginList(request);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorizing</title>
  </head>
  <body>
    <script>
      (function() {
        var payload = ${JSON.stringify(payload)};
        var origins = ${JSON.stringify(origins)};
        function contains(arr, elem) {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] === elem) {
              return true;
            }
          }
          return false;
        }

        function receiveMessage(e) {
          if (!contains(origins, e.origin)) {
            return;
          }

          window.opener.postMessage(payload, e.origin);
        }

        window.addEventListener("message", receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage("authorizing:${provider}", "*");
        }
      })();
    </script>
    <p>${escapeHtml(message)}</p>
  </body>
</html>`;

  return html;
}
