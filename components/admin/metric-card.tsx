import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  className?: string;
};

export function MetricCard({ label, value, sublabel, icon: Icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-5 shadow-sm ring-1 ring-zinc-800/50 transition-all hover:border-zinc-700/80 hover:ring-zinc-700/50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-zinc-500">{sublabel}</p>}
    </div>
  );
}
