import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ensurePendingUserByIdentity, findUserByIdentity } from "@/lib/data";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  const user = await findUserByIdentity(session.user.email, session.user.entraSubject);
  if (!user) {
    await ensurePendingUserByIdentity({
      email: session.user.email,
      displayName: session.user.name,
      entraSubject: session.user.entraSubject,
    });
    redirect("/access-denied");
  }

  redirect(user.role === "admin" ? "/admin" : "/client");
}
