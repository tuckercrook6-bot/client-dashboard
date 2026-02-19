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
        "rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm transition-colors hover:border-zinc-700",
        className
      )}
    >
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-zinc-500">{sublabel}</p>}
    </div>
  );
}
