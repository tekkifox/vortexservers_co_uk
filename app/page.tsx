import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/site/Markdown";
import { ServersDirectory } from "@/components/servers/ServersDirectory";
import { getPageBySlug } from "@/lib/content";

function safeInternalHref(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("home");

  return {
    title: page?.title ?? "Game server hosting",
    description:
      page?.description ??
      "A lightweight CMS controls the marketing pages, while Pelican supplies live server data.",
  };
}

export default async function HomePage() {
  const page = await getPageBySlug("home");
  const primaryHref = safeInternalHref(page?.primaryCtaHref, "/servers");
  const primaryLabel = page?.primaryCtaLabel || "Browse servers";
  const secondaryHref = safeInternalHref(page?.secondaryCtaHref, "/about");
  const secondaryLabel = page?.secondaryCtaLabel || "Read more";

  return (
    <div className="stack">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">{page?.eyebrow || "Game server hosting"}</p>
            <h1>{page?.title || "Manage your community servers from one polished front door."}</h1>
            <p className="lead">
              {page?.description ||
                "A lightweight CMS controls the marketing pages, while Pelican supplies live server data and connection details for players and admins."}
            </p>

            <div className="hero-actions">
              <Link href={primaryHref} className="button primary">
                {primaryLabel}
              </Link>
              <Link href={secondaryHref} className="button">
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <aside className="detail-card">
            <p className="section-kicker">Website scaffold</p>
            <h2 className="section-title">Built for content and server data</h2>
            <ul className="page-list">
              <li>
                <strong>CMS</strong>
                <span>Decap CMS-backed markdown pages</span>
              </li>
              <li>
                <strong>Server feed</strong>
                <span>Pelican client API integration</span>
              </li>
              <li>
                <strong>UI</strong>
                <span>React cards, connection panels, and copy actions</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {page?.html ? (
        <section className="page-body">
          <Markdown html={page.html} />
        </section>
      ) : null}

      <section className="section">
        <div className="page-header">
          <div>
            <p className="section-kicker">Live servers</p>
            <h2 className="section-title">Current server list</h2>
          </div>
          <Link href="/servers" className="button">
            View all
          </Link>
        </div>

        <ServersDirectory />
      </section>
    </div>
  );
}
