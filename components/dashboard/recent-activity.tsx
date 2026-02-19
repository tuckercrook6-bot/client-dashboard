import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface ActivityEvent {
  name: string
  initials: string
  action: string
  time: string
  status: "success" | "pending" | "destructive"
}

export interface RecentActivityProps {
  events: ActivityEvent[]
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  pending: "secondary",
  destructive: "destructive",
}

const statusLabel: Record<string, string> = {
  success: "Completed",
  pending: "Pending",
  destructive: "Cancelled",
}

export function RecentActivity({ events }: RecentActivityProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {events.map((activity) => (
          <div
            key={`${activity.name}-${activity.time}`}
            className="flex items-center gap-3"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                {activity.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {activity.name}
                </span>
                <Badge
                  variant={statusVariant[activity.status]}
                  className="shrink-0 text-[10px] px-1.5 py-0"
                >
                  {statusLabel[activity.status]}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {activity.action}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {activity.time}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
