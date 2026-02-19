/**
 * One-time: create admin user tucker@lowcoresystems.com / Lowcoreadmin1
 * Reads .env.local from project root. Requires SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const envPath = new URL("../.env.local", import.meta.url);
let env = {};
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
} catch (e) {
  console.error("Could not read .env.local");
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = "tucker@lowcoresystems.com";
const password = "Lowcoreadmin1";

if (!url || !serviceKey) {
  console.error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API → service_role)");
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
    if (userError.message.includes("already been registered")) {
      console.log("User already exists. You can sign in at /login with that email and password.");
      return;
    }
    console.error("Create user failed:", userError.message);
    process.exit(1);
  }

  const { data: clients } = await supabase.from("clients").select("id");
  if (clients?.length) {
    const rows = clients.map((c) => ({ user_id: user.user.id, client_id: c.id }));
    await supabase.from("user_clients").insert(rows);
  }
  console.log("Admin user created. Sign in at /login with", email);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
