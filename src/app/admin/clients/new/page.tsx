import Link from "next/link";

import { createClient } from "@/app/actions";
import { ClientForm } from "@/app/admin/clients/client-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="New client"
        description="Create a client organization with its first service location."
        actions={
          <Button asChild variant="secondary">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader><CardTitle>Client information</CardTitle></CardHeader>
        <CardContent>
          <ClientForm action={createClient} submitLabel="Create client" />
        </CardContent>
      </Card>
    </>
  );
}
