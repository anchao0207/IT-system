import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ensurePendingUserByIdentity, findUserByIdentity } from "@/lib/data";
import type { AppUser, Role } from "@/types/domain";

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const session = await auth();
  return findUserByIdentity(session?.user?.email, session?.user?.entraSubject);
}

export async function requireUser(): Promise<AppUser> {
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
  return user;
}

export async function requireRole(role: Role): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== role) redirect(user.role === "admin" ? "/admin" : "/client");
  return user;
}
