import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEnv, getEnvRequired } from "@/lib/env";

/**
 * Service-role Supabase client. Use ONLY in API routes or server-only code.
 * Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Throws if env is missing (server-only; never imported by client).
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = getEnvRequired("NEXT_PUBLIC_SUPABASE_URL");
  const key = getEnvRequired("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}
