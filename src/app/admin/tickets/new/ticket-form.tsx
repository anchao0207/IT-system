"use client";

import { useMemo, useState } from "react";

import { createTicket } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppUser, Equipment, Location, Organization } from "@/types/domain";

type AdminTicketFormProps = {
  admins: AppUser[];
  equipment: Equipment[];
  locations: Location[];
  organizations: Organization[];
};

export function AdminTicketForm({
  admins,
  equipment,
  locations,
  organizations,
}: AdminTicketFormProps) {
  const [organizationId, setOrganizationId] = useState("");
  const [locationId, setLocationId] = useState("__unassigned");

  const organizationLocations = useMemo(
    () => locations.filter((location) => String(location.organizationId) === organizationId),
    [locations, organizationId],
  );

  return (
    <form action={createTicket} className="grid gap-4 md:grid-cols-2">
      <Field label="Organization">
        <Select
          name="organizationId"
          required
          value={organizationId}
          onValueChange={(value) => {
            setOrganizationId(value);
            setLocationId("__unassigned");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {organizations.filter((org) => org.type === "client").map((org) => (
                <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Priority">
        <Select name="priority" defaultValue="normal">
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Assigned admin">
        <Select name="assignedAdminEmail">
          <SelectTrigger>
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__unassigned">Unassigned</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.email}>{admin.displayName}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Equipment">
        <Select name="equipmentId">
          <SelectTrigger>
            <SelectValue placeholder="No equipment linked" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__unassigned">No equipment linked</SelectItem>
              {equipment.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.assetTag} - {item.make} {item.model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Location">
        <Select
          name="locationId"
          value={locationId}
          onValueChange={setLocationId}
          disabled={!organizationId}
        >
          <SelectTrigger>
            <SelectValue placeholder={organizationId ? "No location linked" : "Select organization first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__unassigned">No location linked</SelectItem>
              {organizationLocations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>{location.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2"><Field label="Title"><Input name="title" required /></Field></div>
      <div className="md:col-span-2"><Field label="Description"><Textarea name="description" required /></Field></div>
      <div className="md:col-span-2"><Button type="submit">Create ticket</Button></div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
