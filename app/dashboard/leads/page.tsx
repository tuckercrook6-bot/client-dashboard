import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();
  let leads: { id: string; name: string | null; email: string | null; phone: string | null; source: string | null; created_at: string; pipeline_stages: { name: string } | null }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("leads")
      .select("id, name, email, phone, source, created_at, pipeline_stages(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    leads = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: (r.name as string) ?? null,
      email: (r.email as string) ?? null,
      phone: (r.phone as string) ?? null,
      source: (r.source as string) ?? null,
      created_at: r.created_at as string,
      pipeline_stages: r.pipeline_stages as { name: string } | null,
    }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Leads</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pipeline and contact history. Data from webhooks and forms.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Name</th>
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Email</th>
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Phone</th>
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Stage</th>
                <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Source</th>
                <th className="px-5 py-3.5 text-right font-medium text-zinc-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No leads yet. They will appear when created via webhooks or forms.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-zinc-800/80 last:border-0 hover:bg-zinc-800/30">
                    <td className="px-5 py-3.5 font-medium text-white">{lead.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{lead.email ?? "—"}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{lead.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-zinc-300">{lead.pipeline_stages?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{lead.source ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right text-zinc-500">
                      {new Date(lead.created_at).toLocaleDateString()}
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
