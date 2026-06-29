"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { createEquipment, updateEquipment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Equipment, Location, Organization } from "@/types/domain";

type EquipmentFormProps = {
  equipment?: Equipment;
  organizations: Organization[];
  locations: Location[];
};

const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function inputDateValue(date?: Date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromInputValue(value?: string) {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
}

export function EquipmentForm({ equipment, organizations, locations }: EquipmentFormProps) {
  function firstLocationIdForOrganization(nextOrganizationId: string) {
    return String(
      locations.find((location) => String(location.organizationId) === nextOrganizationId)?.id || "",
    );
  }

  const initialOrganizationId = equipment?.organizationId ? String(equipment.organizationId) : "";

  const [organizationId, setOrganizationId] = useState(
    initialOrganizationId,
  );
  const [locationId, setLocationId] = useState(
    equipment?.locationId ? String(equipment.locationId) : firstLocationIdForOrganization(initialOrganizationId),
  );

  const organizationLocations = useMemo(
    () => locations.filter((location) => String(location.organizationId) === organizationId),
    [locations, organizationId],
  );

  const selectedLocationId = organizationLocations.some(
    (location) => String(location.id) === locationId,
  )
    ? locationId
    : organizationLocations[0]
      ? String(organizationLocations[0].id)
      : "";

  return (
    <form action={equipment ? updateEquipment : createEquipment} className="grid gap-4 md:grid-cols-2">
      {equipment ? <input type="hidden" name="equipmentId" value={equipment.id} /> : null}
      <Field label="Asset tag"><Input name="assetTag" defaultValue={equipment?.assetTag} required /></Field>
      <Field label="Device type">
        <Input
          name="deviceType"
          defaultValue={equipment?.deviceType}
          placeholder="Laptop, server, firewall"
          required
        />
      </Field>
      <Field label="Organization">
        <Select
          name="organizationId"
          required
          value={organizationId}
          onValueChange={(value) => {
            setOrganizationId(value);
            setLocationId(firstLocationIdForOrganization(value));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Location">
        <Select
          value={selectedLocationId}
          onValueChange={setLocationId}
          disabled={!organizationId || organizationLocations.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={organizationId ? "No locations available" : "Select organization first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {organizationLocations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>{location.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <input type="hidden" name="locationId" value={selectedLocationId} />
      </Field>
      <Field label="Make"><Input name="make" defaultValue={equipment?.make} /></Field>
      <Field label="Model"><Input name="model" defaultValue={equipment?.model} /></Field>
      <Field label="Serial"><Input name="serial" defaultValue={equipment?.serial} /></Field>
      <Field label="Ownership">
        <Select name="ownership" defaultValue={equipment?.ownership || "client"}>
          <SelectTrigger>
            <SelectValue placeholder="Select ownership" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <DatePickerField label="Purchase date" name="purchaseDate" initialValue={equipment?.purchaseDate} required />
      <DatePickerField label="Warranty date" name="warrantyDate" initialValue={equipment?.warrantyDate} />
      <Field label="Status">
        <Select name="status" defaultValue={equipment?.status || "active"}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in repair">In repair</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2"><Field label="Flexible specs"><Textarea name="specs" defaultValue={equipment?.specs} /></Field></div>
      <div className="md:col-span-2"><Field label="Notes"><Textarea name="notes" defaultValue={equipment?.notes} /></Field></div>
      <div className="md:col-span-2"><Button type="submit">{equipment ? "Update equipment" : "Save equipment"}</Button></div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function DatePickerField({
  initialValue,
  label,
  name,
  required,
}: {
  initialValue?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(() => dateFromInputValue(initialValue));

  return (
    <Field label={label}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-between font-normal"
          >
            {date ? displayDateFormatter.format(date) : "Select date"}
            <ChevronDownIcon className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <input className="sr-only" name={name} value={inputDateValue(date)} readOnly required={required} />
    </Field>
  );
}
