-- Add missing UPDATE policy for participants (group gifts).
-- The table had SELECT/INSERT/DELETE policies but no UPDATE,
-- so marking a family as paid was silently blocked by RLS
-- (returned empty → 404 → optimistic UI reverted to "Pendiente").
-- Mirror of the fix applied to direct_gift_participants.

CREATE POLICY "participants_update" ON participants
  FOR UPDATE USING (true);
