import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { getUserClients, getCurrentUser } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ADMIN_EMAIL = "tucker@lowcoresystems.com";
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.id) {
        const isAdminByEmail = authUser.email?.toLowerCase() === ADMIN_EMAIL;
        let isAdmin = isAdminByEmail;
        if (!isAdmin) {
          const { data: memberships } = await supabase.from("memberships").select("role").eq("user_id", authUser.id);
          isAdmin = Array.isArray(memberships) && memberships.some((m: { role: string }) => m.role === "admin");
        }
        if (isAdmin) redirect("/admin");
      }
    } catch {
      // memberships table may not exist yet
    }
  }
  const [clients, user] = await Promise.all([getUserClients(), getCurrentUser()]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header clients={clients} user={user} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
