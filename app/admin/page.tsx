import Link from "next/link";
import { getUserClients } from "@/lib/dashboard";
import {
  getAdminMetrics,
  getRecentEvents,
  getClientsWithUsage,
  getAdminActivityTimeseries,
} from "@/lib/admin";
import { MetricCard } from "@/components/admin/metric-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { ClientsTable } from "@/components/admin/clients-table";
import { AdminActivityChart } from "@/components/admin/activity-chart";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Phone, UserPlus, MessageSquare, ExternalLink } from "lucide-react";

const CHART_DAYS = 7;

export default async function AdminOverviewPage() {
  const clients = await getUserClients();
  const clientIds = clients.map((c) => c.id);

  const [metrics, recentEvents, clientsWithUsage, activityTimeseries] = await Promise.all([
    getAdminMetrics(clientIds),
    getRecentEvents(clientIds, 10),
    getClientsWithUsage(clients),
    getAdminActivityTimeseries(clientIds, CHART_DAYS),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your clients and activity at a glance.
          </p>
        </div>
        <Button asChild size="sm" className="w-fit shrink-0 gap-2 border-border bg-card text-foreground hover:bg-muted">
          <Link href="/dashboard/portal">
            <ExternalLink className="size-4" />
            Open client portal
          </Link>
        </Button>
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
          label="SMS replies"
          value={metrics.smsSent}
          sublabel="This month"
          icon={MessageSquare}
        />
      </section>

      <section>
        <AdminActivityChart data={activityTimeseries} days={CHART_DAYS} />
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
