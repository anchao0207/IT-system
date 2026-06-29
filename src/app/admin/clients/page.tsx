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
import { getClientsListData } from "@/lib/data";

export default async function ClientsPage() {
  const { clients, locations } = await getClientsListData();

  return (
    <>
      <PageHeader
        title="Clients"
        description="Client organizations and their known service locations."
        actions={
          <Button asChild>
            <Link href="/admin/clients/new">New client</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Primary contact</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.type === "client" ? (
                      <Link className="text-blue-700" href={`/admin/clients/${client.id}`}>
                        {client.name}
                      </Link>
                    ) : (
                      client.name
                    )}
                  </TableCell>
                  <TableCell>{client.domain || "Not set"}</TableCell>
                  <TableCell>{client.primaryContact || "Not set"}</TableCell>
                  <TableCell>{locations.filter((location) => location.organizationId === client.id).length}</TableCell>
                  <TableCell><StatusBadge value={client.active ? "active" : "inactive"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
