import type { Metadata } from "next";
import { ServerDetailClient } from "@/components/servers/ServerDetailClient";
import { getPelicanServer } from "@/lib/pelican";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ServerPageProps {
  params: Promise<{
    serverId: string;
  }>;
}

export async function generateMetadata({ params }: ServerPageProps): Promise<Metadata> {
  const { serverId } = await params;
  const server = await getPelicanServer(serverId);

  if (!server) {
    return { title: "Server not found" };
  }

  return {
    title: server.name,
    description: server.description,
  };
}

export default async function ServerDetailPage({ params }: ServerPageProps) {
  const { serverId } = await params;

  return (
    <ServerDetailClient serverId={serverId} />
  );
}
