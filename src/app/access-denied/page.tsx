import { LockKeyhole } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensurePendingUserByIdentity } from "@/lib/data";

export default async function AccessDeniedPage() {
  const session = await auth();
  const email = session?.user?.email;
  const entraSubject = session?.user?.entraSubject;

  if (session?.user) {
    await ensurePendingUserByIdentity({
      email,
      displayName: session.user.name,
      entraSubject,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-red-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle>Access not configured</CardTitle>
          <CardDescription>
            Your Microsoft account signed in successfully. Your account request is
            waiting for an admin to approve it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(email || entraSubject) && (
            <div className="space-y-3 rounded-md border bg-white p-3 text-sm">
              {email && (
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500">Email</div>
                  <div className="break-all font-mono text-slate-900">{email}</div>
                </div>
              )}
              {entraSubject && (
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500">
                    Entra subject
                  </div>
                  <div className="break-all font-mono text-slate-900">{entraSubject}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
