"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Search, LogOut, User, CreditCard, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  const displayName = user?.displayName ?? "User";
  const email = user?.email ?? "";
  const initials = user?.initials ?? "U";
  const pathname = usePathname()
  const match = pathname.match(/^\/dashboard\/([a-f0-9-]+)$/i)
  const currentClientId = match?.[1]
  const currentClient = clients.find((c) => c.id === currentClientId)

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-6 backdrop-blur">
      <div className="flex items-center gap-6">
        {clients.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700">
                {currentClient?.name ?? "Select client"}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-zinc-800 bg-zinc-900">
              {clients.map((c) => (
                <DropdownMenuItem key={c.id} asChild className="text-zinc-200 focus:bg-zinc-800">
                  <Link href={`/dashboard/${c.id}`}>{c.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : clients.length === 1 ? (
          <span className="text-sm font-medium text-white">{clients[0].name}</span>
        ) : null}
        <div>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-zinc-500">Welcome back</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" aria-label="Search">
          <Search className="size-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white" aria-label="Notifications">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2 flex items-center gap-2 rounded-full px-2" aria-label="User menu">
              <Avatar className="size-8">
                <AvatarFallback className="bg-zinc-700 text-zinc-200 text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium text-white md:inline-block">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-zinc-500">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                <CreditCard className="mr-2 size-4" />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <form action="/auth/logout" method="POST">
              <DropdownMenuItem variant="destructive" asChild className="focus:bg-red-500/20 focus:text-red-400">
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
