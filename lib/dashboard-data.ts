import {
  Users,
  Phone,
  PhoneMissed,
  MessageSquare,
  CalendarCheck,
  GitBranch,
  DollarSign,
  Clock,
} from "lucide-react"

export interface KpiItem {
  title: string
  value: string
  secondary: string
  change: string
  changeType: "positive" | "negative"
  icon: React.ElementType
  sparkline: number[]
}

export const kpiData: KpiItem[] = [
  { title: "New Leads", value: "284", secondary: "+22% vs prior", change: "+22%", changeType: "positive", icon: Users, sparkline: [18, 22, 15, 28, 32, 26, 34, 38, 30, 42, 36, 44] },
  { title: "Answered Calls", value: "812", secondary: "94.2% answered", change: "+5.1%", changeType: "positive", icon: Phone, sparkline: [60, 65, 58, 72, 68, 75, 80, 78, 82, 76, 85, 81] },
  { title: "Missed Calls", value: "43", secondary: "~$8,600 est. lost", change: "-22%", changeType: "positive", icon: PhoneMissed, sparkline: [12, 10, 14, 8, 11, 9, 7, 10, 6, 8, 5, 4] },
  { title: "SMS Follow-ups", value: "1,247", secondary: "38% reply rate", change: "+12%", changeType: "positive", icon: MessageSquare, sparkline: [80, 92, 88, 105, 98, 110, 115, 108, 120, 118, 125, 124] },
  { title: "Appointments", value: "187", secondary: "88% show rate", change: "+14.2%", changeType: "positive", icon: CalendarCheck, sparkline: [12, 15, 11, 18, 14, 20, 17, 22, 19, 24, 21, 18] },
  { title: "Pipeline Value", value: "$142.8K", secondary: "+18% change", change: "+18%", changeType: "positive", icon: GitBranch, sparkline: [80, 85, 92, 88, 95, 100, 105, 110, 108, 120, 130, 142] },
  { title: "Revenue Attributed", value: "$48.2K", secondary: "4.2x ROAS", change: "+8.4%", changeType: "positive", icon: DollarSign, sparkline: [28, 32, 30, 35, 38, 34, 40, 42, 38, 45, 44, 48] },
  { title: "Response Time", value: "1m 24s", secondary: "avg first response", change: "-18%", changeType: "positive", icon: Clock, sparkline: [180, 160, 170, 140, 150, 130, 120, 110, 100, 95, 90, 84] },
]

export interface LeadsTimeseriesPoint {
  date: string
  calls: number
  web: number
  sms: number
  manual: number
}

export const leadsTimeseries: LeadsTimeseriesPoint[] = [
  { date: "Jan 1", calls: 8, web: 5, sms: 3, manual: 1 },
  { date: "Jan 5", calls: 12, web: 7, sms: 5, manual: 2 },
  { date: "Jan 9", calls: 10, web: 9, sms: 6, manual: 1 },
  { date: "Jan 13", calls: 15, web: 8, sms: 8, manual: 3 },
  { date: "Jan 17", calls: 18, web: 11, sms: 7, manual: 2 },
  { date: "Jan 21", calls: 14, web: 10, sms: 9, manual: 4 },
  { date: "Jan 25", calls: 20, web: 12, sms: 11, manual: 2 },
  { date: "Jan 29", calls: 22, web: 14, sms: 10, manual: 3 },
]

export interface FunnelStep {
  stage: string
  count: number
  rate: string
}

export const funnelData: FunnelStep[] = [
  { stage: "Total Leads", count: 284, rate: "100%" },
  { stage: "Contacted", count: 241, rate: "84.9%" },
  { stage: "Qualified", count: 156, rate: "64.7%" },
  { stage: "Booked", count: 187, rate: "119.9%" },
  { stage: "Completed", count: 164, rate: "87.7%" },
]

