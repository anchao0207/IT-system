import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminEquipmentListData } from "@/lib/data";

import { EquipmentForm } from "../new/equipment-form";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminEquipmentListData();
  const equipment = data.equipment.find((item) => item.id === Number(id));

  if (!equipment) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${equipment.assetTag}`}
        description="Update the asset record, ownership, linked organization, location, and notes."
      />
      <Card>
        <CardHeader><CardTitle>Equipment details</CardTitle></CardHeader>
        <CardContent>
          <EquipmentForm
            equipment={equipment}
            organizations={data.organizations}
            locations={data.locations}
          />
        </CardContent>
      </Card>
    </>
  );
}
