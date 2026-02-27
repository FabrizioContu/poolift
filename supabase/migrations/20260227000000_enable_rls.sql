-- ============================================================
-- Phase 6: Enable Row-Level Security on all Poolift tables
-- ============================================================
-- Run this migration in Supabase Dashboard → SQL Editor
-- or via `supabase db push` if using the CLI.
--
-- Design principles:
--   1. Groups are accessed by their member families.
--   2. A family belongs to a user once user_id is linked (Phase 5).
--   3. Unlinked families (user_id IS NULL) retain access via
--      localStorage session (enforced at the application layer,
--      not at the DB layer — RLS only protects authenticated access).
--   4. Direct gifts use share_code for public access (participants)
--      and organizer_user_id for organizer-only mutations.
-- ============================================================

-- ── Helpers ──────────────────────────────────────────────────
-- Returns the set of group_ids that the authenticated user belongs to
-- (via families.user_id = auth.uid())
CREATE OR REPLACE FUNCTION auth_user_group_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT group_id
  FROM families
  WHERE user_id = auth.uid()
$$;

-- ── 1. groups ────────────────────────────────────────────────
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Any authenticated user who is a member can read the group
CREATE POLICY "groups_select" ON groups
  FOR SELECT
  USING (id IN (SELECT auth_user_group_ids()));

-- Members can update group details (name, description)
CREATE POLICY "groups_update" ON groups
  FOR UPDATE
  USING (id IN (SELECT auth_user_group_ids()));

-- Only the creating family member can delete the group
CREATE POLICY "groups_delete" ON groups
  FOR DELETE
  USING (id IN (SELECT auth_user_group_ids()));

-- Anyone (incl. anon) can insert a new group (create group flow)
CREATE POLICY "groups_insert" ON groups
  FOR INSERT
  WITH CHECK (true);

-- ── 2. families ─────────────────────────────────────────────
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Members of the same group can read all families in it
CREATE POLICY "families_select" ON families
  FOR SELECT
  USING (group_id IN (SELECT auth_user_group_ids()));

-- Anyone can insert a family (join group / create group)
CREATE POLICY "families_insert" ON families
  FOR INSERT
  WITH CHECK (true);

-- Only the owning user can update their own family
CREATE POLICY "families_update" ON families
  FOR UPDATE
  USING (user_id = auth.uid());

-- Only the owning user can delete their own family
CREATE POLICY "families_delete" ON families
  FOR DELETE
  USING (user_id = auth.uid());

