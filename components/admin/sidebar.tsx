"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ChevronLeft, ChevronRight, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Clients", icon: Users, href: "/admin/clients" },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-zinc-800/90 bg-zinc-900/90 backdrop-blur-sm transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800/90 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-700/50">
            <Zap className="size-4" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-white">
              Lowcore Admin
            </span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3" role="navigation" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const linkContent = (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={item.label}>{linkContent}</div>;
          })}

          {!collapsed && (
            <div className="mt-4 border-t border-zinc-800 pt-3">
              <Link
                href="/dashboard/portal"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              >
                <ExternalLink className="size-[18px] shrink-0" />
                Client portal
              </Link>
            </div>
          )}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/portal"
                  className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                >
                  <ExternalLink className="size-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Client portal
              </TooltipContent>
            </Tooltip>
          )}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
