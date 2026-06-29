import { createTicket } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAppData, scopeDataForUser } from "@/lib/data";
import { requireRole } from "@/lib/session";

export default async function NewClientTicketPage() {
  const user = await requireRole("client");
  const data = scopeDataForUser(await getAppData(), user);
  const locations = data.locations.filter((location) => location.organizationId === user.organizationId);

  return (
    <>
      <PageHeader title="Submit ticket" description="Tell us what is wrong and link the affected equipment if you know it." />
      <Card>
        <CardHeader><CardTitle>Issue details</CardTitle></CardHeader>
        <CardContent>
          <form action={createTicket} className="grid gap-4 md:grid-cols-2">
            <Field label="Priority">
              <Select name="priority" defaultValue="normal">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location">
              <Select name="locationId">
                <SelectTrigger>
                  <SelectValue placeholder="No location linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__unassigned">No location linked</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>{location.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Equipment">
                <Select name="equipmentId">
                  <SelectTrigger>
                    <SelectValue placeholder="No equipment linked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__unassigned">No equipment linked</SelectItem>
                      {data.equipment.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.assetTag} - {item.make} {item.model}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="md:col-span-2"><Field label="Title"><Input name="title" required /></Field></div>
            <div className="md:col-span-2"><Field label="Description"><Textarea name="description" required /></Field></div>
            <div className="md:col-span-2"><Button type="submit">Submit ticket</Button></div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
