import { V0DashboardOverview } from "@/components/dashboard/v0-dashboard-overview";

export default function NoClientsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm text-amber-200">
          <strong>No client assigned.</strong> You don&apos;t have access to any clients yet. This is a demo view of the dashboard. Ask an admin to add you in Supabase (<code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">user_clients</code> or <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">memberships</code>).
        </p>
        <form action="/auth/logout" method="POST" className="shrink-0">
          <button
            type="submit"
            className="text-sm text-zinc-400 underline hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
      <V0DashboardOverview clientName="Demo client" />
    </div>
  );
}
