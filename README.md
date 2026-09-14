# Vortex Servers

Run the app locally or in production. Tested with Node.js 18.17+.

## Requirements

- Node.js 18.17+ (or compatible 18.x)

## Install

Install dependencies:

```bash
npm install
```

## Environment

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Populate `.env.local` with the values you need. Example values:

```env
SITE_NAME=Vortex Servers
PELICAN_API_BASE_URL=https://your-panel.example.com/api/client
PELICAN_CLIENT_API_TOKEN=your-client-secret-token
NEXT_PUBLIC_PELICAN_PANEL_URL=https://your-panel.example.com
GITHUB_REPO=owner/repo
GITHUB_CONTENT_TOKEN=
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
npm run dev
```

Open http://localhost:3000

For a production-style local test:

```bash
npm run build
npm start
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
