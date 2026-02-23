-- Change requests from the client dashboard "Request Changes" modal.
CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_change_requests_client_id ON change_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_created_at ON change_requests(created_at DESC);

ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own; service role can read all (for admin).
CREATE POLICY "Users can insert own change_requests"
  ON change_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own change_requests"
  ON change_requests FOR SELECT
  USING (user_id = auth.uid());
