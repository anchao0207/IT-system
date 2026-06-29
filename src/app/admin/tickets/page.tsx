import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminTicketsListData, getOrganizationName, getUserLabel } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function AdminTicketsPage() {
  const data = await getAdminTicketsListData();

  return (
    <>
      <PageHeader
        title="Tickets"
        description="Assign, update, and comment on client service issues."
        actions={<Button asChild><Link href="/admin/tickets/new">New ticket</Link></Button>}
      />
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link className="font-medium text-blue-700" href={`/admin/tickets/${ticket.id}`}>
                      {ticket.title}
                    </Link>
                    <div className="text-xs text-slate-500">{getUserLabel(data, ticket.userId)}</div>
                  </TableCell>
                  <TableCell>{getOrganizationName(data, ticket.organizationId)}</TableCell>
                  <TableCell><StatusBadge value={ticket.priority} /></TableCell>
                  <TableCell><StatusBadge value={ticket.status} /></TableCell>
                  <TableCell>{ticket.assignedAdminEmail || "Unassigned"}</TableCell>
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
