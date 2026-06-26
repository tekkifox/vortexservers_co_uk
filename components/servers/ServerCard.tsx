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

      <ul className="server-meta-list">
        <li>
          <strong>Connect</strong>
          <span>{server.connection.address ?? "Unavailable"}</span>
        </li>
        <li>
          <strong>SFTP</strong>
          <span>
            {server.connection.sftpHost && server.connection.sftpPort
              ? `${server.connection.sftpHost}:${server.connection.sftpPort}`
              : "Unavailable"}
          </span>
        </li>
        <li>
          <strong>Memory</strong>
          <span>{server.limits.memory ? `${server.limits.memory} MB` : "Unknown"}</span>
        </li>
      </ul>

      <Link href={`/servers/${encodeURIComponent(server.uuid ?? server.identifier)}`} className="button primary">
        View server
      </Link>
    </article>
  );
}
