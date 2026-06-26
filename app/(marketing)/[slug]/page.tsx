import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/site/Markdown";
import { getAllPageSlugs, getPageBySlug } from "@/lib/content";

interface CmsPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();

  return slugs.filter((slug) => slug !== "home").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: "Page not found" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="page-body">
      <header className="page-header">
        <div>
          <p className="section-kicker">CMS page</p>
          <h1 className="page-title">{page.title}</h1>
          {page.description ? <p className="lead">{page.description}</p> : null}
        </div>

        <div className="page-actions">
          <Link href="/servers" className="button primary">
            View servers
          </Link>
          <Link href="/" className="button">
            Home
          </Link>
        </div>
      </header>

      <Markdown html={page.html} />
    </article>
  );
}
