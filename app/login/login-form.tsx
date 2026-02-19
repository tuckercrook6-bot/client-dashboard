"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: useMagicLink ? undefined : password,
          magicLink: useMagicLink,
          next: next ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed");
        return;
      }
      if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
        return;
      }
      if (data.message?.includes("Check your email")) {
        setError("Check your email for the magic link.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
      </div>
      {!useMagicLink && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!useMagicLink}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}
      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : useMagicLink ? "Send magic link" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => setUseMagicLink(!useMagicLink)}
          className="w-full text-xs text-gray-500 hover:text-black underline"
        >
          {useMagicLink ? "Use email and password instead" : "Sign in with magic link instead"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
