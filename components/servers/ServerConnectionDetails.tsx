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

      <div className="connection-summary-grid">
        <div className="connection-summary connection-summary--wide">
          <p className="meta">Primary address</p>
          <div className="connection-value">{detailValue(server.connection.address)}</div>
          {server.connection.address ? <CopyButton value={server.connection.address} /> : null}
        </div>

        <div className="connection-summary">
          <p className="meta">Public IP</p>
          <div className="connection-value">{detailValue(server.connection.ip)}</div>
        </div>

        <div className="connection-summary">
          <p className="meta">Port</p>
          <div className="connection-value">{detailValue(server.connection.port)}</div>
        </div>
      </div>
    </section>
  );
}
