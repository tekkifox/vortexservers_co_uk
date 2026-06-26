import Link from "next/link";
import type { PelicanServer } from "@/lib/pelican";

interface ServerCardProps {
  server: PelicanServer;
}

function getStatusClass(status: string) {
  const normalised = status.toLowerCase();

  if (["online", "running"].includes(normalised)) return "online";
  if (["starting", "installing", "transferring"].includes(normalised)) return "starting";
  if (["offline", "stopped", "suspended", "unreachable"].includes(normalised)) return "offline";

  return "offline";
}

export function ServerCard({ server }: ServerCardProps) {
  return (
    <article className="server-card">
      <div className="server-card-header">
        <div>
          <p className="eyebrow">{server.nodeName || "Pelican server"}</p>
          <h3 className="server-name">{server.name}</h3>
        </div>
        <span className={`status ${getStatusClass(server.status)}`}>{server.status}</span>
      </div>

      <p className="muted">{server.description || "Managed game server with live connection details."}</p>

      <div className="server-summary-grid">
        <div className="server-summary">
          <p className="meta">Connect</p>
          <div className="server-summary-value">{server.connection.address ?? "Unavailable"}</div>
        </div>

        <div className="server-summary">
          <p className="meta">Memory</p>
          <div className="server-summary-value">{server.limits.memory ? `${server.limits.memory} MB` : "Unknown"}</div>
        </div>

        <div className="server-summary">
          <p className="meta">Node</p>
          <div className="server-summary-value">{server.nodeName || "Unknown"}</div>
        </div>
      </div>

      <Link href={`/servers/${encodeURIComponent(server.identifier)}`} className="button primary">
        View server
      </Link>
    </article>
  );
}
