-- RLS for MVP tables. Default deny; key by organization_id and/or user_id.
-- Admin role can read all org data.

-- Helper: user's org ids (as member)
-- Helper: is app admin (has any membership with role = admin)
-- We use inline subqueries in policies for clarity.

-- 1. organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read orgs they belong to"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can read all orgs"
  ON organizations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 2. profiles (own profile only)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 3. memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own memberships"
  ON memberships FOR SELECT
  USING (user_id = auth.uid());

-- Service role / backend can insert/update memberships (no policy = deny for anon; use service role in API)

-- 4. pipeline_stages (global read for all authenticated)
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read pipeline_stages"
  ON pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

-- 5. leads (org-scoped; admin can read all)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read leads for their orgs"
  ON leads FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can read all leads"
  ON leads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert leads for their orgs"
  ON leads FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update leads for their orgs"
  ON leads FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- 6. calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read calls for their orgs"
  ON calls FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can read all calls"
  ON calls FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 7. call_artifacts (via call ownership)
ALTER TABLE call_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read call_artifacts for their orgs"
  ON call_artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calls c
      WHERE c.id = call_artifacts.call_id
      AND c.organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can read all call_artifacts"
  ON call_artifacts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 8. sms_messages
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read sms for their orgs"
  ON sms_messages FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can read all sms_messages"
  ON sms_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Note: events table RLS already in 00001 (client_id = org id). If using organizations only, ensure
-- events.client_id matches organizations.id or add events.organization_id in a later migration.
