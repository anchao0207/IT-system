import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Building2,
  Clock3,
  Home,
  Laptop,
  LogOut,
  MessageSquareText,
  Users,
} from "lucide-react";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { initials } from "@/lib/utils";
import type { AppUser } from "@/types/domain";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/equipment", label: "Equipment", icon: Laptop },
  { href: "/admin/tickets", label: "Tickets", icon: MessageSquareText },
  { href: "/admin/timeclock", label: "Timeclock", icon: Clock3 },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
];

const clientNav: NavItem[] = [
  { href: "/client", label: "Dashboard", icon: Home },
  { href: "/client/tickets", label: "Tickets", icon: MessageSquareText },
  { href: "/client/equipment", label: "Equipment", icon: Laptop },
];

export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const nav = user.role === "admin" ? adminNav : clientNav;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 px-5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Computech Ops"
                width={36}
                height={36}
                className="h-9 w-9 object-cover"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-semibold">Computech Ops</div>
              <div className="text-xs text-slate-500">Service management</div>
            </div>
          </div>
          <Separator />
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Separator />
          <div className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                {initials(user.displayName)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{user.displayName}</div>
                <div className="truncate text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirect: false });
                redirect("/sign-in");
              }}
            >
              <Button className="w-full" variant="secondary" type="submit">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-white px-4 lg:px-8">
          <div>
            <div className="text-sm font-semibold lg:hidden">Computech Ops</div>
            <div className="text-xs text-slate-500">
              {user.role === "admin" ? "Admin portal" : "Client portal"}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div className="font-medium text-slate-800">{user.displayName}</div>
            <div>{user.role}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
