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

/** One data point for admin activity chart (calls & leads by day). */
export type AdminActivityPoint = {
  date: string;
  calls: number;
  leads: number;
};

/** Get daily counts of calls and leads for the last N days across all given clients. */
export async function getAdminActivityTimeseries(
  clientIds: string[],
  days: number = 7
): Promise<AdminActivityPoint[]> {
  const supabase = await createClient();
  if (!supabase || clientIds.length === 0) {
    return fillDailyPoints(days, {});
  }
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  const sinceISO = since.toISOString();

  const { data: events } = await supabase
    .from("events")
    .select("type, occurred_at")
    .in("client_id", clientIds)
    .gte("occurred_at", sinceISO)
    .in("type", ["call_ended", "lead_created", "form_submit"]);

  const byDay: Record<string, { calls: number; leads: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { calls: 0, leads: 0 };
  }
  events?.forEach((e: { type: string; occurred_at: string }) => {
    const key = e.occurred_at.slice(0, 10);
    if (!byDay[key]) byDay[key] = { calls: 0, leads: 0 };
    if (e.type === "call_ended") byDay[key].calls += 1;
    else if (e.type === "lead_created" || e.type === "form_submit") byDay[key].leads += 1;
  });

  return fillDailyPoints(days, byDay);
}

function fillDailyPoints(
  days: number,
  byDay: Record<string, { calls: number; leads: number }>
): AdminActivityPoint[] {
  const result: AdminActivityPoint[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const point = byDay[key] ?? { calls: 0, leads: 0 };
    result.push({
      date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      calls: point.calls,
      leads: point.leads,
    });
  }
  return result;
}
