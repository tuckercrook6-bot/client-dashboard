"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminActivityPoint } from "@/lib/admin";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CALLS_COLOR = "var(--chart-1)";
const LEADS_COLOR = "var(--chart-2)";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.dataKey}: <span className="font-mono font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

interface AdminActivityChartProps {
  data: AdminActivityPoint[];
  days?: number;
}

export function AdminActivityChart({ data, days = 7 }: AdminActivityChartProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Calls & leads over time</CardTitle>
        <p className="text-xs text-muted-foreground">Last {days} days across all clients</p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="admin-grad-calls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CALLS_COLOR} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CALLS_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="admin-grad-leads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LEADS_COLOR} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={LEADS_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="date"
                className="stroke-muted-foreground"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="stroke-muted-foreground"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="calls"
                name="Calls"
                stroke={CALLS_COLOR}
                strokeWidth={2}
                fill="url(#admin-grad-calls)"
                stackId="admin"
              />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke={LEADS_COLOR}
                strokeWidth={2}
                fill="url(#admin-grad-leads)"
                stackId="admin"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
