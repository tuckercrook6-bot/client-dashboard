import Link from "next/link";
import type { ClientWithUsage } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function ClientsTable({ clients }: { clients: ClientWithUsage[] }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-semibold text-foreground">Clients overview</h3>
        <p className="text-xs text-muted-foreground">View KPIs in the client portal</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3.5 text-right font-medium text-muted-foreground">Usage (month)</th>
              <th className="px-5 py-3.5 text-right font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  No clients assigned.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">{client.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{client.plan}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={client.status === "Active" ? "default" : "secondary"}
                      className={
                        client.status === "Active"
                          ? "bg-success/20 text-success border-success/30"
                          : ""
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-foreground">
                    {client.usageThisMonth}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
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
