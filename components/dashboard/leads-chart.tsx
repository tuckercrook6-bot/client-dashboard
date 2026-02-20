"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeadsTimeseriesPoint } from "@/lib/dashboard-data"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface LeadsChartProps {
  data: LeadsTimeseriesPoint[]
}

const sources = [
  { key: "calls", label: "Calls", color: "var(--chart-1)" },
  { key: "web", label: "Web", color: "var(--chart-2)" },
  { key: "sms", label: "SMS", color: "var(--chart-3)" },
  { key: "manual", label: "Manual", color: "var(--muted-foreground)" },
] as const

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
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
  )
}

export function LeadsChart({ data }: LeadsChartProps) {
  const [activeSource, setActiveSource] = useState<string>("all")
  const visibleSources = activeSource === "all" ? sources : sources.filter((s) => s.key === activeSource)

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Leads Over Time</CardTitle>
        <Tabs value={activeSource} onValueChange={setActiveSource}>
          <TabsList className="h-7">
            <TabsTrigger value="all" className="text-[11px] px-2 h-6">All</TabsTrigger>
            {sources.map((s) => (
              <TabsTrigger key={s.key} value={s.key} className="text-[11px] px-2 h-6">{s.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                {sources.map((s) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="date" className="stroke-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis className="stroke-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              {visibleSources.map((s) => (
                <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`} stackId="leads" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
