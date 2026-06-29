import { createTimeEntry } from "@/app/actions";
import { TimeclockDateTimeFields } from "@/app/admin/timeclock/date-time-fields";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTimeEntriesForAdmin } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { formatTime } from "@/lib/utils";

export default async function TimeclockPage() {
  const user = await requireRole("admin");
  const entries = await getTimeEntriesForAdmin(user.email);

  return (
    <>
      <PageHeader title="Admin timeclock" description="Internal time and mileage reimbursement entries for payroll review." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>New time entry</CardTitle></CardHeader>
          <CardContent>
            <form action={createTimeEntry} className="space-y-4">
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Work time</h3>
                  <p className="text-xs text-slate-500">Enter the hours worked for manager payroll review.</p>
                </div>
                <TimeclockDateTimeFields />
                <Field label="Lunch minutes"><Input name="lunchMinutes" type="number" min="0" defaultValue="30" /></Field>
              </section>

              <section className="space-y-4 border-t border-[var(--border)] pt-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Mileage reimbursement</h3>
                  <p className="text-xs text-slate-500">Add miles driven for reimbursement, if any.</p>
                </div>
                <Field label="Miles driven"><Input name="mileage" type="number" min="0" step="0.1" defaultValue="0" /></Field>
              </section>

              <Field label="Notes"><Textarea name="notes" /></Field>
              <Button type="submit" className="w-full">Save time entry</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>My entries</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Miles</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.workDate}</TableCell>
                    <TableCell>{formatTime(entry.timeIn)} - {formatTime(entry.timeOut) || "open"}</TableCell>
                    <TableCell>{formatTotal(entry.total)}</TableCell>
                    <TableCell>{entry.lunchMinutes} min</TableCell>
                    <TableCell>{entry.mileage}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-slate-600">{entry.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function formatTotal(value?: string | number) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}
