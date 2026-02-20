import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { getUserClients, getCurrentUser } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-role";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const viewAsClient = cookieStore.get("view_as_client")?.value === "1";

  const supabase = await createClient();
  if (supabase) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.id && isAdminEmail(authUser.email)) {
        if (!viewAsClient) redirect("/admin");
      } else if (authUser?.id) {
        const { data: memberships } = await supabase.from("memberships").select("role").eq("user_id", authUser.id);
        const isAdmin = Array.isArray(memberships) && memberships.some((m: { role: string }) => m.role === "admin");
        if (isAdmin && !viewAsClient) redirect("/admin");
      }
    } catch {
      // memberships table may not exist yet
    }
  }
  const [clients, user] = await Promise.all([getUserClients(), getCurrentUser()]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900/30">
          <Header clients={clients} user={user} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
