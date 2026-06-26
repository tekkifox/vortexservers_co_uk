import { ServerCard } from "@/components/servers/ServerCard";
import type { PelicanServer } from "@/lib/pelican";

interface ServerGridProps {
  servers: PelicanServer[];
}

export function ServerGrid({ servers }: ServerGridProps) {
  return (
    <div className="server-grid">
      {servers.map((server) => (
        <ServerCard key={server.identifier} server={server} />
      ))}
    </div>
  );
}
