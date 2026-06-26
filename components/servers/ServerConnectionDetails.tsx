"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import type { PelicanServer } from "@/lib/pelican";

interface ServerConnectionDetailsProps {
  server: PelicanServer;
}

function detailValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Unavailable";
  }

  return String(value);
}

export function ServerConnectionDetails({ server }: ServerConnectionDetailsProps) {
  return (
    <section className="connection-panel detail-card">
      <div>
        <p className="section-kicker">Connection</p>
        <h2 className="connection-title">Access details</h2>
      </div>

      <div className="connection-row">
        <div>
          <p className="meta">Primary address</p>
          <div className="connection-value">{detailValue(server.connection.address)}</div>
        </div>
        {server.connection.address ? <CopyButton value={server.connection.address} /> : null}
      </div>

      <div className="connection-row">
        <div>
          <p className="meta">SFTP endpoint</p>
          <div className="connection-value">
            {server.connection.sftpHost && server.connection.sftpPort
              ? `${server.connection.sftpHost}:${server.connection.sftpPort}`
              : "Unavailable"}
          </div>
        </div>
        {server.connection.sftpHost && server.connection.sftpPort ? (
          <CopyButton value={`${server.connection.sftpHost}:${server.connection.sftpPort}`} />
        ) : null}
      </div>

      <ul className="detail-list">
        <li>
          <strong>Public IP</strong>
          <span>{detailValue(server.connection.ip)}</span>
        </li>
        <li>
          <strong>Port</strong>
          <span>{detailValue(server.connection.port)}</span>
        </li>
        <li>
          <strong>SFTP user</strong>
          <span>{detailValue(server.connection.sftpUsername)}</span>
        </li>
        <li>
          <strong>Panel</strong>
          <span>{server.connection.panelUrl}</span>
        </li>
      </ul>
    </section>
  );
}
