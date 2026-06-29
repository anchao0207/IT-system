import { notFound } from "next/navigation";

import { updateTicket, updateTicketUpdate } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getAppData, getLocationName, getOrganizationName, getUserLabel } from "@/lib/data";
import { formatDateTime, formatTimeInput } from "@/lib/utils";
import type { TicketUpdate } from "@/types/domain";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAppData();
  const ticket = data.tickets.find((item) => item.id === Number(id));
  if (!ticket) notFound();
  const updates = data.ticketUpdates.filter((update) => update.ticketId === ticket.id);
  const equipment = data.equipment.find((item) => item.id === ticket.equipmentId);
  const admins = data.users.filter((user) => user.role === "admin" && user.active);
  const requester = getUserLabel(data, ticket.userId);

  return (
    <>
      <PageHeader title={ticket.title} description={`${getOrganizationName(data, ticket.organizationId)} - ${requester}`} />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Request</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={ticket.priority} />
                <StatusBadge value={ticket.status} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <Info label="Location" value={getLocationName(data, ticket.locationId)} />
                <Info label="Equipment" value={equipment ? `${equipment.assetTag} - ${equipment.make} ${equipment.model}` : "Not linked"} />
                <Info label="Requester" value={requester} />
                <Info label="Created" value={formatDateTime(ticket.createdAt)} />
                <Info label="Updated" value={formatDateTime(ticket.updatedAt)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Updates</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {updates.length === 0 ? <p className="text-sm text-slate-500">No updates yet.</p> : null}
              {updates.map((update) => (
                <div key={update.id} className="rounded-md border border-[var(--border)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{update.authorEmail}</span>
                    <span>{formatDateTime(update.createdAt)} - {update.visibility}</span>
                  </div>
                  {update.body ? <p className="mt-2 whitespace-pre-wrap text-sm">{update.body}</p> : null}
                  <WorkSpan update={update} />
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-blue-700">Edit update</summary>
                    <form action={updateTicketUpdate} className="mt-3 space-y-3">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input type="hidden" name="updateId" value={update.id} />
                      <Textarea name="body" defaultValue={update.body} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Work started">
                          <Input
                            type="time"
                            name="timeStart"
                            defaultValue={formatTimeInput(update.timeStart)}
                          />
                        </Field>
                        <Field label="Work ended">
                          <Input
                            type="time"
                            name="timeEnd"
                            defaultValue={formatTimeInput(update.timeEnd)}
                          />
                        </Field>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Select name="visibility" defaultValue={update.visibility}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="public">Public to client</SelectItem>
                              <SelectItem value="internal">Internal only</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">Save edit</Button>
                      </div>
                    </form>
                  </details>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Work ticket</CardTitle></CardHeader>
          <CardContent>
            <form action={updateTicket} className="space-y-4">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <Field label="Status">
                <Select name="status" defaultValue={ticket.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in progress">In progress</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Priority">
                <Select name="priority" defaultValue={ticket.priority}>
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
                <Select name="assignedAdminEmail" defaultValue={ticket.assignedAdminEmail || "__unassigned"}>
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
              <Field label="Update visibility">
                <Select name="visibility" defaultValue="public">
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="public">Public to client</SelectItem>
                      <SelectItem value="internal">Internal only</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Work started"><Input type="time" name="timeStart" /></Field>
                <Field label="Work ended"><Input type="time" name="timeEnd" /></Field>
              </div>
              <Field label="Update note"><Textarea name="body" placeholder="Add troubleshooting notes or client-facing progress." /></Field>
              <Button type="submit" className="w-full">Save update</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs font-medium uppercase text-slate-500">{label}</div><div>{value}</div></div>;
}

function WorkSpan({ update }: { update: TicketUpdate }) {
  if (!update.timeStart && !update.timeEnd) return null;

  return (
    <div className="mt-2 text-xs text-slate-500">
      Work time: {formatDateTime(update.timeStart)} - {formatDateTime(update.timeEnd)}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
