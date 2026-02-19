import { getUserClients } from "@/lib/dashboard";
import {
  getAdminMetrics,
  getRecentEvents,
  getClientsWithUsage,
} from "@/lib/admin";
import { MetricCard } from "@/components/admin/metric-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { ClientsTable } from "@/components/admin/clients-table";
import { Users, UserCheck, Phone, UserPlus, MessageSquare } from "lucide-react";

export default async function AdminOverviewPage() {
  const clients = await getUserClients();
  const clientIds = clients.map((c) => c.id);

  const [metrics, recentEvents, clientsWithUsage] = await Promise.all([
    getAdminMetrics(clientIds),
    getRecentEvents(clientIds, 10),
    getClientsWithUsage(clients),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Your clients and activity at a glance.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Total clients"
          value={metrics.totalClients}
          sublabel="Assigned to you"
          icon={Users}
        />
        <MetricCard
          label="Active clients"
          value={metrics.activeClients}
          sublabel="With access"
          icon={UserCheck}
        />
        <MetricCard
          label="Calls this week"
          value={metrics.callsThisWeek}
          sublabel="call_ended events"
          icon={Phone}
        />
        <MetricCard
          label="Leads generated"
          value={metrics.leadsGenerated}
          sublabel="This month"
          icon={UserPlus}
        />
        <MetricCard
          label="SMS sent"
          value={metrics.smsSent}
          sublabel="This month"
          icon={MessageSquare}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ActivityFeed events={recentEvents} />
        </div>
        <div className="lg:col-span-2">
          <ClientsTable clients={clientsWithUsage} />
        </div>
      </div>
    </div>
  );
}
