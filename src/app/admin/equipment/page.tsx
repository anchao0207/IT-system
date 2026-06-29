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
import { getAdminEquipmentListData, getLocationName, getOrganizationName } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Pen } from "lucide-react"

function searchable(value: unknown) {
  return value == null ? "" : String(value);
}

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const data = await getAdminEquipmentListData();
  const query = q.toLowerCase();
  const equipment = data.equipment.filter((item) => {
    const haystack = [
      searchable(item.assetTag),
      searchable(item.deviceType),
      searchable(item.make),
      searchable(item.model),
      searchable(item.serial),
      getOrganizationName(data, item.organizationId),
      getLocationName(data, item.locationId),
      searchable(item.status),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  return (
    <>
      <PageHeader
        title="Equipment"
        description="Track client and company assets, locations, purchase dates, warranties, and typed specs."
        actions={<Button asChild><Link href="/admin/equipment/new">Add equipment</Link></Button>}
      />
      <Card>
        <CardContent className="pt-5">
          <form className="mb-4 flex gap-2">
            <input
              className="focus-ring h-9 flex-1 rounded-md border border-[var(--border)] px-3 text-sm"
              name="q"
              defaultValue={q}
              placeholder="Search asset tag, client, location, serial, status"
            />
            <Button variant="secondary" type="submit">Search</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.assetTag}</div>
                    <div className="text-xs text-slate-500">
                      {item.deviceType} · {item.make} {item.model}
                    </div>
                  </TableCell>
                  <TableCell>{getOrganizationName(data, item.organizationId)}</TableCell>
                  <TableCell>{getLocationName(data, item.locationId)}</TableCell>
                  <TableCell className="text-slate-600">
                    {item.specs}
                  </TableCell>
                  <TableCell>{formatDate(item.warrantyDate)}</TableCell>
                  <TableCell><StatusBadge value={item.status} /></TableCell>
                  <TableCell>
                    <Button asChild variant="secondary" size="icon">
                      <Link href={`/admin/equipment/${item.id}`}>
                        <Pen/>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
