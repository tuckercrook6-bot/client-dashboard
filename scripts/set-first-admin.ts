/**
 * Set the first user (or user by email) as admin.
 * Loads .env.local. Run from repo root: npx tsx scripts/set-first-admin.ts [email]
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadEnvLocal() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const content = readFileSync(p, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const emailArg = process.argv[2];

async function main() {
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error("List users failed:", listError.message);
    process.exit(1);
  }
  if (!users?.length) {
    console.error("No users in auth. Sign up first at /signup.");
    process.exit(1);
  }

  const target = emailArg
    ? users.find((u) => u.email?.toLowerCase() === emailArg.toLowerCase())
    : users[0];
  if (!target) {
    console.error("User not found:", emailArg);
    process.exit(1);
  }

  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
  const orgId = orgs?.[0]?.id;
  if (!orgId) {
    const { data: clients } = await supabase.from("clients").select("id").limit(1);
    const cid = (clients as { id: string }[])?.[0]?.id;
    if (!cid) {
      console.error("No organizations or clients. Create a client first in Supabase.");
      process.exit(1);
    }
    await supabase.from("memberships").upsert(
      { user_id: target.id, organization_id: cid, role: "admin" },
      { onConflict: "user_id,organization_id" }
    );
    console.log("Admin set:", target.email, "(membership created with first client as org)");
    return;
  }

  const { data: existing } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", target.id)
    .limit(1)
    .single();

  if (existing) {
    const { error: upError } = await supabase
      .from("memberships")
      .update({ role: "admin" })
      .eq("user_id", target.id);
    if (upError) {
      console.error("Update failed:", upError.message);
      process.exit(1);
    }
    console.log("Admin set:", target.email);
  } else {
    const { error: insError } = await supabase
      .from("memberships")
      .insert({ user_id: target.id, organization_id: orgId, role: "admin" });
    if (insError) {
      console.error("Insert membership failed:", insError.message);
      process.exit(1);
    }
    console.log("Admin set:", target.email, "(new membership with first org)");
  }
}

main();
