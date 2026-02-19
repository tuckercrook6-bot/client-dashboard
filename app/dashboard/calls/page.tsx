import { createClient } from "@/lib/supabase/server";

export default async function CallsPage() {
  const supabase = await createClient();
  let calls: { id: string; external_id: string | null; started_at: string | null; ended_at: string | null; created_at: string }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("calls")
      .select("id, external_id, started_at, ended_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    calls = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      external_id: (r.external_id as string) ?? null,
      started_at: (r.started_at as string) ?? null,
      ended_at: (r.ended_at as string) ?? null,
      created_at: r.created_at as string,
    }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Calls</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Call records from Retell and other sources.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">External ID</th>
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Started</th>
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Ended</th>
                <th className="px-5 py-3.5 text-right font-medium text-zinc-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-zinc-500">
                    No calls yet. They will appear when the Retell webhook sends data.
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="border-b border-zinc-800/80 last:border-0 hover:bg-zinc-800/30">
                    <td className="px-5 py-3.5 font-mono text-zinc-400">{call.external_id ?? "—"}</td>
                    <td className="px-5 py-3.5 text-zinc-300">{call.started_at ? new Date(call.started_at).toLocaleString() : "—"}</td>
                    <td className="px-5 py-3.5 text-zinc-300">{call.ended_at ? new Date(call.ended_at).toLocaleString() : "—"}</td>
                    <td className="px-5 py-3.5 text-right text-zinc-500">
                      {new Date(call.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
