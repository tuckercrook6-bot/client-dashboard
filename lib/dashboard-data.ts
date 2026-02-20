import type { LucideIcon } from "lucide-react"

export interface KpiItem {
  title: string
  value: string
  secondary: string
  change: string
  changeType: "positive" | "negative"
  icon: LucideIcon
  sparkline: number[]
}
