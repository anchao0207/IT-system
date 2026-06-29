import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAppData, getUserLabel, scopeDataForUser } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export default async function ClientDashboard() {
  const user = await requireRole("client");
  const scoped = scopeDataForUser(await getAppData(), user);
  const openTickets = scoped.tickets.filter(
    (ticket) => !["resolved", "closed"].includes(ticket.status),
  );

  return (
    <>
      <PageHeader
        title="Client dashboard"
        description="Submit and track service requests for your organization."
        actions={<Button asChild><Link href="/client/tickets/new">Submit ticket</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Open tickets" value={openTickets.length} detail="Currently active" />
        <StatCard title="Equipment" value={scoped.equipment.length} detail="Assets on record" />
        <StatCard title="Locations" value={scoped.locations.length} detail="Service sites" />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Recent tickets</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoped.tickets.slice(0, 8).map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link className="font-medium text-blue-700" href={`/client/tickets/${ticket.id}`}>
                      {ticket.title}
                    </Link>
                    <div className="text-xs text-slate-500">{getUserLabel(scoped, ticket.userId)}</div>
                  </TableCell>
                  <TableCell><StatusBadge value={ticket.priority} /></TableCell>
                  <TableCell><StatusBadge value={ticket.status} /></TableCell>
                  <TableCell>{formatDateTime(ticket.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