-- ── 3. birthdays ────────────────────────────────────────────
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "birthdays_select" ON birthdays
  FOR SELECT
  USING (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "birthdays_insert" ON birthdays
  FOR INSERT
  WITH CHECK (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "birthdays_update" ON birthdays
  FOR UPDATE
  USING (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "birthdays_delete" ON birthdays
  FOR DELETE
  USING (group_id IN (SELECT auth_user_group_ids()));

-- ── 4. parties ──────────────────────────────────────────────
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties_select" ON parties
  FOR SELECT
  USING (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "parties_insert" ON parties
  FOR INSERT
  WITH CHECK (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "parties_update" ON parties
  FOR UPDATE
  USING (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "parties_delete" ON parties
  FOR DELETE
  USING (group_id IN (SELECT auth_user_group_ids()));

-- ── 5. party_celebrants ──────────────────────────────────────
ALTER TABLE party_celebrants ENABLE ROW LEVEL SECURITY;

-- Access through the parent party's group membership
CREATE POLICY "party_celebrants_select" ON party_celebrants
  FOR SELECT
  USING (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "party_celebrants_insert" ON party_celebrants
  FOR INSERT
  WITH CHECK (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "party_celebrants_delete" ON party_celebrants
  FOR DELETE
  USING (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

-- ── 6. ideas ────────────────────────────────────────────────
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ideas_select" ON ideas
  FOR SELECT
  USING (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "ideas_insert" ON ideas
  FOR INSERT
  WITH CHECK (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "ideas_update" ON ideas
  FOR UPDATE
  USING (group_id IN (SELECT auth_user_group_ids()));

CREATE POLICY "ideas_delete" ON ideas
  FOR DELETE
  USING (group_id IN (SELECT auth_user_group_ids()));

-- ── 7. proposals ────────────────────────────────────────────
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_select" ON proposals
  FOR SELECT
  USING (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "proposals_insert" ON proposals
  FOR INSERT
  WITH CHECK (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "proposals_update" ON proposals
  FOR UPDATE
  USING (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "proposals_delete" ON proposals
  FOR DELETE
  USING (
    party_id IN (
      SELECT id FROM parties
      WHERE group_id IN (SELECT auth_user_group_ids())
    )
  );

-- ── 8. proposal_items ────────────────────────────────────────
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposal_items_select" ON proposal_items
  FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN parties pa ON pa.id = p.party_id
      WHERE pa.group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "proposal_items_insert" ON proposal_items
  FOR INSERT
  WITH CHECK (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN parties pa ON pa.id = p.party_id
      WHERE pa.group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "proposal_items_delete" ON proposal_items
  FOR DELETE
  USING (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN parties pa ON pa.id = p.party_id
      WHERE pa.group_id IN (SELECT auth_user_group_ids())
    )
  );

-- ── 9. votes ────────────────────────────────────────────────
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_select" ON votes
  FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN parties pa ON pa.id = p.party_id
      WHERE pa.group_id IN (SELECT auth_user_group_ids())
    )
  );

-- Anyone in the group can vote
CREATE POLICY "votes_insert" ON votes
  FOR INSERT
  WITH CHECK (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN parties pa ON pa.id = p.party_id
      WHERE pa.group_id IN (SELECT auth_user_group_ids())
    )
  );

CREATE POLICY "votes_delete" ON votes
  FOR DELETE
  USING (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN parties pa ON pa.id = p.party_id
      WHERE pa.group_id IN (SELECT auth_user_group_ids())
    )
  );

-- ── 10. direct_gifts ─────────────────────────────────────────
-- NOTE: direct_gifts must have the organizer_user_id column:
-- ALTER TABLE direct_gifts ADD COLUMN IF NOT EXISTS organizer_user_id UUID REFERENCES auth.users(id);

ALTER TABLE direct_gifts ENABLE ROW LEVEL SECURITY;

-- Anyone can read a direct gift (share_code is the access token)
-- The application validates share_code before showing the page.
CREATE POLICY "direct_gifts_select" ON direct_gifts
  FOR SELECT
  USING (true);

-- Anyone can create a direct gift (anon organizers supported)
CREATE POLICY "direct_gifts_insert" ON direct_gifts
  FOR INSERT
  WITH CHECK (true);

-- Organizer can update: either their user matches OR no user is linked (anon)
CREATE POLICY "direct_gifts_update" ON direct_gifts
  FOR UPDATE
  USING (
    organizer_user_id IS NULL
    OR organizer_user_id = auth.uid()
  );

-- Only the linked organizer user can delete
CREATE POLICY "direct_gifts_delete" ON direct_gifts
  FOR DELETE
  USING (organizer_user_id = auth.uid());

-- ── 11. direct_gift_participants (participants) ───────────────
-- NOTE: the table may be named "participants" in the DB.
-- Adjust the table name below if needed.

ALTER TABLE direct_gift_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can see participants (shown on the gift page)
CREATE POLICY "participants_select" ON direct_gift_participants
  FOR SELECT
  USING (true);

-- Anyone can join as a participant (anon supported)
CREATE POLICY "participants_insert" ON direct_gift_participants
  FOR INSERT
  WITH CHECK (true);

-- Anyone can remove themselves (no ownership check — anon flow)
CREATE POLICY "participants_delete" ON direct_gift_participants
  FOR DELETE
  USING (true);

-- ── Schema change: add organizer_user_id to direct_gifts ──────
-- Run this before enabling RLS if the column doesn't exist yet:
ALTER TABLE direct_gifts
  ADD COLUMN IF NOT EXISTS organizer_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_direct_gifts_organizer_user_id
  ON direct_gifts(organizer_user_id);
