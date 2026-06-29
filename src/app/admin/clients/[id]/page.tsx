import Link from "next/link";
import { notFound } from "next/navigation";

import { updateClient } from "@/app/actions";
import { ClientForm } from "@/app/admin/clients/client-form";
import { PageHeader } from "@/components/page-header";
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
import { getAppData } from "@/lib/data";
import type { AppUser, Organization } from "@/types/domain";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAppData();
  const client = data.organizations.find((org) => org.id === Number(id) && org.type === "client");
  if (!client) notFound();

  const locations = data.locations.filter((location) => location.organizationId === client.id);
  const clientUsers = getClientUsers(client, data.users);

  return (
    <>
      <PageHeader
        title={client.name}
        description="Edit client organization, locations, and linked users."
        actions={
          <Button asChild variant="secondary">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>Edit client</CardTitle></CardHeader>
          <CardContent>
            <ClientForm
              action={updateClient}
              client={client}
              locations={locations}
              submitLabel="Save client"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Locations</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{[location.address, location.city, location.state].filter(Boolean).join(", ") || "Not set"}</TableCell>
                      <TableCell><StatusBadge value={location.active ? "active" : "inactive"} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Users</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientUsers.length > 0 ? (
                    clientUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.displayName || "Unnamed user"}</TableCell>
                        <TableCell>{user.email || "Not set"}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell><StatusBadge value={user.active ? "active" : "inactive"} /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-sm text-slate-500">
                        No users linked.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function getClientUsers(client: Organization, users: AppUser[]) {
  const linkedUserIds = new Set(getLinkedUserIds(client));
  return users
    .filter((user) => linkedUserIds.has(user.id) || user.organizationId === client.id)
    .sort((first, second) =>
      (first.displayName || first.email).localeCompare(second.displayName || second.email),
    );
}

function getLinkedUserIds(client: Organization) {
  const organization = client as Organization & Record<string, unknown>;
  const linkedRows = [
    organization.users,
    organization.Users,
    organization.organizationUsers,
    organization["Organization Users"],
  ].find((value): value is unknown[] => Array.isArray(value));

  if (!linkedRows) return [];

  return linkedRows
    .map((row) => {
      if (typeof row === "number") return row;
      if (row && typeof row === "object" && "id" in row) return Number(row.id);
      return undefined;
    })
    .filter((id): id is number => Number.isFinite(id));
}
