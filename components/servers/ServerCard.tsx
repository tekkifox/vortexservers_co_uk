import Link from "next/link";
import type { PelicanServer } from "@/lib/pelican";

interface ServerCardProps {
  server: PelicanServer;
}

export function ServerCard({ server }: ServerCardProps) {
  const badgeLabel = server.resourceState === "starting" ? "Coming up" : server.isOnline ? "Online" : "Offline";
  const badgeClass = server.resourceState === "starting" ? "starting" : server.isOnline ? "online" : "offline";

  return (
    <article className="server-card">
      <div className="server-card-header">
        <div>
          <p className="eyebrow">Pelican server</p>
          <h3 className="server-name">{server.name}</h3>
        </div>
        <span className={`status ${badgeClass}`}>{badgeLabel}</span>
      </div>

      <p className="muted">{server.description || "Managed game server with live connection details."}</p>

      <div className="server-summary-grid">
        <div className="server-summary">
          <p className="meta">Connect</p>
          <div className="server-summary-value">{server.connection.address ?? "Unavailable"}</div>
        </div>

        <div className="server-summary">
          <p className="meta">Memory</p>
          <div className="server-summary-value">
            {server.limits.memory ? `${server.limits.memory} MB` : "Unknown"}
          </div>
        </div>
      </div>

      <Link href={`/servers/${encodeURIComponent(server.identifier)}`} className="button primary">
        View server
      </Link>
    </article>
  );
}
