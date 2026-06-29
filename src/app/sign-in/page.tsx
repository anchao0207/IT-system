import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user?.email) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-900 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Sign in to Computech Ops</CardTitle>
          <CardDescription>
            Use your Microsoft account. Access is granted only after an admin maps
            your account in the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("microsoft-entra-id", { redirectTo: "/" });
            }}
          >
            <Button className="w-full" type="submit">
              Continue with Microsoft
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
