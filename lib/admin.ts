import { createClient } from "@/lib/supabase/server";
import type { UserClient } from "./dashboard";

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function startOfMonthISO() {
  const d = new Date();
  const s = new Date(d.getFullYear(), d.getMonth(), 1);
  return s.toISOString();
}

export type AdminMetrics = {
  totalClients: number;
  activeClients: number;
  callsThisWeek: number;
  leadsGenerated: number;
  smsSent: number;
};

export type RecentEvent = {
  id: string;
  type: string;
  occurred_at: string;
  client_name: string;
};

export type ClientWithUsage = UserClient & {
  plan: string;
  status: "Active" | "Inactive";
  usageThisMonth: number;
};

export async function getAdminMetrics(clientIds: string[]): Promise<AdminMetrics> {
  const supabase = await createClient();
  if (!supabase || clientIds.length === 0) {
    return { totalClients: 0, activeClients: 0, callsThisWeek: 0, leadsGenerated: 0, smsSent: 0 };
  }
  const weekStart = startOfWeekISO();
  const monthStart = startOfMonthISO();

  const [callsRes, leadsRes, smsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("client_id", clientIds)
      .eq("type", "call_ended")
      .gte("occurred_at", weekStart),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("client_id", clientIds)
      .gte("occurred_at", monthStart)
      .in("type", ["form_submit", "lead_created"]),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("client_id", clientIds)
      .eq("type", "sms_reply")
      .gte("occurred_at", monthStart),
  ]);

  const totalClients = clientIds.length;
  const activeClients = totalClients;

  return {
    totalClients,
    activeClients,
    callsThisWeek: callsRes.count ?? 0,
    leadsGenerated: leadsRes.count ?? 0,
    smsSent: smsRes.count ?? 0,
  };
}

export async function getRecentEvents(clientIds: string[], limit = 10): Promise<RecentEvent[]> {
  const supabase = await createClient();
  if (!supabase || clientIds.length === 0) return [];
  const { data } = await supabase
    .from("events")
    .select("id, type, occurred_at, clients(name)")
    .in("client_id", clientIds)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (!data) return [];
  return data.map((r) => {
    const clients = r.clients as { name: string } | { name: string }[] | null;
    const name = Array.isArray(clients) ? clients[0]?.name : clients?.name;
    return {
      id: r.id,
      type: r.type,
      occurred_at: r.occurred_at,
      client_name: name ?? "—",
    };
  });
}

export async function getClientsWithUsage(clients: UserClient[]): Promise<ClientWithUsage[]> {
  const supabase = await createClient();
  const monthStart = startOfMonthISO();
  if (!supabase || clients.length === 0) {
    return clients.map((c) => ({ ...c, plan: "Standard", status: "Active" as const, usageThisMonth: 0 }));
  }
  const { data: events } = await supabase
    .from("events")
    .select("client_id")
    .in("client_id", clients.map((c) => c.id))
    .gte("occurred_at", monthStart);
  const usageByClient: Record<string, number> = {};
  clients.forEach((c) => (usageByClient[c.id] = 0));
  events?.forEach((e: { client_id: string }) => {
    usageByClient[e.client_id] = (usageByClient[e.client_id] ?? 0) + 1;
  });
  return clients.map((c) => ({
    ...c,
    plan: "Standard",
    status: "Active" as const,
    usageThisMonth: usageByClient[c.id] ?? 0,
  }));
}
