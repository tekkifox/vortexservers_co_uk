Run it locally with Node.js 18.17+.

Install dependencies:
npm install
Create your local env file:
cp .env.example .env.local
Fill in .env.local if you want real Pelican data:
SITE_NAME=Vortex Servers
PELICAN_API_BASE_URL=https://your-panel.example.com/api/client
PELICAN_API_TOKEN=your-token
NEXT_PUBLIC_PELICAN_PANEL_URL=https://your-panel.example.com
Start the dev server:
npm run dev
Open:
http://localhost:3000
Notes:

If you leave the Pelican values unset, the app will still run and show demo server data.
For a production-style local test, use:
npm run build
npm start