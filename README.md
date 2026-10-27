# Vortex Servers

Run the app locally or in production. Tested with Node.js 20.9+.

## Requirements

- Node.js 20.9+ (or compatible 20.x/22.x)
- pnpm 10 (enable it with `corepack enable pnpm`)

## Install

Install dependencies:

```bash
pnpm install
```

## Environment

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Populate `.env.local` with the values you need. Example values:

```env
SITE_NAME=VorteX Servers
PELICAN_API_BASE_URL=https://pelican.example.com/api/client
PELICAN_CLIENT_API_TOKEN=your-client-secret-token
NEXT_PUBLIC_PELICAN_PANEL_URL=https://pelican.example.com
GITHUB_REPO=tekkifox/vortexservers_co_uk
GITHUB_OAUTH_BASE_URL=http://localhost:3000
GITHUB_OAUTH_CLIENT_ID=your-client-secret-id
GITHUB_OAUTH_CLIENT_SECRET=your-client-secret-token
GITHUB_CONTENT_TOKEN=your-content-token
NODE_ENV=development
```

Notes about Pelican and GitHub tokens:

- If you leave the Pelican values unset the app will still run in development and show demo server data.
- `PELICAN_CLIENT_API_TOKEN` must be the full `secret_token` returned when creating the token (not the short `pacc_...` identifier).
- If your GitHub repository is private, set `GITHUB_CONTENT_TOKEN` so the app can read CMS page content at runtime.

GitHub content token (GITHUB_CONTENT_TOKEN)

- Purpose: when running in production with `GITHUB_REPO` set, the app reads CMS page content at request time from the GitHub Contents API (content/pages/*.md|*.mdx). `GITHUB_CONTENT_TOKEN` is added as a Bearer token on API requests so private repositories can be accessed.
- When used: `lib/content.ts` checks `NODE_ENV === "production"` and a non-empty `GITHUB_REPO`. If both are set the app fetches files and lists the `content/pages` directory remotely instead of reading the local `content/pages` files.
- Branch: controlled by `GITHUB_CONTENT_BRANCH` (defaults to `main`). Requests use `cache: "no-store"` so changes in GitHub are reflected immediately without rebuilding.
- Example `.env.local` entries:

```env
GITHUB_REPO=owner/repo
GITHUB_CONTENT_TOKEN=ghp_xxx...   # or a fine-grained token with repo contents read access
GITHUB_CONTENT_BRANCH=main        # optional (defaults to main)
```

- Security guidance:
  - Keep this token secret. Do not commit it to source control or expose it in logs.
  - Use the least-privilege token possible: for private repos create a fine-grained token and grant only repository Contents (read) permission for the specific repo. If using a classic PAT, `repo` scope is required for private repositories; for public repos no token is necessary.
  - Store the token in a secrets manager, CI/CD secret store, Docker secrets, or an environment file excluded from source control (example: `.env.local`). Rotate the token if compromised.
- Behavior if unset: if the repo is public the app can still fetch files without a token. If the repo is private and the token is not provided, the app will be unable to read remote CMS content and will fall back to local files (or return no pages in production when `GITHUB_REPO` is set without a valid token).

## Run

Start the dev server:

```bash
pnpm run dev
```

Open http://localhost:3000

For a production-style local test:

```bash
pnpm run build
pnpm start
```

## GitHub OAuth (admin login)

Set the following environment variables before starting the app if you want GitHub-based admin login:

```env
GITHUB_REPO=owner/repo
GITHUB_OAUTH_CLIENT_ID=your-github-oauth-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-github-oauth-client-secret
```

When creating the GitHub OAuth app, set its callback URL to `https://your-site.example.com/callback` (replace with your site URL).

Details about GitHub OAuth values

- `GITHUB_OAUTH_CLIENT_ID` (what it is): the public client identifier for the GitHub OAuth App. The application uses it to build the authorization URL users are redirected to when signing in.
- `GITHUB_OAUTH_CLIENT_SECRET` (what it is): the secret paired with the client ID. The application posts the client ID and client secret to GitHub to exchange an authorization code for an access token.

How the app uses them (code references):

- `lib/github-oauth.ts` -> `buildAuthorizeUrl` adds `client_id` (GITHUB_OAUTH_CLIENT_ID) and `redirect_uri` to the authorize URL.
- `lib/github-oauth.ts` -> `exchangeGitHubCode` posts `client_id`, `client_secret`, `code`, and `redirect_uri` to GitHub's token endpoint to obtain an access token.

Scope and callback

- `GITHUB_OAUTH_SCOPE` defaults to `repo,user` in this project. Limit scopes to the fewest permissions required for admin login.
- The redirect/callback URL you configure in the GitHub OAuth app must exactly match `<public-origin>/callback` (the app constructs the redirect URI using the public origin). If using a custom GitHub Enterprise instance, set `GITHUB_HOSTNAME` accordingly.

Security guidance:

- `GITHUB_OAUTH_CLIENT_ID` is not secret and can be embedded in client code, but `GITHUB_OAUTH_CLIENT_SECRET` must be kept confidential (store in environment variables or a secrets manager and never commit it).
- Use a narrow scope for the OAuth token, and rotate credentials if they may be compromised.

Behavior if unset: the app will throw an error when attempting to build the authorization URL or perform the token exchange (the code requires both client ID and client secret). Admin login will be unavailable until both values are provided.

## API endpoints

- `GET /api/servers` — returns the Pelican-backed server list used by the React frontend.
- `GET /api/servers/[serverId]` — returns one server and its connection details.

The home and server listing pages fetch from these endpoints in the browser. The server detail page renders the same Pelican-backed data through the same API route.

## Production notes

CMS page content is read directly from GitHub at request time, so publishing content in Decap does not require rebuilding or redeploying a Docker image. Ensure the app can read GitHub content at runtime (public repo or `GITHUB_CONTENT_TOKEN` set).

## Dependency updates (Renovate)

Renovate keeps dependencies up to date using [`renovate.json`](renovate.json) at the repository root. It runs in the `Europe/London` timezone. There is deliberately no update schedule window: concurrency is the throttle instead (at most 3 open Renovate PRs and 2 new PRs per hour), so security fixes are not held back for a weekly window.

What to expect:

- Routine minor and patch updates arrive as pull requests. Linked packages are grouped so they move together:
  - **React** — `react`, `react-dom`, `@types/react`, and `@types/react-dom` in one PR. The runtime and its typings stay in lockstep, so a React bump cannot land without the matching type definitions.
  - **Vercel analytics** — `@vercel/analytics` and `@vercel/speed-insights` in one PR.
  - **Next.js** — `next` on its own; no other package in this repository is pinned to a Next.js version.
- Major updates are labelled `major` and are never automerged. In fact nothing automerges: the global default is `automerge: false`, and this is repeated for majors and for every group.
- Vulnerability alerts are handled at any time, outside the normal update cadence.
- pnpm lockfile maintenance is enabled so the committed lockfile is refreshed periodically (also without automerge).

The repository's Dependency Dashboard issue is the live queue: it lists pending, ignored, and rate-limited updates.

Installing the Renovate app on the account does not by itself grant it access to this repository. Repository access must be granted to Renovate for `tekkifox/vortexservers_co_uk`; the appearance of the Dependency Dashboard issue is the signal that it has processed this repository.
