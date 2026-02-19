import { createClient } from "@/lib/supabase/server";

export type UserClient = { id: string; name: string };

export type CurrentUser = { email: string; displayName: string; initials: string };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email.split("@")[0];
  const displayName = name.includes("@") ? name : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  const initials =
    (user.user_metadata?.full_name as string)?.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase() ||
    (displayName.slice(0, 2).toUpperCase());
  return { email: user.email, displayName, initials };
}

export async function getUserClients(): Promise<UserClient[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_clients")
    .select("client_id, clients(id, name)")
    .eq("user_id", user.id);

  if (!data) return [];
  return data
    .map((r: { client_id: string; clients: { id: string; name: string } | { id: string; name: string }[] | null }) => {
      const c = Array.isArray(r.clients) ? r.clients[0] : r.clients;
      return c ? { id: c.id, name: c.name } : null;
    })
    .filter((c): c is UserClient => c !== null);
}
