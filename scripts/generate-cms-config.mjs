import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = resolve(rootDir, "cms/config.template.yml");
const outputPath = resolve(rootDir, "public/config.yml");

const { loadEnvConfig } = nextEnv;

loadEnvConfig(rootDir);

const template = await readFile(templatePath, "utf8");
const repo = process.env.GITHUB_REPO ?? "username/repo";
const oauthBaseUrl =
  process.env.GITHUB_OAUTH_BASE_URL?.trim().replace(/\/$/, "") ??
  "http://localhost:3000";

if (!template.includes("${GITHUB_REPO}")) {
  throw new Error("cms config template is missing the ${GITHUB_REPO} placeholder");
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  template
    .replace("${GITHUB_REPO}", repo)
    .replace("${GITHUB_OAUTH_BASE_URL}", oauthBaseUrl),
);
