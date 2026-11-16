import type { NextRequest } from "next/server";
import { getPublicOrigin } from "@/lib/public-origin";

export function buildCmsConfig(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const repo = process.env.GITHUB_REPO?.trim() || "username/repo";
    const origin = getPublicOrigin(request).replace(/\/$/, "");

    return [
      "backend:",
      "  name: github",
      `  repo: ${repo}`,
      "  branch: main",
      `  base_url: ${origin}`,
      "publish_mode: editorial_workflow",
      "media_folder: public/uploads",
      "public_folder: /uploads",
      "collections:",
      "  - name: navigation",
      "    label: Navigation",
      "    files:",
      "      - name: menu",
      "        label: Site menu",
      "        file: content/settings/navigation.md",
      "        fields:",
      "          - label: Title",
      "            name: title",
      "            widget: string",
      "          - label: Items",
      "            name: items",
      "            widget: list",
      "            fields:",
      "              - label: Label",
      "                name: label",
      "                widget: string",
      "              - label: Href",
      "                name: href",
      "                widget: string",
    ].join("\n");
  }

  return [
    "backend:",
    "  name: git-gateway",
    "local_backend: true",
    "publish_mode: editorial_workflow",
    "media_folder: public/uploads",
    "public_folder: /uploads",
    "collections:",
    "  - name: navigation",
    "    label: Navigation",
    "    files:",
    "      - name: menu",
    "        label: Site menu",
    "        file: content/settings/navigation.md",
    "        fields:",
    "          - label: Title",
    "            name: title",
    "            widget: string",
    "          - label: Items",
    "            name: items",
    "            widget: list",
    "            fields:",
    "              - label: Label",
    "                name: label",
    "                widget: string",
    "              - label: Href",
    "                name: href",
    "                widget: string",
  ].join("\n");
}
