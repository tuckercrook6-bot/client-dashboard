-- RLS RECOMMENDED POLICIES
-- Run these in Supabase SQL Editor after enabling auth.
-- CRITICAL: Enable RLS on clients and events BEFORE production.

-- 1. Enable RLS on tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 2. Create user_clients junction (if not exists)
-- Maps auth.users to which clients they can access
CREATE TABLE IF NOT EXISTS user_clients (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, client_id)
);

ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_clients"
  ON user_clients FOR SELECT
  USING (user_id = auth.uid());

-- 3. clients: users can read only clients they're assigned to
CREATE POLICY "Users can read assigned clients"
  ON clients FOR SELECT
  USING (
    id IN (
      SELECT client_id FROM user_clients
      WHERE user_id = auth.uid()
    )
  );

-- 4. events: users can read only events for clients they're assigned to
CREATE POLICY "Users can read events for assigned clients"
  ON events FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_clients
      WHERE user_id = auth.uid()
    )
  );

-- 5. Service role bypasses RLS (API routes use service role)
-- No policy needed for service role; it bypasses RLS by default.
