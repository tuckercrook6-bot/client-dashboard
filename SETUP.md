# Setup: RLS + user_clients

Do these once after cloning / before production.

## 1. Run the RLS migration (one command)

Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if needed, then link and push:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

(`YOUR_PROJECT_REF` is in Supabase Dashboard → Project Settings → General.)

**Or** run the SQL by hand: Supabase Dashboard → SQL Editor → paste contents of `supabase/migrations/00001_rls_recommended.sql` → Run.

## 2. Seed your first user → client mapping

1. In Supabase: **Authentication** → **Users** → copy one user’s **UUID** (`id`).
2. In Supabase: **Table Editor** → `clients` → copy one client’s **id** (UUID).
3. In the SQL Editor run (replace the UUIDs):

```sql
INSERT INTO user_clients (user_id, client_id)
VALUES (
  'PASTE_USER_UUID_HERE'::uuid,
  'PASTE_CLIENT_UUID_HERE'::uuid
)
ON CONFLICT (user_id, client_id) DO NOTHING;
```

## 3. Run the app and test

```bash
npm run dev
```

- Open http://localhost:3000/dashboard → should redirect to login if not signed in.
- Sign in (email/password or magic link).
- You should be redirected to the first client’s dashboard or to “No clients assigned” if the seed wasn’t run.
