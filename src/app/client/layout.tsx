import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/session";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("client");
  return <AppShell user={user}>{children}</AppShell>;
}
