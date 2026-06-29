import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

import { EquipmentForm } from "./equipment-form";

export default async function NewEquipmentPage() {
  const data = await getAppData();

  return (
    <>
      <PageHeader title="Add equipment" description="Create an asset record with typed specs and flexible notes." />
      <Card>
        <CardHeader><CardTitle>Equipment details</CardTitle></CardHeader>
        <CardContent>
          <EquipmentForm organizations={data.organizations} locations={data.locations} />
        </CardContent>
      </Card>
    </>
  );
}
