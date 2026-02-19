import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface KpiItem {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative"
  icon: React.ElementType
  subtitle: string
}

export interface KpiCardsProps {
  items: KpiItem[]
}

function KpiCard({ title, value, change, changeType, icon: Icon, subtitle }: KpiItem) {
  return (
    <Card className="gap-0 border-border py-0 transition-colors hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {value}
            </span>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              changeType === "positive" ? "text-primary" : "text-destructive"
            )}
          >
            {changeType === "positive" ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {change}
          </span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}
