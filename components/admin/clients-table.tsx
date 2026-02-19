import Link from "next/link";
import type { ClientWithUsage } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function ClientsTable({ clients }: { clients: ClientWithUsage[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h3 className="font-semibold text-white">Clients overview</h3>
        <p className="text-xs text-zinc-500">View KPIs in the client portal</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Client</th>
              <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Plan</th>
              <th className="px-5 py-3.5 text-left font-medium text-zinc-400">Status</th>
              <th className="px-5 py-3.5 text-right font-medium text-zinc-400">Usage (month)</th>
              <th className="px-5 py-3.5 text-right font-medium text-zinc-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                  No clients assigned.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-zinc-800/80 last:border-0 transition-colors hover:bg-zinc-800/30"
                >
                  <td className="px-5 py-3.5 font-medium text-white">{client.name}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{client.plan}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={client.status === "Active" ? "default" : "secondary"}
                      className={
                        client.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : ""
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-zinc-300">
                    {client.usageThisMonth}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white">
                      <Link href={`/dashboard/${client.id}`} className="gap-1.5">
                        View
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
