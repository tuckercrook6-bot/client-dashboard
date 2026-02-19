import "server-only";
import { getEnv } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

/** Single source of truth: admin always goes to /admin. */
export const ADMIN_EMAIL = "tucker@lowcoresystems.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return typeof email === "string" && email.trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * Resolves current user's app role.
 * Admin if: email is the designated admin email, or any membership has role = 'admin'. Otherwise client.
 */
export async function getRoleForUserId(userId: string, email?: string | null): Promise<"admin" | "client"> {
  if (isAdminEmail(email)) return "admin";
  try {
    const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return "client";
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data } = await supabase.from("memberships").select("role").eq("user_id", userId);
    const roles = (data ?? []) as { role: string }[];
    if (roles.some((r) => r.role === "admin")) return "admin";
    return "client";
  } catch {
    return "client";
  }
}

/**
 * Default redirect path after login: admin -> /admin, client -> /dashboard
 */
export function getDefaultRedirectForRole(role: "admin" | "client"): string {
  return role === "admin" ? "/admin" : "/dashboard";
}
