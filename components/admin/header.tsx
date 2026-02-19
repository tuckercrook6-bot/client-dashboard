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
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
      <div>
        <h1 className="text-base font-semibold text-white">Admin</h1>
        <p className="text-xs text-zinc-500">Team overview & client management</p>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full px-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              aria-label="User menu"
            >
              <Avatar className="size-8 border border-zinc-700">
                <AvatarFallback className="bg-zinc-700 text-xs font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100"
          >
            <DropdownMenuLabel className="text-zinc-400">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-zinc-500">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
              <Link href="/dashboard">
                <User className="mr-2 size-4" />
                Client portal (KPIs)
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
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
