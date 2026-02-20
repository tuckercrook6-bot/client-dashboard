"use client"

import { Users, Phone, MessageSquare, CalendarCheck } from "lucide-react"
import { KpiCards } from "./kpi-cards"
import type { KpiItem } from "@/lib/dashboard-data"

function sparklineFromValue(v: number): number[] {
  if (v === 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const step = Math.max(1, Math.floor(v / 12))
  return Array.from({ length: 12 }, (_, i) => Math.min(v, step * (i + 1)))
}

export function DashboardOverview({
  clientName,
  leads,
  calls,
  smsReplies,
  booked,
}: {
  clientName: string
  leads: number
  calls: number
  smsReplies: number
  booked: number
}) {
  const items: KpiItem[] = [
    {
      title: "Leads",
      value: String(leads),
      secondary: "this month",
      change: "—",
      changeType: "positive",
      icon: Users,
      sparkline: sparklineFromValue(leads),
    },
    {
      title: "Calls",
      value: String(calls),
      secondary: "answered",
      change: "—",
      changeType: "positive",
      icon: Phone,
      sparkline: sparklineFromValue(calls),
    },
    {
      title: "SMS Replies",
      value: String(smsReplies),
      secondary: "this month",
      change: "—",
      changeType: "positive",
      icon: MessageSquare,
      sparkline: sparklineFromValue(smsReplies),
    },
    {
      title: "Booked",
      value: String(booked),
      secondary: "appointments",
      change: "—",
      changeType: "positive",
      icon: CalendarCheck,
      sparkline: sparklineFromValue(booked),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dashboard Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {clientName} — track leads, calls, and pipeline
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
      <KpiCards items={items} />
    </div>
  )
}
