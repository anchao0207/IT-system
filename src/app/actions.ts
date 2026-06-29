"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createRow, deleteRow, listRows, updateRow } from "@/lib/baserow";
import { getAppData } from "@/lib/data";
import { requireRole, requireUser } from "@/lib/session";
import { currentDateInAppTimeZone, localDateTimeToUtcIso } from "@/lib/utils";
import type {
  Equipment,
  AppUser,
  Location,
  Organization,
  Ticket,
  TicketUpdate,
  TimeEntry,
} from "@/types/domain";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalSelectText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value === "__unassigned" ? "" : value;
}

function numberValue(formData: FormData, key: string) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function textList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function buildLocationForms(formData: FormData) {
  const ids = textList(formData, "locationId");
  const names = textList(formData, "locationName");
  const addresses = textList(formData, "address");
  const cities = textList(formData, "city");
  const states = textList(formData, "state");
  const activeValues = textList(formData, "locationActive");

  return names
    .map((name, index) => ({
      id: Number(ids[index]),
      name,
      address: addresses[index] || "",
      city: cities[index] || "",
      state: states[index] || "",
      active: activeValues[index] !== "false",
    }))
    .filter((location) => location.name);
}

function dateTimeValue(workDate: string, time: string) {
  if (!workDate || !time) return "";
  return localDateTimeToUtcIso(workDate, time);
}

function optionalTodayTimeValue(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;

  return dateTimeValue(currentDateInAppTimeZone(), value) || null;
}

function optionalDateValue(formData: FormData, key: string) {
  return text(formData, key) || undefined;
}

async function assertLocationBelongsToOrganization(locationId: number | undefined, organizationId: number) {
  if (!locationId) return;

  const locations = await listRows<Location>("locations", {
    filters: [{ field: "organizationId", type: "link_row_has", value: organizationId }],
  });

  if (!locations.some((location) => location.id === locationId)) {
    throw new Error("Selected location does not belong to the selected organization.");
  }
}

async function assertLocationsBelongToOrganization(locationIds: number[], organizationId: number) {
  if (locationIds.length === 0) return;

  const locations = await listRows<Location>("locations", {
    filters: [{ field: "organizationId", type: "link_row_has", value: organizationId }],
  });
  const organizationLocationIds = new Set(locations.map((location) => location.id));

  if (locationIds.some((locationId) => !organizationLocationIds.has(locationId))) {
    throw new Error("One or more locations do not belong to the selected organization.");
  }
}

export async function createEquipment(formData: FormData) {
  await requireRole("admin");

  const organizationId = numberValue(formData, "organizationId");
  const locationId = numberValue(formData, "locationId");

  if (!organizationId) throw new Error("Equipment organization is required.");

  await assertLocationBelongsToOrganization(locationId, organizationId);

  await createRow<Equipment>("equipment", {
    organizationId,
    locationId,
    assetTag: text(formData, "assetTag"),
    deviceType: text(formData, "deviceType"),
    make: text(formData, "make"),
    model: text(formData, "model"),
    serial: text(formData, "serial"),
    purchaseDate: optionalDateValue(formData, "purchaseDate"),
    warrantyDate: optionalDateValue(formData, "warrantyDate"),
    status: text(formData, "status") || "active",
    ownership: text(formData, "ownership") || "client",
    specs: text(formData, "specs"),
    notes: text(formData, "notes"),
  });

  revalidatePath("/admin/equipment");
  redirect("/admin/equipment");
}

export async function updateEquipment(formData: FormData) {
  await requireRole("admin");

  const equipmentId = numberValue(formData, "equipmentId");
  const organizationId = numberValue(formData, "organizationId");
  const locationId = numberValue(formData, "locationId");

  if (!equipmentId) throw new Error("Equipment ID is required.");
  if (!organizationId) throw new Error("Equipment organization is required.");

  await assertLocationBelongsToOrganization(locationId, organizationId);

  await updateRow<Equipment>("equipment", equipmentId, {
    organizationId,
    locationId,
    assetTag: text(formData, "assetTag"),
    deviceType: text(formData, "deviceType"),
    make: text(formData, "make"),
    model: text(formData, "model"),
    serial: text(formData, "serial"),
    purchaseDate: optionalDateValue(formData, "purchaseDate"),
    warrantyDate: optionalDateValue(formData, "warrantyDate"),
    status: text(formData, "status") || "active",
    ownership: text(formData, "ownership") || "client",
    specs: text(formData, "specs"),
    notes: text(formData, "notes"),
  });

  revalidatePath("/admin/equipment");
  revalidatePath(`/admin/equipment/${equipmentId}`);
  redirect("/admin/equipment");
}

