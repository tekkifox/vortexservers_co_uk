import { NextResponse } from "next/server";
import { getPelicanServer } from "@/lib/pelican";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ServerRouteParams {
  params: {
    serverId: string;
  };
}

export async function GET(_: Request, { params }: ServerRouteParams) {
  try {
    const server = await getPelicanServer(params.serverId);

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    return NextResponse.json({ server });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load server";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
