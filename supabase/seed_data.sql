-- SEED: Ensure one client exists and (optionally) link existing auth users to it.
-- Run this in Supabase Dashboard → SQL Editor AFTER run-all-migrations.sql.
--
-- 1. Insert a default client if the table is empty
INSERT INTO public.clients (name)
SELECT 'Lowcore'
WHERE NOT EXISTS (SELECT 1 FROM public.clients LIMIT 1);

-- 2. Backfill organizations from clients (if organizations table exists)
INSERT INTO public.organizations (id, name)
SELECT c.id, c.name FROM public.clients c
ON CONFLICT (id) DO NOTHING;

-- 3. Link ALL existing auth users to ALL clients (so they can see the dashboard)
--    Skip if user_clients already has rows for this user+client
INSERT INTO public.user_clients (user_id, client_id)
SELECT u.id, c.id
FROM auth.users u
CROSS JOIN public.clients c
ON CONFLICT (user_id, client_id) DO NOTHING;

-- Done. New signups will auto-link via the trigger; this fixes users created when clients was empty.

-- 4. Ensure change_requests table exists (for Request Changes modal)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'change_requests') THEN
    CREATE TABLE change_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );
    CREATE INDEX idx_change_requests_client_id ON change_requests(client_id);
    CREATE INDEX idx_change_requests_created_at ON change_requests(created_at DESC);
    ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can insert own change_requests" ON change_requests FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can read own change_requests" ON change_requests FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;
