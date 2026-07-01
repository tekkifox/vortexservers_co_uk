import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const contentRoot = path.join(process.cwd(), "content", "pages");
const githubRepo = process.env.GITHUB_REPO?.trim();
const githubBranch = process.env.GITHUB_CONTENT_BRANCH?.trim() || "main";
const useRemoteContent = process.env.NODE_ENV === "production" && Boolean(githubRepo);

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

function getGithubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "vortexservers-co-uk",
  };

  const token = process.env.GITHUB_CONTENT_TOKEN?.trim();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getGithubContentsUrl(pathname: string) {
  if (!githubRepo) {
    throw new Error("GITHUB_REPO is required to load remote CMS content");
  }

  const url = new URL(`https://api.github.com/repos/${githubRepo}/contents/${pathname}`);
  url.searchParams.set("ref", githubBranch);
  return url;
}

async function readRemoteFile(pathname: string) {
  const response = await fetch(getGithubContentsUrl(pathname), {
    headers: getGithubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    type?: string;
    content?: string;
    encoding?: string;
  };

  if (data.type !== "file" || !data.content) {
    return null;
  }

  if (data.encoding !== "base64") {
    throw new Error(`Unsupported encoding for ${pathname}: ${data.encoding ?? "unknown"}`);
  }

  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function readPageSource(slug: string) {
  if (useRemoteContent) {
    for (const extension of ["md", "mdx"]) {
      const source = await readRemoteFile(`content/pages/${slug}.${extension}`);

      if (source) {
        return source;
      }
    }

    return null;
  }

  for (const extension of ["md", "mdx"]) {
    const markdownPath = path.join(contentRoot, `${slug}.${extension}`);

    try {
      return await fs.readFile(markdownPath, "utf8");
    } catch {
      continue;
    }
  }

  return null;
}

export async function getAllPageSlugs() {
  if (useRemoteContent) {
    const response = await fetch(getGithubContentsUrl("content/pages"), {
      headers: getGithubHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const items = (await response.json()) as Array<{
      type?: string;
      name?: string;
    }>;

    return items
      .filter((item) => item.type === "file" && item.name && /\.(md|mdx)$/.test(item.name))
      .map((item) => item.name!.replace(/\.(md|mdx)$/, ""));
  }

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
  try {
    const source = await readPageSource(slug);

    if (!source) {
      return null;
    }

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
