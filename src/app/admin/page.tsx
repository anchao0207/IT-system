import Link from "next/link";
import { AlertCircle } from "lucide-react";

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
import { getAppData, getUserLabel } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboard() {
  const data = await getAppData();
  const openTickets = data.tickets.filter(
    (ticket) => !["resolved", "closed"].includes(ticket.status),
  );
  const unassignedTickets = openTickets.filter((ticket) => !ticket.assignedAdminEmail);
  const activeEquipment = data.equipment.filter((item) => item.status === "active");
  const pendingUsers = data.users.filter((user) => !user.active);

  return (
    <>
      <PageHeader
        title="Admin dashboard"
        description="Operational overview for client equipment, ticket flow, and internal admin time."
        actions={
          <Button asChild>
            <Link href="/admin/tickets/new">New ticket</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open tickets" value={openTickets.length} detail="Active service queue" />
        <StatCard title="Equipment" value={data.equipment.length} detail={`${activeEquipment.length} active assets`} />
        <StatCard title="Clients" value={data.organizations.filter((org) => org.type === "client").length} detail="Active organizations" />
        <StatCard title="Pending users" value={pendingUsers.length} detail="Waiting for approval" />
      </div>

      {pendingUsers.length > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <div className="font-medium text-amber-950">
                  {pendingUsers.length} user {pendingUsers.length === 1 ? "request needs" : "requests need"} review
                </div>
                <div className="mt-1 text-sm text-amber-900">
                  {pendingUsers.slice(0, 3).map((user) => user.email).join(", ")}
                  {pendingUsers.length > 3 ? ` and ${pendingUsers.length - 3} more` : ""}
                </div>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/admin/users">Review users</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {unassignedTickets.length > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <div className="font-medium text-amber-950">
                  {unassignedTickets.length} ticket {unassignedTickets.length === 1 ? "needs" : "need"} assignment
                </div>
                <div className="mt-1 text-sm text-amber-900">
                  {unassignedTickets.slice(0, 3).map((ticket) => ticket.title).join(", ")}
                  {unassignedTickets.length > 3 ? ` and ${unassignedTickets.length - 3} more` : ""}
                </div>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/admin/tickets">Assign tickets</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ticket queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openTickets.slice(0, 6).map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link className="font-medium text-blue-700" href={`/admin/tickets/${ticket.id}`}>
                        {ticket.title}
                      </Link>
                      <div className="text-xs text-slate-500">{getUserLabel(data, ticket.userId)}</div>
                    </TableCell>
                    <TableCell><StatusBadge value={ticket.priority} /></TableCell>
                    <TableCell><StatusBadge value={ticket.status} /></TableCell>
                    <TableCell className="text-slate-600">{formatDateTime(ticket.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warranty watch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.equipment.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{item.assetTag}</div>
                  <StatusBadge value={item.status} />
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {item.make} {item.model}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Warranty: {item.warrantyDate || "Not set"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
