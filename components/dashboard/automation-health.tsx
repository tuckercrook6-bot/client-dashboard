"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SystemHealth, SystemAlert } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, Zap, LifeBuoy } from "lucide-react"

interface AutomationHealthProps {
  systems: SystemHealth[]
  alerts: SystemAlert[]
}

const statusIcon: Record<SystemHealth["status"], React.ElementType> = {
  online: CheckCircle2,
  degraded: AlertTriangle,
  offline: XCircle,
}

const statusStyle: Record<SystemHealth["status"], string> = {
  online: "text-success",
  degraded: "text-warning",
  offline: "text-destructive",
}

const statusBadge: Record<SystemHealth["status"], string> = {
  online: "bg-success/10 text-success border-success/20",
  degraded: "bg-warning/10 text-warning border-warning/20",
  offline: "bg-destructive/10 text-destructive border-destructive/20",
}

export function AutomationHealth({ systems, alerts }: AutomationHealthProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">SMS & Automation Health</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Zap className="size-3" /> Test System</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground"><LifeBuoy className="size-3" /> Contact Support</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">System Status</p>
            {systems.map((sys) => {
              const Icon = statusIcon[sys.status]
              return (
                <div key={sys.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("size-4", statusStyle[sys.status])} />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">{sys.name}</span>
                      <span className="text-[10px] text-muted-foreground">{sys.description}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 capitalize font-normal", statusBadge[sys.status])}>{sys.status}</Badge>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Recent Alerts</p>
            {alerts.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-border bg-muted/20 px-3 py-6">
                <p className="text-xs text-muted-foreground">No recent alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <AlertTriangle className={cn("size-3.5 shrink-0 mt-0.5", alert.severity === "error" ? "text-destructive" : "text-warning")} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs text-foreground">{alert.message}</span>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
