import { siteConfig } from "@/lib/site";
type UnknownRecord = Record<string, unknown>;

export interface PelicanAllocation {
  ip: string;
  port: number;
  alias?: string | null;
  default?: boolean;
}

export interface PelicanConnectionDetails {
  address: string | null;
  ip: string | null;
  port: number | null;
  alias: string | null;
  sftpHost: string | null;
  sftpPort: number | null;
  sftpUsername: string | null;
  panelUrl: string;
}

export interface PelicanServer {
  id: string;
  identifier: string;
  uuid: string | null;
  name: string;
  description: string;
  status: string;
  isOnline: boolean;
  nodeName: string;
  allocation: PelicanAllocation | null;
  connection: PelicanConnectionDetails;
  limits: {
    memory: number | null;
    disk: number | null;
    cpu: number | null;
  };
}

const blockedServerTerms = ["privvy", "godsclan", "private", "archive sftp", "pelican db host", "deusfam"];
const blockedNameTerms = ["training"];
const vortexTerms = ["vortexserver", "vortexservers", "vortex servers", "vortex"];

const demoServers: PelicanServer[] = [
  {
    id: "demo-1",
    identifier: "alpha-minecraft",
    uuid: "11111111-1111-1111-1111-111111111111",
    name: "Alpha Minecraft",
    description: "Vanilla plus a curated mod pack for community nights.",
    status: "running",
    isOnline: true,
    nodeName: "eu-west-1",
    allocation: {
      ip: "play.vortexservers.local",
      port: 25565,
      alias: "play.vortexservers.local",
      default: true,
    },
    connection: {
      address: "play.vortexservers.local:25565",
      ip: "play.vortexservers.local",
      port: 25565,
      alias: "play.vortexservers.local",
      sftpHost: "sftp.vortexservers.local",
      sftpPort: 2022,
      sftpUsername: "alpha-minecraft",
      panelUrl: siteConfig.panelUrl,
    },
    limits: {
      memory: 6144,
      disk: 50000,
      cpu: 300,
    },
  },
  {
    id: "demo-2",
    identifier: "rust-outpost",
    uuid: "22222222-2222-2222-2222-222222222222",
    name: "Rust Outpost",
    description: "PvP survival with whitelisted groups and weekly wipes.",
    status: "starting",
    isOnline: false,
    nodeName: "eu-west-2",
    allocation: {
      ip: "rust.vortexservers.local",
      port: 28015,
      alias: "rust.vortexservers.local",
      default: true,
    },
    connection: {
      address: "rust.vortexservers.local:28015",
      ip: "rust.vortexservers.local",
      port: 28015,
      alias: "rust.vortexservers.local",
      sftpHost: "sftp.vortexservers.local",
      sftpPort: 2022,
      sftpUsername: "rust-outpost",
      panelUrl: siteConfig.panelUrl,
    },
    limits: {
      memory: 8192,
      disk: 60000,
      cpu: 400,
    },
  },
];

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function toNumberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function pickRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function getNestedRecord(record: UnknownRecord, key: string) {
  return pickRecord(record[key]);
}

function getNestedValue(record: UnknownRecord, path: string[]) {
  let current: unknown = record;

  for (const segment of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as UnknownRecord)[segment];
  }

  return current;
}

function formatPublicHost(value: string | null | undefined) {
  if (!value || value === "0.0.0.0") {
    return "vortexservers.co.uk";
  }

  return value;
}

function lowerText(value: unknown) {
  return toStringValue(value).toLowerCase();
}

function serverSearchText(server: PelicanServer) {
  return [
    server.name,
    server.identifier,
    server.description,
    server.nodeName,
    server.connection.ip,
    server.connection.alias,
    server.connection.sftpHost,
  ]
    .map((value) => lowerText(value))
    .join(" ");
}

function isVisibleServer(server: PelicanServer) {
  const text = serverSearchText(server);

  if (blockedServerTerms.some((term) => text.includes(term))) {
    return false;
  }

  const name = server.name.toLowerCase();

  if (blockedNameTerms.some((term) => name.includes(term))) {
    return false;
  }

  return vortexTerms.some((term) => text.includes(term));
}

function isServerOnline(status: string) {
  return ["online", "running"].includes(status.toLowerCase());
}

function pickAllocations(record: UnknownRecord, attributes: UnknownRecord) {
  const candidates = [
    getNestedValue(attributes, ["relationships", "allocations", "data"]),
    attributes.allocations,
    getNestedValue(record, ["relationships", "allocations", "data"]),
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate
        .map((item) => pickRecord(item))
        .filter(Boolean)
        .map((item) => {
          const source = item as UnknownRecord;
          const sourceAttributes = getNestedRecord(source, "attributes") ?? source;

          return {
            ip: toStringValue(sourceAttributes.ip ?? sourceAttributes.address),
            port: toNumberValue(sourceAttributes.port ?? sourceAttributes.port_number) ?? 0,
            alias: toStringValue(sourceAttributes.alias, "") || null,
            default: Boolean(sourceAttributes.default ?? sourceAttributes.is_default),
          } satisfies PelicanAllocation;
        })
        .filter((allocation) => allocation.ip !== "" && allocation.port !== 0);
    }
  }

  return [] as PelicanAllocation[];
}

function pickPrimaryAllocation(record: UnknownRecord, attributes: UnknownRecord) {
  const allocations = pickAllocations(record, attributes);

  return allocations.find((allocation) => allocation.default) ?? allocations[0] ?? null;
}

