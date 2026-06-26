import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServerConnectionDetails } from "@/components/servers/ServerConnectionDetails";
import { getPelicanServer, listPelicanServers } from "@/lib/pelican";

interface ServerPageProps {
  params: {
    serverId: string;
  };
}

export async function generateStaticParams() {
  const servers = await listPelicanServers();

  return servers.map((server) => ({ serverId: server.identifier }));
}

export async function generateMetadata({ params }: ServerPageProps): Promise<Metadata> {
  const { serverId } = params;
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
  const { serverId } = params;
  const server = await getPelicanServer(serverId);

  if (!server) {
    notFound();
  }

  return (
    <article className="server-page">
      <div className="page-topline">
        <div>
          <p className="section-kicker">Server</p>
          <h1 className="page-title">{server.name}</h1>
          <p className="lead">{server.description || "Connection details and hosting metadata."}</p>
        </div>
        <Link href="/servers" className="button">
          Back to servers
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Status</span>
          <strong>{server.status}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Node</span>
          <strong>{server.nodeName || "Unknown"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Identifier</span>
          <strong>{server.identifier}</strong>
        </div>
      </div>

      <div className="detail-grid">
        <ServerConnectionDetails server={server} />

        <section className="detail-card">
          <p className="section-kicker">Capacity</p>
          <h2 className="detail-title">Resource limits</h2>
          <ul className="detail-list">
            <li>
              <strong>Memory</strong>
              <span>{server.limits.memory ? `${server.limits.memory} MB` : "Unknown"}</span>
            </li>
            <li>
              <strong>Disk</strong>
              <span>{server.limits.disk ? `${server.limits.disk} MB` : "Unknown"}</span>
            </li>
            <li>
              <strong>CPU</strong>
              <span>{server.limits.cpu ? `${server.limits.cpu}%` : "Unknown"}</span>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
