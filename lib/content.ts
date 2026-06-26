import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const contentRoot = path.join(process.cwd(), "content", "pages");

export interface CmsPage {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  body: string;
  html: string;
}

type CmsPageFrontMatter = Omit<CmsPage, "slug" | "body" | "html">;

async function renderMarkdown(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

export async function getAllPageSlugs() {
  const files = await fs.readdir(contentRoot);

  return files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.(md|mdx)$/, ""));
}

export async function getAllPages() {
  const slugs = await getAllPageSlugs();
  const pages = await Promise.all(slugs.map((slug) => getPageBySlug(slug)));

  return pages.filter((page): page is CmsPage => Boolean(page));
}

export async function getPageBySlug(slug: string) {
  const markdownPath = path.join(contentRoot, `${slug}.md`);

  try {
    const source = await fs.readFile(markdownPath, "utf8");
    const { content, data } = matter(source);
    const frontMatter = data as CmsPageFrontMatter;

    return {
      slug,
      title: frontMatter.title ?? slug,
      description: frontMatter.description ?? "",
      eyebrow: frontMatter.eyebrow ?? "",
      primaryCtaLabel: frontMatter.primaryCtaLabel ?? "",
      primaryCtaHref: frontMatter.primaryCtaHref ?? "",
      secondaryCtaLabel: frontMatter.secondaryCtaLabel ?? "",
      secondaryCtaHref: frontMatter.secondaryCtaHref ?? "",
      body: content.trim(),
      html: await renderMarkdown(content),
    } satisfies CmsPage;
  } catch {
    return null;
  }
}
