import { ServerGrid } from "@/components/servers/ServerGrid";
import { listPelicanServers } from "@/lib/pelican";

export default async function ServersIndexPage() {
  const servers = await listPelicanServers();

  return (
    <section className="section">
      <div className="page-header">
        <div>
          <p className="section-kicker">Pelican</p>
          <h1 className="page-title">Servers</h1>
          <p className="lead">
            Each server card exposes the live address, SFTP details, and a route
            to the full connection panel.
          </p>
        </div>
      </div>

      {servers.length > 0 ? (
        <ServerGrid servers={servers} />
      ) : (
        <div className="empty-state">
          <h2>No servers available</h2>
          <p>
            Add a Pelican API token and base URL to connect this scaffold to a
            real panel.
          </p>
        </div>
      )}
    </section>
  );
}
