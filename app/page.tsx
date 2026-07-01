import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/site/Markdown";
import { ServersDirectory } from "@/components/servers/ServersDirectory";
import { getPageBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
const discordHref = "https://discord.gg/GCC2EekGz";
const koFiHref = "https://ko-fi.com/vortexservers";

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
              <a href={discordHref} className="button" target="_blank" rel="noreferrer">
                Our Discord
              </a>
              <a href={koFiHref} className="button" target="_blank" rel="noreferrer">
                Our Ko-fi
              </a>
            </div>
          </div>
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
