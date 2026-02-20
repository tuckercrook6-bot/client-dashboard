"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ActivityEvent } from "@/lib/dashboard-data"
import { Phone, PhoneMissed, MessageSquare, CalendarCheck, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecentActivityProps {
  events: ActivityEvent[]
}

const typeIcon: Record<ActivityEvent["type"], React.ElementType> = {
  call_answered: Phone,
  call_missed: PhoneMissed,
  sms_sent: MessageSquare,
  sms_reply: MessageSquare,
  appointment: CalendarCheck,
  lead_update: RefreshCw,
}

const channelColor: Record<string, string> = {
  Call: "bg-primary/10 text-primary border-primary/20",
  SMS: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Booking: "bg-success/10 text-success border-success/20",
  CRM: "bg-muted text-muted-foreground border-border",
}

export function RecentActivity({ events }: RecentActivityProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {events.map((event) => {
          const Icon = typeIcon[event.type] ?? RefreshCw
          return (
            <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md mt-0.5", event.type === "call_missed" ? "bg-destructive/10" : "bg-primary/10")}>
                <Icon className={cn("size-3.5", event.type === "call_missed" ? "text-destructive" : "text-primary")} />
              </div>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed truncate">{event.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-normal", channelColor[event.channel])}>{event.channel}</Badge>
                  <span className="text-[10px] text-muted-foreground">{event.time}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground shrink-0">View</Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
