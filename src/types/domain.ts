export type Role = "admin" | "client";

export type LinkedRow = {
  id: number;
  value?: string;
};

export type Organization = {
  id: number;
  name: string;
  type: "internal" | "client";
  domain?: string;
  primaryContact?: string;
  active: boolean;
  users?: LinkedRow[];
  Users?: LinkedRow[];
};

export type Location = {
  id: number;
  organizationId: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  active: boolean;
};

export type AppUser = {
  id: number;
  entraSubject?: string;
  email: string;
  displayName: string;
  role: Role;
  organizationId?: number;
  active: boolean;
};

export type Equipment = {
  id: number;
  organizationId: number;
  locationId?: number;
  assetTag: string;
  deviceType: string;
  make?: string;
  model?: string;
  serial?: string;
  purchaseDate?: string;
  warrantyDate?: string;
  status: "active" | "in repair" | "retired" | "missing";
  ownership: "company" | "client";
  specs?: string;
  notes?: string;
};

export type Ticket = {
  id: number;
  organizationId: number;
  userId: number;
  equipmentId?: number;
  locationId?: number;
  title: string;
  description: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "new" | "assigned" | "in progress" | "waiting" | "resolved" | "closed";
  assignedAdminEmail?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TicketUpdate = {
  id: number;
  ticketId: number;
  authorEmail: string;
  body: string;
  visibility: "public" | "internal";
  timeStart?: string;
  timeEnd?: string;
  createdAt?: string;
};

export type TimeEntry = {
  id: number;
  adminEmail: string;
  workDate: string;
  timeIn: string;
  timeOut?: string;
  total?: string | number;
  lunchMinutes: number;
  mileage: number;
  notes?: string;
};

export type AppData = {
  organizations: Organization[];
  locations: Location[];
  users: AppUser[];
  equipment: Equipment[];
  tickets: Ticket[];
  ticketUpdates: TicketUpdate[];
  timeEntries: TimeEntry[];
};
