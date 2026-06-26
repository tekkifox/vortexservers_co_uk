import { NextResponse } from "next/server";
import { listPelicanServers } from "@/lib/pelican";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const servers = await listPelicanServers();

    return NextResponse.json({ servers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load servers";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
