import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

import { AdminTicketForm } from "./ticket-form";

export default async function NewAdminTicketPage() {
  const data = await getAppData();
  const admins = data.users.filter((user) => user.role === "admin" && user.active);

  return (
    <>
      <PageHeader title="New ticket" description="Open a ticket on behalf of a client." />
      <Card>
        <CardHeader><CardTitle>Issue details</CardTitle></CardHeader>
        <CardContent>
          <AdminTicketForm
            admins={admins}
            equipment={data.equipment}
            locations={data.locations}
            organizations={data.organizations}
          />
        </CardContent>
      </Card>
    </>
  );
}
