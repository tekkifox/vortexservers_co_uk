"use client";

import { useEffect, useState } from "react";
import { ServerGrid } from "@/components/servers/ServerGrid";
import type { PelicanServer } from "@/lib/pelican";

interface ServersDirectoryProps {
  emptyMessage?: string;
}

interface ServersResponse {
  servers?: PelicanServer[];
  error?: string;
}

export function ServersDirectory({ emptyMessage }: ServersDirectoryProps) {
  const [servers, setServers] = useState<PelicanServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServers() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/servers", {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const payload = (await response.json()) as ServersResponse;

        if (!response.ok) {
          throw new Error(payload.error || `Request failed with ${response.status}`);
        }

        setServers(Array.isArray(payload.servers) ? payload.servers : []);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : "Failed to load servers";
        setError(message);
        setServers([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadServers();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="empty-state">
        <h2>Loading servers</h2>
        <p>Fetching live data from Pelican.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2>Unable to load servers</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="empty-state">
        <h2>No servers available</h2>
        <p>
          {emptyMessage ||
            "No servers were returned from the Pelican panel for the current account."}
        </p>
      </div>
    );
  }

  return <ServerGrid servers={servers} />;
}
