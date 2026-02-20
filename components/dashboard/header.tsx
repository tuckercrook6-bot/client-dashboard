"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, LogOut, User, CreditCard, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserClient, CurrentUser } from "@/lib/dashboard"

export function DashboardHeader({ clients, user }: { clients: UserClient[]; user: CurrentUser | null }) {
  const displayName = user?.displayName ?? "User"
  const email = user?.email ?? ""
  const initials = user?.initials ?? "U"
  const pathname = usePathname()
  const match = pathname.match(/^\/dashboard\/([a-f0-9-]+)$/i)
  const currentClientId = match?.[1]
  const currentClient = clients.find((c) => c.id === currentClientId)
  const businessName = currentClient?.name ?? (clients[0]?.name ?? "Dashboard")

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        {clients.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5 px-2 text-foreground font-semibold text-sm">
                {businessName}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Switch location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {clients.map((c) => (
                <DropdownMenuItem key={c.id} asChild>
                  <Link href={`/dashboard/${c.id}`}>{c.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : clients.length === 1 ? (
          <span className="text-sm font-semibold text-foreground">{clients[0].name}</span>
        ) : (
          <span className="text-sm font-semibold text-foreground">Dashboard</span>
        )}
        <div className="h-5 w-px bg-border" />
        <Badge variant="outline" className="border-success/30 bg-success/10 text-success gap-1.5 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-success" />
          Systems Online
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-full px-1.5 h-8" aria-label="User menu">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem><User className="mr-2 size-4" />Profile</DropdownMenuItem>
              <DropdownMenuItem><CreditCard className="mr-2 size-4" />Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action="/auth/logout" method="POST">
              <DropdownMenuItem variant="destructive" asChild>
                <button type="submit" className="flex w-full items-center">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default DashboardHeader
