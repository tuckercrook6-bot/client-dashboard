"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { KpiItem } from "@/lib/dashboard-data"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export interface KpiCardsProps {
  items: KpiItem[]
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? "var(--success)" : "var(--destructive)"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function KpiCard({ title, value, secondary, change, changeType, icon: Icon, sparkline }: KpiItem) {
  const isPositive = changeType === "positive"
  return (
    <Card className="gap-0 border-border py-0 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
          <Sparkline data={sparkline} positive={isPositive} />
        </div>
        <div className="mt-3 flex flex-col gap-0.5">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {change}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">{secondary}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {items.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}
