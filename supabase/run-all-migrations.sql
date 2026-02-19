-- Run this entire file in Supabase Dashboard → SQL Editor (one shot).
-- If you don't have "clients" or "events" yet, run this first (optional):
CREATE TABLE IF NOT EXISTS clients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  type TEXT NOT NULL,
  source TEXT,
  occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  payload JSONB
);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);

-- ========== 00001 RLS ==========
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS user_clients (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, client_id)
);
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own user_clients" ON user_clients;
CREATE POLICY "Users can read own user_clients"
  ON user_clients FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read assigned clients" ON clients;
CREATE POLICY "Users can read assigned clients"
  ON clients FOR SELECT
  USING (
    id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can read events for assigned clients" ON events;
CREATE POLICY "Users can read events for assigned clients"
  ON events FOR SELECT
  USING (
    client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
  );

-- ========== 00002 trigger ==========
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_clients (user_id, client_id)
  SELECT NEW.id, c.id FROM public.clients c;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ========== 00003 MVP schema ==========
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    INSERT INTO organizations (id, name)
    SELECT id, name FROM public.clients
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, organization_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_clients') THEN
    INSERT INTO memberships (user_id, organization_id, role)
    SELECT uc.user_id, uc.client_id, 'client'
    FROM public.user_clients uc
    WHERE EXISTS (SELECT 1 FROM organizations o WHERE o.id = uc.client_id)
    ON CONFLICT (user_id, organization_id) DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);
INSERT INTO pipeline_stages (name, sort_order) VALUES
  ('New', 0), ('Contacted', 1), ('Scheduled', 2), ('Won', 3), ('Lost', 4)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  name TEXT, email TEXT, phone TEXT, source TEXT, raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage_id ON leads(pipeline_stage_id);

CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id TEXT, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ, raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON calls(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_external_id ON calls(external_id) WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS call_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, content TEXT, recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_call_artifacts_call_id ON call_artifacts(call_id);

CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_phone TEXT, to_phone TEXT, body TEXT, external_id TEXT, raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sms_messages_organization_id ON sms_messages(organization_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID, type TEXT NOT NULL, source TEXT,
      occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL, payload JSONB
    );
    CREATE INDEX idx_events_client_id ON events(client_id);
    CREATE INDEX idx_events_occurred_at ON events(occurred_at);
  END IF;
END $$;

-- ========== 00004 MVP RLS ==========
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read orgs they belong to" ON organizations;
CREATE POLICY "Users can read orgs they belong to" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can read all orgs" ON organizations;
CREATE POLICY "Admins can read all orgs" ON organizations FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own memberships" ON memberships;
CREATE POLICY "Users can read own memberships" ON memberships FOR SELECT USING (user_id = auth.uid());

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read pipeline_stages" ON pipeline_stages;
CREATE POLICY "Authenticated users can read pipeline_stages" ON pipeline_stages FOR SELECT TO authenticated USING (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read leads for their orgs" ON leads;
CREATE POLICY "Users can read leads for their orgs" ON leads FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can read all leads" ON leads;
CREATE POLICY "Admins can read all leads" ON leads FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Users can insert leads for their orgs" ON leads;
CREATE POLICY "Users can insert leads for their orgs" ON leads FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can update leads for their orgs" ON leads;
CREATE POLICY "Users can update leads for their orgs" ON leads FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read calls for their orgs" ON calls;
CREATE POLICY "Users can read calls for their orgs" ON calls FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can read all calls" ON calls;
CREATE POLICY "Admins can read all calls" ON calls FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE call_artifacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read call_artifacts for their orgs" ON call_artifacts;
CREATE POLICY "Users can read call_artifacts for their orgs" ON call_artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM calls c WHERE c.id = call_artifacts.call_id
    AND c.organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  ));
DROP POLICY IF EXISTS "Admins can read all call_artifacts" ON call_artifacts;
CREATE POLICY "Admins can read all call_artifacts" ON call_artifacts FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read sms for their orgs" ON sms_messages;
CREATE POLICY "Users can read sms for their orgs" ON sms_messages FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can read all sms_messages" ON sms_messages;
CREATE POLICY "Admins can read all sms_messages" ON sms_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin'));

-- Done. Next: set one user as admin (see README or run set-first-admin script).
