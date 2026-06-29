import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientEquipmentListData, getLocationName } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function ClientEquipmentPage() {
  const user = await requireRole("client");
  const data = await getClientEquipmentListData(user.organizationId);

  return (
    <>
      <PageHeader title="Equipment" description="Equipment records visible for your organization." />
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.assetTag}</div>
                    <div className="text-xs text-slate-500">{item.deviceType} · {item.make} {item.model}</div>
                  </TableCell>
                  <TableCell>{getLocationName(data, item.locationId)}</TableCell>
                  <TableCell>{item.specs || "Not set"}</TableCell>
                  <TableCell>{formatDate(item.warrantyDate)}</TableCell>
                  <TableCell><StatusBadge value={item.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
