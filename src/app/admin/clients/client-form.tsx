"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
import type { Location, Organization } from "@/types/domain";

type ClientFormAction = (formData: FormData) => void | Promise<void>;

type LocationFormRow = {
  rowKey: string;
  id?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  active: boolean;
};

type ClientFormProps = {
  action: ClientFormAction;
  client?: Organization;
  locations?: Location[];
  submitLabel: string;
};

function blankLocation(): LocationFormRow {
  return {
    rowKey: crypto.randomUUID(),
    name: "",
    address: "",
    city: "",
    state: "",
    active: true,
  };
}

export function ClientForm({
  action,
  client,
  locations = [],
  submitLabel,
}: ClientFormProps) {
  const [locationRows, setLocationRows] = useState<LocationFormRow[]>(
    locations.length > 0
      ? locations.map((location) => ({
          rowKey: String(location.id),
          id: location.id,
          name: location.name,
          address: location.address || "",
          city: location.city || "",
          state: location.state || "",
          active: location.active,
        }))
      : [blankLocation()],
  );

  function addLocation() {
    setLocationRows((currentRows) => [...currentRows, blankLocation()]);
  }

  function removeLocation(rowKey: string) {
    setLocationRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows.filter((location) => location.rowKey !== rowKey),
    );
  }

  return (
    <form action={action} className="space-y-5">
      {client ? <input type="hidden" name="organizationId" value={client.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Client name">
          <Input name="name" defaultValue={client?.name} required />
        </Field>
        <Field label="Domain">
          <Input name="domain" defaultValue={client?.domain} placeholder="client.com" />
        </Field>
        <Field label="Primary contact">
          <Input name="primaryContact" defaultValue={client?.primaryContact} />
        </Field>
        {client ? (
          <Field label="Client status">
            <Select name="active" defaultValue={client.active ? "true" : "false"}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <div className="hidden md:block" />
        )}
      </section>

      <section className="space-y-4 border-t border-[var(--border)] pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Locations</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addLocation}>
            <Plus className="h-4 w-4" />
            Add location
          </Button>
        </div>

        <div className="space-y-4">
          {locationRows.map((location, index) => (
            <div
              key={location.rowKey}
              className="grid gap-3 border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0 md:grid-cols-2"
            >
              <input type="hidden" name="locationId" value={location.id || ""} />
              <Field label={`Location ${index + 1}`}>
                <Input name="locationName" defaultValue={location.name} required />
              </Field>
              <Field label="Address">
                <Input name="address" defaultValue={location.address} />
              </Field>
              <Field label="City">
                <Input name="city" defaultValue={location.city} />
              </Field>
              <Field label="State">
                <Input name="state" defaultValue={location.state} />
              </Field>
              <Field label="Location status">
                <Select name="locationActive" defaultValue={location.active ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-end md:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove location"
                  disabled={locationRows.length === 1 || Boolean(location.id)}
                  onClick={() => removeLocation(location.rowKey)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Button type="submit" className="w-full md:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
