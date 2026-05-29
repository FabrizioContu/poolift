-- Add missing UPDATE policy for direct_gift_participants.
-- The table had SELECT/INSERT/DELETE policies but no UPDATE,
-- so marking paid was silently blocked by RLS (returned empty → 404).

CREATE POLICY "participants_update" ON direct_gift_participants
  FOR UPDATE USING (true);
