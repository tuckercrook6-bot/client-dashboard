/**
 * Create michael@lowcoresystems.com in Supabase Auth (same capabilities as other admin).
 * Loads .env.local. Run from repo root: npx tsx scripts/create-michael-admin.ts
 * Uses SHARED_ADMIN_PASSWORD from .env.local if set; otherwise generates a temp password and logs it.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadEnvLocal() {
  const candidates = [
    join(process.cwd(), ".env.local"),
    join(process.cwd(), "..", ".env.local"),
    join(process.cwd(), "client-dashboard-main", ".env.local"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      const content = readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
      return;
    }
  }
}

function randomPassword(length = 16) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const email = "michael@lowcoresystems.com";

async function main() {
  const password = process.env.SHARED_ADMIN_PASSWORD ?? randomPassword();
  if (!process.env.SHARED_ADMIN_PASSWORD) {
    console.log("No SHARED_ADMIN_PASSWORD in .env.local; using a one-time password (see below).");
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes("already been registered") || error.message?.includes("already exists")) {
      console.log("User michael@lowcoresystems.com already exists in Supabase. No change.");
      process.exit(0);
    }
    console.error("Create user failed:", error.message);
    process.exit(1);
  }

  if (!data.user) {
    console.error("No user returned");
    process.exit(1);
  }

  console.log("Created michael@lowcoresystems.com in Supabase Auth.");
  if (!process.env.SHARED_ADMIN_PASSWORD) {
    console.log("One-time password (set in Supabase or have user reset):", password);
  }
}

main();