export interface ActivityEvent {
  id: string
  type: "call_answered" | "call_missed" | "sms_sent" | "sms_reply" | "appointment" | "lead_update"
  description: string
  time: string
  channel: string
}

export const recentActivity: ActivityEvent[] = [
  { id: "1", type: "call_answered", description: "Inbound call from Maria G. - Cleaning inquiry", time: "2 min ago", channel: "Call" },
  { id: "2", type: "sms_sent", description: "Follow-up SMS sent to James R.", time: "8 min ago", channel: "SMS" },
  { id: "3", type: "appointment", description: "Appointment booked - Sarah K., Jan 28 2:00 PM", time: "15 min ago", channel: "Booking" },
  { id: "4", type: "call_missed", description: "Missed call from (555) 012-3456", time: "22 min ago", channel: "Call" },
  { id: "5", type: "sms_reply", description: "Reply received from David L. - 'Yes, confirm'", time: "34 min ago", channel: "SMS" },
  { id: "6", type: "lead_update", description: "Lead status: Mike T. moved to Qualified", time: "1 hr ago", channel: "CRM" },
]

export interface FollowUp {
  id: string
  lead: string
  channel: "Call" | "SMS"
  lastTouch: string
  nextAction: string
  owner: "AI" | "Staff"
  status: "Overdue" | "Today" | "Upcoming"
}

export const followUps: FollowUp[] = [
  { id: "1", lead: "Maria Garcia", channel: "Call", lastTouch: "Jan 24", nextAction: "Follow-up call", owner: "AI", status: "Overdue" },
  { id: "2", lead: "James Rodriguez", channel: "SMS", lastTouch: "Jan 25", nextAction: "Send pricing", owner: "Staff", status: "Today" },
  { id: "3", lead: "Sarah Kim", channel: "Call", lastTouch: "Jan 25", nextAction: "Confirm appt", owner: "AI", status: "Today" },
  { id: "4", lead: "David Liu", channel: "SMS", lastTouch: "Jan 26", nextAction: "Reminder SMS", owner: "AI", status: "Upcoming" },
  { id: "5", lead: "Lisa Martinez", channel: "Call", lastTouch: "Jan 23", nextAction: "Re-engage call", owner: "Staff", status: "Overdue" },
  { id: "6", lead: "Tom Harrison", channel: "SMS", lastTouch: "Jan 26", nextAction: "Send intake form", owner: "AI", status: "Upcoming" },
]

export interface CallOutcome {
  name: string
  value: number
  fill: string
}

export const callOutcomes: CallOutcome[] = [
  { name: "Booked", value: 187, fill: "var(--chart-1)" },
  { name: "No Answer", value: 43, fill: "var(--chart-3)" },
  { name: "Not Qualified", value: 62, fill: "var(--muted-foreground)" },
  { name: "Spam", value: 18, fill: "var(--destructive)" },
  { name: "Callback", value: 34, fill: "var(--chart-2)" },
]

export const callTopics: string[] = [
  "Pricing inquiry", "Appointment scheduling", "Service availability", "Insurance questions",
  "Emergency request", "New patient intake", "Cancellation", "Billing question",
]

export interface SystemHealth {
  name: string
  status: "online" | "degraded" | "offline"
  description: string
}

export const systemHealth: SystemHealth[] = [
  { name: "Inbound Call Webhook", status: "online", description: "All systems operational" },
  { name: "SMS Sending", status: "online", description: "99.8% delivery rate" },
  { name: "CRM Sync", status: "degraded", description: "Delayed by ~2 min" },
]

export interface SystemAlert {
  id: string
  message: string
  time: string
  severity: "warning" | "error"
}

export const systemAlerts: SystemAlert[] = [
  { id: "1", message: "CRM sync delayed: 2 records pending", time: "12 min ago", severity: "warning" },
  { id: "2", message: "SMS delivery rate dropped to 97.1% briefly", time: "1 hr ago", severity: "warning" },
]
