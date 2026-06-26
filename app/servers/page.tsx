import { ServersDirectory } from "@/components/servers/ServersDirectory";

export default async function ServersIndexPage() {
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

      <ServersDirectory emptyMessage="Add a Pelican API token and base URL to connect this scaffold to a real panel." />
    </section>
  );
}
