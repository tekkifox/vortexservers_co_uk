Run it locally with Node.js 18.17+.

Install dependencies:
npm install
Create your local env file:
cp .env.example .env.local
Fill in .env.local if you want real Pelican data:
SITE_NAME=Vortex Servers
PELICAN_API_BASE_URL=https://your-panel.example.com/api/client
PELICAN_CLIENT_API_TOKEN=your-client-secret-token
NEXT_PUBLIC_PELICAN_PANEL_URL=https://your-panel.example.com
GITHUB_REPO=owner/repo
GITHUB_OAUTH_BASE_URL=http://localhost:3000
GITHUB_OAUTH_CLIENT_ID=your-github-oauth-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-github-oauth-client-secret
Start the dev server:
npm run dev
Open:
http://localhost:3000
Notes:

If you leave the Pelican values unset, the app will still run in development and show demo server data.
For a production-style local test, use:
npm run build
npm start

API endpoints:

- `GET /api/servers` returns the Pelican-backed server list used by the React frontend.
- `GET /api/servers/[serverId]` returns one server and its connection details.

The home page and server listing page fetch from those endpoints in the browser, while the server detail page renders the same Pelican-backed data through the same API route.

For Pelican client API access, use a client/account API token and the `/api/client` base URL.
The value in `PELICAN_CLIENT_API_TOKEN` must be the full `secret_token` copied when the key is created, not the short `pacc_...` identifier.
For admin login with GitHub, set `GITHUB_REPO`, `GITHUB_OAUTH_BASE_URL`, `GITHUB_OAUTH_CLIENT_ID`, and `GITHUB_OAUTH_CLIENT_SECRET` before starting the app.
When you create the GitHub OAuth app, set its callback URL to `https://your-site.example.com/callback`.
