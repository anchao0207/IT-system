import type {
  AppUser,
  Equipment,
  Location,
  Organization,
  Ticket,
  TicketUpdate,
  TimeEntry,
} from "@/types/domain";
import http from "node:http";
import https from "node:https";

type TableKey =
  | "organizations"
  | "locations"
  | "users"
  | "equipment"
  | "tickets"
  | "ticketUpdates"
  | "timeEntries";

type RowFilter = {
  field: string;
  type: "equal" | "link_row_has" | "single_select_equal";
  value: string | number | boolean;
};

type ListRowsOptions = {
  filters?: RowFilter[];
  orderBy?: string[];
  size?: number;
};

type BaserowListPayload = {
  next?: string | null;
  results?: Record<string, unknown>[];
};

const tableEnv: Record<TableKey, string> = {
  organizations: "BASEROW_ORGANIZATIONS_TABLE_ID",
  locations: "BASEROW_LOCATIONS_TABLE_ID",
  users: "BASEROW_USERS_TABLE_ID",
  equipment: "BASEROW_EQUIPMENT_TABLE_ID",
  tickets: "BASEROW_TICKETS_TABLE_ID",
  ticketUpdates: "BASEROW_TICKET_UPDATES_TABLE_ID",
  timeEntries: "BASEROW_TIME_ENTRIES_TABLE_ID",
};

const demoOrganizations: Organization[] = [
  {
    id: 1,
    name: "Computech",
    type: "internal",
    domain: "computech.local",
    primaryContact: "IT Admin",
    active: true,
  },
  {
    id: 2,
    name: "Northwind Dental",
    type: "client",
    domain: "northwind.example",
    primaryContact: "Morgan Lee",
    active: true,
  },
  {
    id: 3,
    name: "Pioneer Legal Group",
    type: "client",
    domain: "pioneer.example",
    primaryContact: "Avery Chen",
    active: true,
  },
];

const demoLocations: Location[] = [
  {
    id: 1,
    organizationId: 2,
    name: "Northwind Main Office",
    address: "1200 Market Street",
    city: "San Jose",
    state: "CA",
    active: true,
  },
  {
    id: 2,
    organizationId: 3,
    name: "Pioneer Downtown",
    address: "410 Mission Avenue",
    city: "Fremont",
    state: "CA",
    active: true,
  },
];

const demoUsers: AppUser[] = [
  {
    id: 1,
    email: "admin@computech.local",
    displayName: "Computech Admin",
    role: "admin",
    organizationId: 1,
    active: true,
  },
  {
    id: 2,
    email: "client@northwind.example",
    displayName: "Morgan Lee",
    role: "client",
    organizationId: 2,
    active: true,
  },
  {
    id: 3,
    email: "avery@pioneer.example",
    displayName: "Avery Chen",
    role: "client",
    organizationId: 3,
    active: true,
  },
];

const demoEquipment: Equipment[] = [
  {
    id: 1,
    organizationId: 2,
    locationId: 1,
    assetTag: "NW-LT-014",
    deviceType: "Laptop",
    make: "Dell",
    model: "Latitude 7450",
    serial: "DL7450-88A",
    purchaseDate: "2025-02-10",
    warrantyDate: "2028-02-10",
    status: "active",
    ownership: "client",
    specs: "Docking station assigned; BitLocker enabled.",
  },
  {
    id: 2,
    organizationId: 3,
    locationId: 2,
    assetTag: "PLG-SRV-002",
    deviceType: "Server",
    make: "HPE",
    model: "ProLiant ML350",
    serial: "HPEML350-42",
    purchaseDate: "2023-09-18",
    warrantyDate: "2026-09-18",
    status: "active",
    ownership: "client",
    specs: "Hosts file shares and accounting VM.",
  },
];

