import "server-only";

import { createRow, listRows, updateRow } from "@/lib/baserow";
import type {
  AppData,
  AppUser,
  Equipment,
  Location,
  Organization,
  Ticket,
  TicketUpdate,
  TimeEntry,
} from "@/types/domain";

export async function getAppData(): Promise<AppData> {
  const [
    organizations,
    locations,
    users,
    equipment,
    tickets,
    ticketUpdates,
    timeEntries,
  ] = await Promise.all([
    listRows<Organization>("organizations"),
    listRows<Location>("locations"),
    listRows<AppUser>("users"),
    listRows<Equipment>("equipment"),
    listRows<Ticket>("tickets"),
    listRows<TicketUpdate>("ticketUpdates"),
    listRows<TimeEntry>("timeEntries"),
  ]);

  return {
    organizations,
    locations,
    users,
    equipment,
    tickets,
    ticketUpdates,
    timeEntries,
  };
}

export async function getTimeEntriesForAdmin(adminEmail: string): Promise<TimeEntry[]> {
  const entries = await listRows<TimeEntry>("timeEntries", {
    filters: [{ field: "adminEmail", type: "equal", value: adminEmail }],
    orderBy: ["-workDate", "-timeIn"],
  });

  return entries
    .map((entry) => ({
      ...entry,
      total: formatDurationSecondsAsHours(entry.total),
    }))
    .sort((first, second) => {
      const firstDate = `${first.workDate || ""}T${first.timeIn || ""}`;
      const secondDate = `${second.workDate || ""}T${second.timeIn || ""}`;
      return secondDate.localeCompare(firstDate) || second.id - first.id;
    });
}

function formatDurationSecondsAsHours(value?: string | number) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return undefined;
  return `${(seconds / 3600).toFixed(1)} hrs`;
}

export async function getClientsListData() {
  const [clients, locations] = await Promise.all([
    listRows<Organization>("organizations", {
      filters: [{ field: "type", type: "single_select_equal", value: "client" }],
      orderBy: ["name"],
    }),
    listRows<Location>("locations", { orderBy: ["name"] }),
  ]);

  return { clients, locations };
}

export async function getAdminEquipmentListData() {
  const [equipment, organizations, locations] = await Promise.all([
    listRows<Equipment>("equipment", { orderBy: ["assetTag"] }),
    listRows<Organization>("organizations", { orderBy: ["name"] }),
    listRows<Location>("locations", { orderBy: ["name"] }),
  ]);

  return { equipment, organizations, locations };
}

export async function getAdminTicketsListData() {
  const [tickets, organizations, users] = await Promise.all([
    listRows<Ticket>("tickets", { orderBy: ["-updatedAt"] }),
    listRows<Organization>("organizations", { orderBy: ["name"] }),
    listRows<AppUser>("users", { orderBy: ["displayName"] }),
  ]);

  return { tickets, organizations, users };
}

export async function getUsersListData() {
  const [users, organizations] = await Promise.all([
    listRows<AppUser>("users", { orderBy: ["displayName"] }),
    listRows<Organization>("organizations", { orderBy: ["name"] }),
  ]);

  return { users, organizations };
}

export async function getClientEquipmentListData(organizationId?: number) {
  if (!organizationId) return { equipment: [], locations: [] };

  const [equipment, locations] = await Promise.all([
    listRows<Equipment>("equipment", {
      filters: [{ field: "organizationId", type: "link_row_has", value: organizationId }],
      orderBy: ["assetTag"],
    }),
    listRows<Location>("locations", {
      filters: [{ field: "organizationId", type: "link_row_has", value: organizationId }],
      orderBy: ["name"],
    }),
  ]);

  return { equipment, locations };
}

export async function getClientTicketsListData(organizationId?: number) {
  if (!organizationId) return [];

  return listRows<Ticket>("tickets", {
    filters: [{ field: "organizationId", type: "link_row_has", value: organizationId }],
    orderBy: ["-updatedAt"],
  });
}

