"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { UserClient } from "@/lib/dashboard";

export function CopyClientIds({ clients }: { clients: UserClient[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!clients.length) {
    return <p className="text-sm text-muted-foreground">No clients. Run the seed script or add clients in Supabase.</p>;
  }

  return (
    <div className="space-y-2">
      {clients.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
            <code className="text-xs text-muted-foreground">{c.id}</code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => copyId(c.id)}
          >
            {copied === c.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied === c.id ? "Copied" : "Copy ID"}
          </Button>
        </div>
      ))}
    </div>
  );
}
