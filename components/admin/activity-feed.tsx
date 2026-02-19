import type { RecentEvent } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { Phone, MessageSquare, UserPlus, FileText, Calendar } from "lucide-react";

const typeConfig: Record<string, { label: string; icon: typeof Phone; className: string }> = {
  call_ended: { label: "Call", icon: Phone, className: "text-emerald-400" },
  sms_reply: { label: "SMS", icon: MessageSquare, className: "text-blue-400" },
  lead_created: { label: "Lead", icon: UserPlus, className: "text-amber-400" },
  form_submit: { label: "Form", icon: FileText, className: "text-violet-400" },
  appointment_booked: { label: "Booking", icon: Calendar, className: "text-rose-400" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function ActivityFeed({ events }: { events: RecentEvent[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h3 className="font-semibold text-white">Recent activity</h3>
        <p className="text-xs text-zinc-500">Last 10 events across clients</p>
      </div>
      <div className="divide-y divide-zinc-800">
        {events.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">No recent activity</div>
        ) : (
          events.map((e) => {
            const config = typeConfig[e.type] ?? {
              label: e.type.replace(/_/g, " "),
              icon: FileText,
              className: "text-zinc-400",
            };
            return (
              <div
                key={e.id}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-zinc-800/50"
              >
                <div className={cn("rounded-lg bg-zinc-800 p-2", config.className)}>
                  <config.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {config.label} · {e.client_name}
                  </p>
                  <p className="text-xs text-zinc-500">{formatTime(e.occurred_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
