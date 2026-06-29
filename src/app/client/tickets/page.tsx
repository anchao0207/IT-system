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
import { getClientTicketsListData } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export default async function ClientTicketsPage() {
  const user = await requireRole("client");
  const tickets = await getClientTicketsListData(user.organizationId);

  return (
    <>
      <PageHeader
        title="Tickets"
        description="Track your organization's IT service requests."
        actions={<Button asChild><Link href="/client/tickets/new">Submit ticket</Link></Button>}
      />
      <Card>
        <CardContent className="pt-5">
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
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link className="font-medium text-blue-700" href={`/client/tickets/${ticket.id}`}>
                      {ticket.title}
                    </Link>
                    <div className="text-xs text-slate-500">#{ticket.id}</div>
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
