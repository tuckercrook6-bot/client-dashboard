import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEnv, missingEnvKeys } from "@/lib/env";

/**
 * Browser/safe Supabase client using anon key only.
 * Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * If env is missing, returns null and console.warn in dev (no crash).
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL")?.trim();
  const key = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")?.trim();

  if (!url || !key) {
    if (process.env.NODE_ENV === "development") {
      const missing = missingEnvKeys([
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ]);
      console.warn(
        "[Supabase] Missing env for browser client. Keys:",
        missing.join(", ")
      );
      return null;
    }
    return null;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
