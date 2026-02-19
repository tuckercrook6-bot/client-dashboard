# Supabase migrations

## 1. Run all migrations (one shot)

1. Open **Supabase Dashboard** → your project → **SQL Editor**.
2. Copy the entire contents of **`supabase/run-all-migrations.sql`**.
3. Paste into a new query and click **Run**.

This creates/updates: `clients`, `events`, `user_clients`, RLS, trigger, `organizations`, `profiles`, `memberships`, `pipeline_stages`, `leads`, `calls`, `call_artifacts`, `sms_messages`, and all RLS policies.

## 2. Set first admin

**Option A – Script (recommended)**  
From the project root (where `.env.local` lives):

```bash
npx tsx scripts/set-first-admin.ts
```

This sets the **first** auth user as admin. To set a specific user by email:

```bash
npx tsx scripts/set-first-admin.ts you@example.com
```

**Option B – SQL**  
In SQL Editor:

```sql
-- Replace with the auth user id (Supabase → Authentication → Users)
UPDATE memberships SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
```

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` – required for app and middleware
- `SUPABASE_SERVICE_ROLE_KEY` – required for auth role resolution (login redirect) and webhooks (Retell, Twilio, Zapier)
- `RETELL_WEBHOOK_SECRET` – optional; if set, Retell webhook requests must send it in `x-retell-secret` or `Authorization: Bearer <secret>`
- `TWILIO_WEBHOOK_SECRET` – optional; if set, Twilio webhook requests must send it in `x-twilio-webhook-secret` or `x-webhook-secret`
