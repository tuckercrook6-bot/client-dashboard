-- MVP Schema: organizations, profiles, memberships, leads, pipeline_stages, calls, call_artifacts, sms_messages
-- Keeps existing clients/events; organizations backfilled from clients for compatibility.

-- 1. Organizations (client businesses) - backfill from existing clients if present
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Backfill from clients if table exists (run after 00001/00002)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    INSERT INTO organizations (id, name)
    SELECT id, name FROM public.clients
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Memberships (user <-> org, role: admin | client)
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

-- Backfill memberships from user_clients if present
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

-- 4. Pipeline stages (global defaults)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO pipeline_stages (name, sort_order) VALUES
  ('New', 0),
  ('Contacted', 1),
  ('Scheduled', 2),
  ('Won', 3),
  ('Lost', 4)
ON CONFLICT (name) DO NOTHING;

-- 5. Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage_id ON leads(pipeline_stage_id);

-- 6. Calls (Retell)
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON calls(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_external_id ON calls(external_id) WHERE external_id IS NOT NULL;

-- 7. Call artifacts (transcript, summary, recording)
CREATE TABLE IF NOT EXISTS call_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  content TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_call_artifacts_call_id ON call_artifacts(call_id);

-- 8. SMS messages (Twilio)
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_phone TEXT,
  to_phone TEXT,
  body TEXT,
  external_id TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_organization_id ON sms_messages(organization_id);

-- 9. Events (audit/activity) - ensure table exists with client_id; we use client_id as org identifier
-- Existing 00001 already has events; no change if present.
-- If events doesn't exist, create minimal version for webhooks:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID,
      type TEXT NOT NULL,
      source TEXT,
      occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      payload JSONB
    );
    CREATE INDEX idx_events_client_id ON events(client_id);
    CREATE INDEX idx_events_occurred_at ON events(occurred_at);
  END IF;
END $$;
