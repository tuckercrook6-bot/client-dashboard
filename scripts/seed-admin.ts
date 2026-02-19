/**
 * One-time: create a user and assign them to all clients.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Run: npx tsx scripts/seed-admin.ts <email> <password>
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error("Usage: npx tsx scripts/seed-admin.ts <email> <password>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) {
    console.error("Create user failed:", userError.message);
    process.exit(1);
  }
  if (!user.user) {
    console.error("No user returned");
    process.exit(1);
  }

  const { data: clients } = await supabase.from("clients").select("id");
  if (!clients?.length) {
    console.log("User created. No clients in DB; add user_clients rows in Supabase.");
    process.exit(0);
  }

  const rows = clients.map((c) => ({ user_id: user.user!.id, client_id: c.id }));
  const { error: linkError } = await supabase.from("user_clients").insert(rows);
  if (linkError) {
    console.error("Link to clients failed:", linkError.message);
    process.exit(1);
  }
  console.log("Done. User created and assigned to", clients.length, "client(s). Sign in at /login");
}

main();
