import { NextRequest } from "next/server";
import { buildCmsConfig } from "@/lib/cms-config";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return new Response(buildCmsConfig(request), {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