function normaliseServer(record: unknown): PelicanServer {
  const raw = pickRecord(record) ?? ({} as UnknownRecord);
  const attributes = getNestedRecord(raw, "attributes") ?? raw;
  const allocation = pickPrimaryAllocation(raw, attributes);
  const sftpDetails =
    getNestedRecord(attributes, "sftp_details") ?? getNestedRecord(attributes, "sftp") ?? ({} as UnknownRecord);
  const limits = getNestedRecord(attributes, "limits") ?? ({} as UnknownRecord);
  const panelUrl = siteConfig.panelUrl;

  const identifier = toStringValue(
    attributes.identifier ?? attributes.uuid_short ?? raw.identifier ?? raw.uuid,
    "demo-server",
  );

  const ip = formatPublicHost(allocation?.alias ?? allocation?.ip ?? toStringValue(attributes.ip ?? attributes.host, ""));
  const port = allocation?.port ?? toNumberValue(attributes.port ?? attributes.port_number);
  const sftpHost = formatPublicHost(toStringValue(sftpDetails.ip ?? sftpDetails.host ?? ip, "")) || null;
  const sftpPort = toNumberValue(sftpDetails.port ?? sftpDetails.port_number) ?? null;
  const sftpUsername = toStringValue(sftpDetails.username ?? attributes.sftp_username ?? identifier, "") || null;

  return {
    id: toStringValue(raw.id ?? attributes.id ?? identifier, identifier),
    identifier,
    uuid: toStringValue(raw.uuid ?? attributes.uuid ?? null, "") || null,
    name: toStringValue(attributes.name ?? attributes.server_name ?? identifier, identifier),
    description: toStringValue(attributes.description ?? "", ""),
    status: toStringValue(attributes.status ?? attributes.state ?? "unknown", "unknown"),
    isOnline: isServerOnline(toStringValue(attributes.status ?? attributes.state ?? "unknown", "unknown")),
    nodeName: toStringValue(
      getNestedValue(attributes, ["node", "name"]) ?? attributes.node_name ?? attributes.node ?? "",
      "",
    ),
    allocation,
    connection: {
      address: ip && port ? `${ip}:${port}` : null,
      ip: ip || null,
      port: port ?? null,
      alias: allocation?.alias ?? null,
      sftpHost,
      sftpPort,
      sftpUsername,
      panelUrl,
    },
    limits: {
      memory: toNumberValue(limits.memory ?? attributes.memory),
      disk: toNumberValue(limits.disk ?? attributes.disk),
      cpu: toNumberValue(limits.cpu ?? attributes.cpu),
    },
  };
}

function getApiBase() {
  const toClientBase = (value: string) => {
    const trimmed = value.replace(/\/$/, "");

    if (trimmed.endsWith("/api/client")) {
      return trimmed;
    }

    if (trimmed.endsWith("/api/application")) {
      return trimmed.replace(/\/api\/application$/, "/api/client");
    }

    return `${trimmed}/api/client`;
  };

  const explicitBase = process.env.PELICAN_API_BASE_URL;

  if (explicitBase) {
    return toClientBase(explicitBase);
  }

  const panelUrl = process.env.NEXT_PUBLIC_PELICAN_PANEL_URL ?? siteConfig.panelUrl;

  return toClientBase(panelUrl);
}

function hasPelicanConfig() {
  return Boolean(
    process.env.PELICAN_CLIENT_API_TOKEN &&
      (process.env.PELICAN_API_BASE_URL || process.env.NEXT_PUBLIC_PELICAN_PANEL_URL),
  );
}

function getClientToken() {
  const token = process.env.PELICAN_CLIENT_API_TOKEN?.trim();

  if (!token) {
    return null;
  }

  if (token.length <= 16) {
    throw new Error(
      "PELICAN_CLIENT_API_TOKEN looks like an API key identifier, not the full secret token. Copy the secret_token value returned when the key is created in Pelican.",
    );
  }

  return token;
}

async function fetchPelicanJSON(path: string) {
  const base = getApiBase();
  const url = new URL(path.replace(/^\//, ""), `${base}/`);
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const token = getClientToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Pelican API request failed: ${response.status} ${response.statusText} (${url.toString()})`);
  }

  return response.json() as Promise<unknown>;
}

function extractList(payload: unknown) {
  const record = pickRecord(payload);

  if (!record) return [] as unknown[];

  const data = record.data;
  const nestedData = pickRecord(data)?.data;
  const candidates = [data, nestedData, record.servers, record.items, payload];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [] as unknown[];
}

function extractSingle(payload: unknown) {
  const record = pickRecord(payload);

  if (!record) return null;

  return record.data ?? payload;
}

export async function listPelicanServers() {
  try {
    const payload = await fetchPelicanJSON("?per_page=100");
    const servers = extractList(payload).map(normaliseServer).filter(isVisibleServer);

    return servers;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Pelican API error";

    if (!hasPelicanConfig() && process.env.NODE_ENV !== "production") {
      return demoServers;
    }

    throw new Error(`Failed to load servers from Pelican: ${message}`);
  }
}

export async function getPelicanServer(identifier: string) {
  try {
    const payload = await fetchPelicanJSON(`servers/${identifier}`);
    const server = normaliseServer(extractSingle(payload));

    if (!isVisibleServer(server)) {
      return null;
    }

    return server;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Pelican API error";

    if (!hasPelicanConfig() && process.env.NODE_ENV !== "production") {
      return demoServers.find((server) => server.identifier === identifier || server.id === identifier) ?? null;
    }

    throw new Error(`Failed to load server from Pelican: ${message}`);
  }
}
