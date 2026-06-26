export const siteConfig = {
  name: process.env.SITE_NAME ?? "Vortex Servers",
  contactEmail: "mail@vortexservers.co.uk",
  panelUrl:
    process.env.NEXT_PUBLIC_PELICAN_PANEL_URL ??
    process.env.PELICAN_PANEL_URL ??
    "https://panel.example.com",
};