const demoTickets: Ticket[] = [
  {
    id: 1,
    organizationId: 2,
    userId: 2,
    equipmentId: 1,
    locationId: 1,
    title: "Laptop VPN disconnects every hour",
    description: "The VPN drops during remote charting sessions.",
    priority: "high",
    status: "in progress",
    assignedAdminEmail: "admin@computech.local",
    createdAt: "2026-06-10T17:12:00.000Z",
    updatedAt: "2026-06-11T15:20:00.000Z",
  },
  {
    id: 2,
    organizationId: 3,
    userId: 3,
    equipmentId: 2,
    locationId: 2,
    title: "Nightly backup warning",
    description: "Backup completed with warnings last night.",
    priority: "normal",
    status: "new",
    createdAt: "2026-06-11T13:04:00.000Z",
    updatedAt: "2026-06-11T13:04:00.000Z",
  },
];

const demoTicketUpdates: TicketUpdate[] = [
  {
    id: 1,
    ticketId: 1,
    authorEmail: "admin@computech.local",
    body: "Checked VPN client logs and asked user to test after profile reset.",
    visibility: "public",
    timeStart: "2026-06-11T14:45:00.000Z",
    timeEnd: "2026-06-11T15:20:00.000Z",
    createdAt: "2026-06-11T15:20:00.000Z",
  },
];

const demoTimeEntries: TimeEntry[] = [
  {
    id: 1,
    adminEmail: "admin@computech.local",
    workDate: "2026-06-11",
    timeIn: "08:30",
    timeOut: "17:00",
    lunchMinutes: 30,
    mileage: 18,
    notes: "On-site VPN troubleshooting and workstation check.",
  },
];

const demoData = {
  organizations: demoOrganizations,
  locations: demoLocations,
  users: demoUsers,
  equipment: demoEquipment,
  tickets: demoTickets,
  ticketUpdates: demoTicketUpdates,
  timeEntries: demoTimeEntries,
};

function baserowConfig(table: TableKey) {
  const baseUrl = process.env.BASEROW_URL?.replace(/\/$/, "");
  const token = process.env.BASEROW_DATABASE_TOKEN;
  const tableId = process.env[tableEnv[table]];
  if (!baseUrl || !token || !tableId) return null;
  return { baseUrl, token, tableId };
}

function normalizeValue(key: string, value: unknown): unknown {
  if (value === null) return undefined;

  if (Array.isArray(value)) {
    if (key.endsWith("Id")) {
      const linkedRow = value[0];
      if (linkedRow && typeof linkedRow === "object" && "id" in linkedRow) {
        return Number(linkedRow.id);
      }
      return undefined;
    }

    return value;
  }

  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }

  return value;
}

function normalizeRow<T>(row: Record<string, unknown>): T {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(key, value)]),
  );

  return {
    ...normalized,
    id: Number(row.id),
  } as T;
}

async function baserowRequest<T>(
  url: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    token: string;
    body?: Record<string, unknown>;
  },
): Promise<T> {
  const hostHeader = process.env.BASEROW_HOST_HEADER;
  if (!hostHeader) {
    const response = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: `Token ${options.token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Baserow request failed: ${response.status}${errorBody ? ` ${errorBody}` : ""}`,
      );
    }

    if (response.status === 204) return undefined as T;

    return (await response.json()) as T;
  }

  return new Promise<T>((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestBody = options.body ? JSON.stringify(options.body) : undefined;
    const transport = parsedUrl.protocol === "https:" ? https : http;
    const request = transport.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: options.method || "GET",
        headers: {
          Authorization: `Token ${options.token}`,
          Host: hostHeader,
          ...(requestBody
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestBody),
              }
            : {}),
        },
      },
      (response) => {
        let data = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(`Baserow request failed: ${response.statusCode}${data ? ` ${data}` : ""}`),
            );
            return;
          }

          if (!data) {
            resolve(undefined as T);
            return;
          }

          try {
            resolve(JSON.parse(data) as T);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on("error", reject);
    if (requestBody) request.write(requestBody);
    request.end();
  });
}

