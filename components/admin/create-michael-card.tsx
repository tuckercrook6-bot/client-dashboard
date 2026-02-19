"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function CreateMichaelCard() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; temporaryPassword?: string; error?: string } | null>(null);

  async function handleCreate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/create-michael", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password.length >= 6 ? { password } : {}),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setResult({ ok: false, message: "", error: data.error ?? "Request failed" });
    } catch (e) {
      setResult({ ok: false, message: "", error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-5 shadow-sm ring-1 ring-zinc-800/50">
      <h3 className="font-semibold text-white">Team admin</h3>
      <p className="mt-0.5 text-xs text-zinc-500">Create michael@lowcoresystems.com in Supabase (one-time).</p>
      <input
        type="password"
        placeholder="Same password (min 6 chars) or leave blank for random"
        className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        onClick={handleCreate}
        disabled={loading}
      >
        <UserPlus className="mr-2 size-4" />
        {loading ? "Creating…" : "Create Michael account"}
      </Button>
      {result && (
        <div className="mt-3 rounded-lg bg-zinc-800/60 p-3 text-sm">
          {result.ok ? (
            <>
              <p className="text-zinc-200">{result.message}</p>
              {result.temporaryPassword && (
                <p className="mt-2 font-mono text-amber-400">
                  One-time password: {result.temporaryPassword}
                </p>
              )}
            </>
          ) : (
            <p className="text-red-400">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
