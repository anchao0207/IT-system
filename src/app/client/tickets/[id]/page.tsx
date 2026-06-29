import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData, getLocationName, getUserLabel, scopeDataForUser } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";
import type { TicketUpdate } from "@/types/domain";

export default async function ClientTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("client");
  const data = scopeDataForUser(await getAppData(), user);
  const { id } = await params;
  const ticket = data.tickets.find((item) => item.id === Number(id));
  if (!ticket) notFound();
  const updates = data.ticketUpdates.filter((update) => update.ticketId === ticket.id);
  const equipment = data.equipment.find((item) => item.id === ticket.equipmentId);
  const requester = getUserLabel(data, ticket.userId);

  return (
    <>
      <PageHeader title={ticket.title} description={`Ticket #${ticket.id} · ${ticket.status}`} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
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
              <Info label="Equipment" value={equipment ? `${equipment.assetTag} · ${equipment.make} ${equipment.model}` : "Not linked"} />
              <Info label="Requester" value={requester} />
              <Info label="Created" value={formatDateTime(ticket.createdAt)} />
              <Info label="Updated" value={formatDateTime(ticket.updatedAt)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Public updates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {updates.length === 0 ? <p className="text-sm text-slate-500">No public updates yet.</p> : null}
            {updates.map((update) => (
              <div key={update.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="text-xs text-slate-500">{formatDateTime(update.createdAt)}</div>
                {update.body ? <p className="mt-2 whitespace-pre-wrap text-sm">{update.body}</p> : null}
                <WorkSpan update={update} />
              </div>
            ))}
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
