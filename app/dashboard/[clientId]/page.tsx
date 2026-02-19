import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidClientId } from "@/lib/validators";

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
          <p className="text-sm text-zinc-500">
            Supabase env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
          </p>
          <h2 className="text-2xl font-semibold text-white">Client Dashboard</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card title="Leads" value={0} />
            <Card title="Calls" value={0} />
            <Card title="SMS Replies" value={0} />
            <Card title="Booked" value={0} />
          </div>
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

  const { data: eventsData } = await supabase
    .from("events")
    .select("type, occurred_at")
    .eq("client_id", clientId)
    .gte("occurred_at", since);
  const events: { type: string; occurred_at: string }[] = eventsData ?? [];
  const clientName = client.name;

  const counts = events.reduce((acc: Record<string, number>, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  const leads = (counts["form_submit"] ?? 0) + (counts["lead_created"] ?? 0);
  const calls = counts["call_ended"] ?? 0;
  const smsReplies = counts["sms_reply"] ?? 0;
  const booked = counts["appointment_booked"] ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">{clientName} Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-500">KPIs for this account</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card title="Leads" value={leads} />
        <Card title="Calls" value={calls} />
        <Card title="SMS Replies" value={smsReplies} />
        <Card title="Booked" value={booked} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm transition-colors hover:border-zinc-700">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}