function identityMatches(user: AppUser, email?: string | null, subject?: string | null) {
  return (
    (email && user.email.toLowerCase() === email.toLowerCase()) ||
    (subject && user.entraSubject === subject)
  );
}

function domainFromEmail(email?: string | null) {
  const domain = email?.split("@")[1]?.trim().toLowerCase();
  return domain || undefined;
}

async function findOrganizationByEmailDomain(email?: string | null) {
  const emailDomain = domainFromEmail(email);
  if (!emailDomain) return null;

  const organizations = await listRows<Organization>("organizations");
  return (
    organizations.find(
      (organization) =>
        organization.active &&
        organization.domain?.trim().toLowerCase() === emailDomain,
    ) || null
  );
}

export async function findAnyUserByIdentity(email?: string | null, subject?: string | null) {
  if (!email && !subject) return null;
  const users = await listRows<AppUser>("users");
  return users.find((user) => identityMatches(user, email, subject)) || null;
}

export async function findUserByIdentity(email?: string | null, subject?: string | null) {
  if (!email && !subject) return null;
  const users = await listRows<AppUser>("users");
  return users.find((user) => user.active && identityMatches(user, email, subject)) || null;
}

export async function ensurePendingUserByIdentity({
  email,
  displayName,
  entraSubject,
}: {
  email?: string | null;
  displayName?: string | null;
  entraSubject?: string | null;
}) {
  if (!email && !entraSubject) return null;

  const [existing, organization] = await Promise.all([
    findAnyUserByIdentity(email, entraSubject),
    findOrganizationByEmailDomain(email),
  ]);

  if (existing) {
    const updates: Partial<AppUser> = {};
    if (email && existing.email !== email) updates.email = email;
    if (displayName && existing.displayName !== displayName) updates.displayName = displayName;
    if (entraSubject && existing.entraSubject !== entraSubject) {
      updates.entraSubject = entraSubject;
    }
    if (organization && existing.organizationId !== organization.id) {
      updates.organizationId = organization.id;
    }

    if (Object.keys(updates).length === 0) return existing;
    return updateRow<AppUser>("users", existing.id, updates);
  }

  return createRow<AppUser>("users", {
    entraSubject,
    email: email || "",
    displayName: displayName || email || "Pending user",
    role: "client",
    organizationId: organization?.id,
    active: false,
  });
}

export function scopeDataForUser(data: AppData, user: AppUser): AppData {
  if (user.role === "admin") return data;

  const organizationId = user.organizationId;
  return {
    organizations: data.organizations.filter((org) => org.id === organizationId),
    locations: data.locations.filter((location) => location.organizationId === organizationId),
    users: data.users.filter((appUser) => appUser.organizationId === organizationId),
    equipment: data.equipment.filter((item) => item.organizationId === organizationId),
    tickets: data.tickets.filter((ticket) => ticket.organizationId === organizationId),
    ticketUpdates: data.ticketUpdates.filter((update) =>
      data.tickets.some(
        (ticket) =>
          ticket.id === update.ticketId &&
          ticket.organizationId === organizationId &&
          update.visibility === "public",
      ),
    ),
    timeEntries: [],
  };
}

export function getOrganizationName(data: Pick<AppData, "organizations">, id?: number) {
  return data.organizations.find((org) => org.id === id)?.name || "Unassigned";
}

export function getLocationName(data: Pick<AppData, "locations">, id?: number) {
  return data.locations.find((location) => location.id === id)?.name || "Unassigned";
}

export function getUserLabel(data: Pick<AppData, "users">, id?: number) {
  const user = data.users.find((appUser) => appUser.id === id);
  if (!user) return id ? `User #${id}` : "Unknown user";
  return user.displayName || user.email;
}

export function getUserEmail(data: Pick<AppData, "users">, id?: number) {
  const user = data.users.find((appUser) => appUser.id === id);
  return user?.email || "";
}