export async function createClient(formData: FormData) {
  await requireRole("admin");

  const name = text(formData, "name");
  const locationForms = buildLocationForms(formData);

  if (!name) throw new Error("Client name is required.");
  if (locationForms.length === 0) throw new Error("At least one location is required.");

  const organization = await createRow<Organization>("organizations", {
    name,
    type: "client",
    domain: text(formData, "domain"),
    primaryContact: text(formData, "primaryContact"),
    active: true,
  });

  await Promise.all(
    locationForms.map((location) =>
      createRow<Location>("locations", {
        organizationId: organization.id,
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        active: location.active,
      }),
    ),
  );

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${organization.id}`);
}

export async function approveUser(formData: FormData) {
  await requireRole("admin");

  const userId = numberValue(formData, "userId");
  if (!userId) throw new Error("User ID is required.");

  await updateRow<AppUser>("users", userId, {
    active: true,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function denyUser(formData: FormData) {
  await requireRole("admin");

  const userId = numberValue(formData, "userId");
  if (!userId) throw new Error("User ID is required.");

  await deleteRow("users", userId);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function updateClient(formData: FormData) {
  await requireRole("admin");

  const organizationId = numberValue(formData, "organizationId");
  if (!organizationId) throw new Error("Client organization ID is required.");

  const name = text(formData, "name");
  const locationForms = buildLocationForms(formData);
  if (!name) throw new Error("Client name is required.");
  if (locationForms.length === 0) throw new Error("At least one location is required.");

  await assertLocationsBelongToOrganization(
    locationForms
      .map((location) => location.id)
      .filter((id) => Number.isFinite(id) && id > 0),
    organizationId,
  );

  await updateRow<Organization>("organizations", organizationId, {
    name,
    type: "client",
    domain: text(formData, "domain"),
    primaryContact: text(formData, "primaryContact"),
    active: text(formData, "active") === "true",
  });

  await Promise.all(
    locationForms.map((location) => {
      const locationValues = {
        organizationId,
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        active: location.active,
      };

      return Number.isFinite(location.id) && location.id > 0
        ? updateRow<Location>("locations", location.id, locationValues)
        : createRow<Location>("locations", locationValues);
    }),
  );

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${organizationId}`);
  redirect(`/admin/clients/${organizationId}`);
}

export async function createTicket(formData: FormData) {
  const user = await requireUser();
  const organizationId =
    user.role === "admin"
      ? numberValue(formData, "organizationId")
      : user.organizationId;

  if (!organizationId) throw new Error("Ticket organization is required.");

  const assignedAdminEmail = user.role === "admin" ? optionalSelectText(formData, "assignedAdminEmail") : "";
  const locationId = numberValue(formData, "locationId");

  await assertLocationBelongsToOrganization(locationId, organizationId);

  await createRow<Ticket>("tickets", {
    organizationId,
    userId: user.id,
    equipmentId: numberValue(formData, "equipmentId"),
    locationId,
    title: text(formData, "title"),
    description: text(formData, "description"),
    priority: text(formData, "priority") || "normal",
    status: assignedAdminEmail ? "assigned" : "new",
    assignedAdminEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(user.role === "admin" ? "/admin/tickets" : "/client/tickets");
  redirect(user.role === "admin" ? "/admin/tickets" : "/client/tickets");
}

export async function updateTicket(formData: FormData) {
  const user = await requireRole("admin");
  const ticketId = numberValue(formData, "ticketId");
  if (!ticketId) throw new Error("Ticket ID is required.");

  await updateRow<Ticket>("tickets", ticketId, {
    status: text(formData, "status"),
    priority: text(formData, "priority"),
    assignedAdminEmail: optionalSelectText(formData, "assignedAdminEmail"),
    updatedAt: new Date().toISOString(),
  });

  const body = text(formData, "body");
  const timeStart = optionalTodayTimeValue(formData, "timeStart");
  const timeEnd = optionalTodayTimeValue(formData, "timeEnd");
  if (body || timeStart || timeEnd) {
    await createRow<TicketUpdate>("ticketUpdates", {
      ticketId,
      authorEmail: user.email,
      body,
      visibility: text(formData, "visibility") || "public",
      timeStart,
      timeEnd,
      createdAt: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  redirect(`/admin/tickets/${ticketId}`);
}

export async function updateTicketUpdate(formData: FormData) {
  await requireRole("admin");
  const updateId = numberValue(formData, "updateId");
  const ticketId = numberValue(formData, "ticketId");
  if (!updateId) throw new Error("Ticket update ID is required.");
  if (!ticketId) throw new Error("Ticket ID is required.");

  await updateRow<TicketUpdate>("ticketUpdates", updateId, {
    body: text(formData, "body"),
    visibility: text(formData, "visibility") || "public",
    timeStart: optionalTodayTimeValue(formData, "timeStart"),
    timeEnd: optionalTodayTimeValue(formData, "timeEnd"),
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  redirect(`/admin/tickets/${ticketId}`);
}

export async function createTimeEntry(formData: FormData) {
  const user = await requireRole("admin");

  console.log("Timeclock raw form data:", Object.fromEntries(formData.entries()));

  const workDate = text(formData, "workDate");
  const timeIn = dateTimeValue(workDate, text(formData, "timeIn"));
  const timeOut = dateTimeValue(workDate, text(formData, "timeOut"));

  console.log("Timeclock normalized form data:", {
    workDate,
    timeIn,
    timeOut,
    lunchMinutes: Number(text(formData, "lunchMinutes") || 0),
    mileage: Number(text(formData, "mileage") || 0),
    notes: text(formData, "notes"),
  });

  await createRow<TimeEntry>("timeEntries", {
    adminEmail: user.email,
    workDate,
    timeIn,
    timeOut,
    lunchMinutes: Number(text(formData, "lunchMinutes") || 0),
    mileage: Number(text(formData, "mileage") || 0),
    notes: text(formData, "notes"),
  });

  revalidatePath("/admin/timeclock");
  redirect("/admin/timeclock");
}

export async function assertClientTicketAccess(ticketId: number) {
  const user = await requireUser();
  if (user.role === "admin") return;
  const data = await getAppData();
  const ticket = data.tickets.find((item) => item.id === ticketId);
  if (!ticket || ticket.organizationId !== user.organizationId) redirect("/client/tickets");
}
