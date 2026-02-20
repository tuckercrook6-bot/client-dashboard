"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CallOutcome } from "@/lib/dashboard-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Star, FileText } from "lucide-react"

interface CallIntelligenceProps {
  outcomes: CallOutcome[]
  topics: string[]
}

function OutcomeTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: CallOutcome }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{d.name}</p>
      <p className="text-xs text-muted-foreground">Count: <span className="font-mono font-semibold text-foreground">{d.value}</span></p>
    </div>
  )
}

export function CallIntelligence({ outcomes, topics }: CallIntelligenceProps) {
  const total = outcomes.reduce((sum, o) => sum + o.value, 0)
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Call Intelligence</CardTitle>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <FileText className="size-3" /> View Transcripts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">Call Outcomes</p>
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomes} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {outcomes.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<OutcomeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              {outcomes.map((o) => (
                <div key={o.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: o.fill }} />
                  <span className="text-[10px] text-muted-foreground">{o.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">Top Call Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-[11px] font-normal">{topic}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">AI Summary Quality</p>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-foreground">4.6</span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`size-3.5 ${star <= 4 ? "fill-chart-3 text-chart-3" : "text-border fill-border"}`} />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Based on {total} call summaries</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
