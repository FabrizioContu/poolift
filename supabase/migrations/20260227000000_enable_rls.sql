-- ============================================================
-- Phase 6: Enable Row-Level Security — Validation Phase
-- ============================================================
-- Current state: RLS enabled on all tables.
--
-- VALIDATION PHASE DESIGN:
--   - Group tables (groups, families, parties, birthdays, etc.)
--     remain permissive via pre-existing "Anyone can..." policies.
--     Anonymous users can create groups, join, and access all data.
--     App-layer validation in lib/validators.ts handles business rules.
--
--   - direct_gifts: properly secured — only the organizer (matched by
--     organizer_user_id = auth.uid()) can mutate their own gift.
--     Anonymous organizers (organizer_user_id IS NULL) are also supported.
--
-- WHEN READY FOR FULL RLS (after market validation):
--   1. Create lib/supabase/admin.ts with SUPABASE_SERVICE_ROLE_KEY
--   2. Migrate all API routes from singleton lib/supabase.ts to createAdminClient()
--   3. Re-enable the restrictive policies for group tables below
--   4. Drop all "Anyone can..." policies from the Supabase dashboard
-- ============================================================

-- ── Helper (kept for future use) ─────────────────────────────
-- Returns group_ids the authenticated user belongs to
CREATE OR REPLACE FUNCTION auth_user_group_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT group_id
  FROM families
  WHERE user_id = auth.uid()
$$;

-- ── Enable RLS on all tables ──────────────────────────────────
-- Group tables: RLS on, but permissive "Anyone can..." policies handle access
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_celebrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- ── direct_gifts: organizer ownership ────────────────────────
ALTER TABLE direct_gifts
  ADD COLUMN IF NOT EXISTS organizer_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_direct_gifts_organizer_user_id
  ON direct_gifts(organizer_user_id);

ALTER TABLE direct_gifts ENABLE ROW LEVEL SECURITY;

-- Anyone can read (share_code is the access token)
CREATE POLICY "direct_gifts_select" ON direct_gifts
  FOR SELECT USING (true);

-- Anyone can create (anon organizers supported)
CREATE POLICY "direct_gifts_insert" ON direct_gifts
  FOR INSERT WITH CHECK (true);

-- Organizer can update: anon gift (IS NULL) OR matching user
CREATE POLICY "direct_gifts_update" ON direct_gifts
  FOR UPDATE
  USING (
    organizer_user_id IS NULL
    OR organizer_user_id = auth.uid()
  );

-- Only the linked organizer can delete
CREATE POLICY "direct_gifts_delete" ON direct_gifts
  FOR DELETE
  USING (organizer_user_id = auth.uid());

-- ── direct_gift_participants: open (anon participation) ───────
ALTER TABLE direct_gift_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_select" ON direct_gift_participants
  FOR SELECT USING (true);

CREATE POLICY "participants_insert" ON direct_gift_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "participants_delete" ON direct_gift_participants
  FOR DELETE USING (true);

-- ── FUTURE: Restrictive policies for group tables ─────────────
-- Uncomment and apply these after migrating API routes to admin client.
--
-- CREATE POLICY "groups_select" ON groups
--   FOR SELECT USING (id IN (SELECT auth_user_group_ids()));
-- ... (see git history for full policy set)