export function isBaserowConfigured(table: TableKey) {
  return Boolean(baserowConfig(table));
}

function applyDemoListOptions<T>(rows: T[], options?: ListRowsOptions) {
  const filteredRows = (options?.filters || []).reduce<T[]>((currentRows, filter) => {
    return currentRows.filter((row) => {
      const value = (row as Record<string, unknown>)[filter.field];
      return String(value ?? "") === String(filter.value);
    });
  }, [...rows]);

  return (options?.orderBy || []).reduceRight<T[]>((currentRows, orderBy) => {
    const descending = orderBy.startsWith("-");
    const field = descending ? orderBy.slice(1) : orderBy;

    return [...currentRows].sort((first, second) => {
      const firstValue = String((first as Record<string, unknown>)[field] ?? "");
      const secondValue = String((second as Record<string, unknown>)[field] ?? "");
      return descending
        ? secondValue.localeCompare(firstValue)
        : firstValue.localeCompare(secondValue);
    });
  }, filteredRows);
}

function listRowsUrl(baseUrl: string, tableId: string, options?: ListRowsOptions) {
  const url = new URL(`${baseUrl}/api/database/rows/table/${tableId}/`);
  url.searchParams.set("user_field_names", "true");
  url.searchParams.set("size", String(options?.size || 200));

  if (options?.orderBy?.length) {
    url.searchParams.set("order_by", options.orderBy.join(","));
  }

  for (const filter of options?.filters || []) {
    url.searchParams.set(`filter__${filter.field}__${filter.type}`, String(filter.value));
  }

  return url.toString();
}

export async function listRows<T>(table: TableKey, options?: ListRowsOptions): Promise<T[]> {
  const config = baserowConfig(table);
  if (!config) return applyDemoListOptions(demoData[table] as T[], options);

  const rows: Record<string, unknown>[] = [];
  let nextUrl: string | null = listRowsUrl(config.baseUrl, config.tableId, options);

  while (nextUrl) {
    const payload: BaserowListPayload = await baserowRequest<BaserowListPayload>(
      nextUrl,
      { token: config.token },
    ).catch((error) => {
      throw new Error(`Baserow list failed for ${table}: ${error.message}`);
    });

    rows.push(...(payload.results || []));
    nextUrl = payload.next || null;
  }

  return rows.map((row) => normalizeRow<T>(row));
}

export async function createRow<T>(
  table: TableKey,
  values: Record<string, unknown>,
): Promise<T> {
  const config = baserowConfig(table);
  if (!config) {
    return normalizeRow<T>({ id: Date.now(), ...values });
  }

  const row = await baserowRequest<Record<string, unknown>>(
    `${config.baseUrl}/api/database/rows/table/${config.tableId}/?user_field_names=true`,
    { method: "POST", token: config.token, body: values },
  ).catch((error) => {
    throw new Error(`Baserow create failed for ${table}: ${error.message}`);
  });

  return normalizeRow<T>(row);
}

export async function updateRow<T>(
  table: TableKey,
  id: number,
  values: Record<string, unknown>,
): Promise<T> {
  const config = baserowConfig(table);
  if (!config) {
    return normalizeRow<T>({ id, ...values });
  }

  const row = await baserowRequest<Record<string, unknown>>(
    `${config.baseUrl}/api/database/rows/table/${config.tableId}/${id}/?user_field_names=true`,
    { method: "PATCH", token: config.token, body: values },
  ).catch((error) => {
    throw new Error(`Baserow update failed for ${table}: ${error.message}`);
  });

  return normalizeRow<T>(row);
}

export async function deleteRow(table: TableKey, id: number): Promise<void> {
  const config = baserowConfig(table);
  if (!config) return;

  await baserowRequest<void>(
    `${config.baseUrl}/api/database/rows/table/${config.tableId}/${id}/`,
    { method: "DELETE", token: config.token },
  ).catch((error) => {
    throw new Error(`Baserow delete failed for ${table}: ${error.message}`);
  });
}
