"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserClient, CurrentUser } from "@/lib/dashboard";

export function AdminHeader({ clients: _clients, user }: { clients: UserClient[]; user: CurrentUser | null }) {
  const displayName = user?.displayName ?? "User";
  const email = user?.email ?? "";
  const initials = user?.initials ?? "U";

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-zinc-950/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-base font-semibold text-foreground">Admin</h1>
        <p className="text-xs text-muted-foreground">Team overview & client management</p>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="User menu"
            >
              <Avatar className="size-8 border border-border">
                <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-border bg-card text-foreground"
          >
            <DropdownMenuLabel className="text-muted-foreground">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="text-muted-foreground focus:bg-muted focus:text-foreground">
              <Link href="/dashboard">
                <User className="mr-2 size-4" />
                Client portal (KPIs)
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <form action="/auth/logout" method="POST">
              <DropdownMenuItem
                variant="destructive"
                asChild
                className="focus:bg-red-500/10 focus:text-red-400"
              >
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
  );
}
