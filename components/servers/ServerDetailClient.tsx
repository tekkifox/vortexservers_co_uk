"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ServerConnectionDetails } from "@/components/servers/ServerConnectionDetails";
import type { PelicanServer } from "@/lib/pelican";

interface ServerDetailClientProps {
  serverId: string;
}

interface ServerResponse {
  server?: PelicanServer;
  error?: string;
}

export function ServerDetailClient({ serverId }: ServerDetailClientProps) {
  const [server, setServer] = useState<PelicanServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServer() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const payload = (await response.json()) as ServerResponse;

        if (!response.ok) {
          throw new Error(payload.error || `Request failed with ${response.status}`);
        }

        setServer(payload.server ?? null);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : "Failed to load server";
        setError(message);
        setServer(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadServer();

    return () => {
      controller.abort();
    };
  }, [serverId]);

  if (loading) {
    return (
      <div className="empty-state">
        <h2>Loading server</h2>
        <p>Fetching live details from Pelican.</p>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="empty-state">
        <h2>Server unavailable</h2>
        <p>{error || "No server record was returned for this identifier."}</p>
        <Link href="/servers" className="button primary">
          Back to servers
        </Link>
      </div>
    );
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
          <span className="stat-label">Online</span>
          <strong>{server.isOnline ? "Yes" : "No"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Node</span>
          <strong>{server.nodeName || "Unknown"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Port</span>
          <strong>{server.connection.port ?? "Unknown"}</strong>
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
