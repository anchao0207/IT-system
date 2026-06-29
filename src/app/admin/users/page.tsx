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
import { getOrganizationName, getUsersListData } from "@/lib/data";
import { approveUser } from "@/app/actions";
import { CircleCheck } from "lucide-react";

import { RemoveUserDialog } from "./remove-user-dialog";

export default async function UsersPage() {
  const data = await getUsersListData();

  return (
    <>
      <PageHeader title="Users" description="App role mapping for Microsoft Entra identities." />
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><StatusBadge value={user.role} /></TableCell>
                  <TableCell>{getOrganizationName(data, user.organizationId)}</TableCell>
                  <TableCell><StatusBadge value={user.active ? "active" : "inactive"} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!user.active && (
                        <form action={approveUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" size="icon" variant="secondary" className="text-emerald-700 hover:text-[var(--primary-foreground)] hover:bg-emerald-600"><CircleCheck/></Button>
                        </form>
                      )}
                      <RemoveUserDialog
                        userId={user.id}
                        userName={user.displayName}
                        userEmail={user.email}
                      />
                    </div>
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
