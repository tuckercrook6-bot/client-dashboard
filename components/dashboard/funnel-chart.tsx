"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FunnelStep } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

interface FunnelChartProps {
  data: FunnelStep[]
}

const barColors = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-1", "bg-chart-2"]

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = data[0]?.count ?? 1
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {data.map((step, i) => {
            const widthPercent = Math.max((step.count / maxCount) * 100, 12)
            const conversionFromPrev = i > 0 ? `${((step.count / data[i - 1].count) * 100).toFixed(1)}%` : null
            return (
              <div key={step.stage} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-foreground">{step.count}</span>
                    {conversionFromPrev && <span className="text-[10px] text-muted-foreground">{conversionFromPrev}</span>}
                  </div>
                </div>
                <div className="h-7 w-full rounded-md bg-muted/50 overflow-hidden">
                  <div className={cn("h-full rounded-md transition-all duration-500", barColors[i % barColors.length])} style={{ width: `${widthPercent}%`, opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>Overall conversion:</span>
          <span className="font-mono font-semibold text-foreground">
            {data.length >= 2 ? `${((data[data.length - 1].count / data[0].count) * 100).toFixed(1)}%` : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
