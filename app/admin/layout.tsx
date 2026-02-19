import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { getUserClients, getCurrentUser } from "@/lib/dashboard";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [clients, user] = await Promise.all([getUserClients(), getCurrentUser()]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader clients={clients} user={user} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
