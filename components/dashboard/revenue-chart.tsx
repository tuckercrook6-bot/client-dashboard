"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Jan", revenue: 18400, clients: 1940 },
  { month: "Feb", revenue: 21800, clients: 2050 },
  { month: "Mar", revenue: 19200, clients: 2120 },
  { month: "Apr", revenue: 26700, clients: 2280 },
  { month: "May", revenue: 31200, clients: 2410 },
  { month: "Jun", revenue: 29800, clients: 2530 },
  { month: "Jul", revenue: 34100, clients: 2620 },
  { month: "Aug", revenue: 38600, clients: 2710 },
  { month: "Sep", revenue: 36200, clients: 2780 },
  { month: "Oct", revenue: 42100, clients: 2810 },
  { month: "Nov", revenue: 45800, clients: 2830 },
  { month: "Dec", revenue: 48200, clients: 2847 },
]

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          Revenue:{" "}
          <span className="font-mono font-semibold text-primary">
            ${(payload[0].value / 1000).toFixed(1)}K
          </span>
        </p>
      </div>
    )
  }
  return null
}

export function RevenueChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.65 0.2 160)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.65 0.2 160)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.005 260)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="oklch(0.5 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.5 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `$${val / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.65 0.2 160)"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
