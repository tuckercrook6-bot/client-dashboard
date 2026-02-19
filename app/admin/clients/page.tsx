import { getUserClients } from "@/lib/dashboard";
import { getClientsWithUsage } from "@/lib/admin";
import { ClientsTable } from "@/components/admin/clients-table";

export default async function AdminClientsPage() {
  const clients = await getUserClients();
  const clientsWithUsage = await getClientsWithUsage(clients);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Clients</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Manage and view client KPIs from the client portal.
        </p>
      </div>

      <ClientsTable clients={clientsWithUsage} />
    </div>
  );
}
