import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidClientId } from "@/lib/validators";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

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
          <DashboardOverview clientName="Demo" leads={0} calls={0} smsReplies={0} booked={0} />
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
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <DashboardOverview
        clientName={clientName}
        leads={leads}
        calls={calls}
        smsReplies={smsReplies}
        booked={booked}
      />
    </div>
  );
}
