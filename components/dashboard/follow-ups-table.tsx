"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FollowUp } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface FollowUpsTableProps {
  data: FollowUp[]
}

const statusStyle: Record<FollowUp["status"], string> = {
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
  Today: "bg-primary/10 text-primary border-primary/20",
  Upcoming: "bg-muted text-muted-foreground border-border",
}

export function FollowUpsTable({ data }: FollowUpsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const filtered = data.filter((f) => {
    const matchesSearch = f.lead.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || f.status === statusFilter
    const matchesChannel = channelFilter === "all" || f.channel === channelFilter
    return matchesSearch && matchesStatus && matchesChannel
  })

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-semibold">Open Follow-ups</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 pl-8 text-xs w-36" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs pl-6">Lead</TableHead>
              <TableHead className="text-xs">Channel</TableHead>
              <TableHead className="text-xs">Last Touch</TableHead>
              <TableHead className="text-xs">Next Action</TableHead>
              <TableHead className="text-xs">Owner</TableHead>
              <TableHead className="text-xs pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">No follow-ups found</TableCell>
              </TableRow>
            ) : (
              filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-xs font-medium pl-6">{f.lead}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">{f.channel}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.lastTouch}</TableCell>
                  <TableCell className="text-xs">{f.nextAction}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{f.owner}</Badge></TableCell>
                  <TableCell className="pr-6">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-normal", statusStyle[f.status])}>{f.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
