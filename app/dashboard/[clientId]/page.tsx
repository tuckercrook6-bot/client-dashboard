import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidClientId } from "@/lib/validators";
import { V0DashboardOverview } from "@/components/dashboard/v0-dashboard-overview";
import {
  kpiData,
  recentActivity as mockRecentActivity,
  buildKpisFromCounts,
  buildActivityFromEvents,
  type RawEvent,
} from "@/lib/dashboard-data";

function startOfMonthISO() {
  const d = new Date();
  const s = new Date(d.getFullYear(), d.getMonth(), 1);
  return s.toISOString();
}

export default async function ClientDashboard({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  if (!isValidClientId(clientId)) {
    notFound();
  }
  const since = startOfMonthISO();

  const supabase = await createClient();
  if (!supabase) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">
            Supabase env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
          </p>
          <V0DashboardOverview clientName="Demo" />
        </div>
      );
    }
    notFound();
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id,name")
    .eq("id", clientId)
    .single();
  if (!client) {
    notFound();
  }
  const clientName = client.name;

  const { data: eventsData } = await supabase
    .from("events")
    .select("id, type, occurred_at, payload")
    .eq("client_id", clientId)
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false });
  const events: { id: string; type: string; occurred_at: string; payload?: Record<string, unknown> }[] = eventsData ?? [];

  const counts = events.reduce(
    (acc, e) => {
      if (e.type === "form_submit" || e.type === "lead_created") acc.leads += 1;
      else if (e.type === "call_ended") acc.calls += 1;
      else if (e.type === "sms_reply") acc.sms += 1;
      else if (e.type === "appointment_booked") acc.booked += 1;
      return acc;
    },
    { leads: 0, calls: 0, sms: 0, booked: 0 }
  );

  const realKpis = buildKpisFromCounts(counts, kpiData);
  const recentEventsRaw: RawEvent[] = (eventsData ?? []).slice(0, 20).map((e) => ({
    id: e.id,
    type: e.type,
    occurred_at: e.occurred_at,
    payload: (e.payload as Record<string, unknown>) ?? undefined,
  }));
  const realActivity = recentEventsRaw.length > 0
    ? buildActivityFromEvents(recentEventsRaw, new Date())
    : mockRecentActivity;

  return (
    <V0DashboardOverview
      clientName={clientName}
      kpiItems={realKpis}
      activityEvents={realActivity}
    />
  );
}
