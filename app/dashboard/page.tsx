import { redirect } from "next/navigation";
import { getUserClients } from "@/lib/dashboard";

export default async function DashboardIndex() {
  const clients = await getUserClients();
  if (clients.length === 0) {
    redirect("/dashboard/no-clients");
  }
  redirect(`/dashboard/${clients[0].id}`);
}
