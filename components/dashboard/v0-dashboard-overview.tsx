"use client"

import { useState } from "react"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { LeadsChart } from "@/components/dashboard/leads-chart"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { FollowUpsTable } from "@/components/dashboard/follow-ups-table"
import { CallIntelligence } from "@/components/dashboard/call-intelligence"
import { AutomationHealth } from "@/components/dashboard/automation-health"
import { RequestModal } from "@/components/dashboard/request-modal"
import {
  kpiData,
  leadsTimeseries,
  funnelData,
  recentActivity as defaultRecentActivity,
  followUps,
  callOutcomes,
  callTopics,
  systemHealth,
  systemAlerts,
  buildKpisFromCounts,
} from "@/lib/dashboard-data"
import type { ActivityEvent, EventCounts } from "@/lib/dashboard-data"

interface V0DashboardOverviewProps {
  clientName: string
  /** When provided, KPI cards use these counts; otherwise use mock data. */
  counts?: EventCounts
  /** When provided, use for Recent Activity; otherwise use mock data. */
  activityEvents?: ActivityEvent[]
}

export function V0DashboardOverview({ clientName, counts, activityEvents }: V0DashboardOverviewProps) {
  const [requestOpen, setRequestOpen] = useState(false)
  const kpis = counts ? buildKpisFromCounts(counts, kpiData) : kpiData
  const activity = activityEvents ?? defaultRecentActivity

  return (
    <>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Dashboard Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {clientName} — track your leads, calls, and pipeline performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
            >
              Request Changes
            </button>
          </div>
        </div>

        <KpiCards items={kpis} />

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <LeadsChart data={leadsTimeseries} />
          </div>
          <div className="lg:col-span-2">
            <FunnelChart data={funnelData} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <RecentActivity events={activity} />
          </div>
          <div className="lg:col-span-3">
            <FollowUpsTable data={followUps} />
          </div>
        </div>

        <CallIntelligence outcomes={callOutcomes} topics={callTopics} />

        <AutomationHealth systems={systemHealth} alerts={systemAlerts} />
      </div>

      <RequestModal open={requestOpen} onOpenChange={setRequestOpen} />
    </>
  )
}
