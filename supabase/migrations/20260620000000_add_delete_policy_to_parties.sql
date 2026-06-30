-- Add missing DELETE policies for parties and party_celebrants.
-- RLS is enabled on both tables but only SELECT/INSERT/UPDATE policies
-- existed, so deleting a party was silently blocked by RLS (DELETE
-- affected 0 rows, no error) — the route's post-delete verification then
-- threw "No se pudo eliminar la fiesta. Verifica los permisos en Supabase."
--
-- FKs gifts/party_celebrants/proposals -> parties are ON DELETE CASCADE,
-- so the parties policy alone restores the delete; party_celebrants gets
-- its own policy because the route deletes it explicitly first.
-- Mirrors the validation-phase "Anyone can..." permissive policy pattern;
-- authorization is enforced at the app layer (coordinator check in the route).

CREATE POLICY "Anyone can delete parties" ON parties
  FOR DELETE USING (true);

CREATE POLICY "Anyone can delete party_celebrants" ON party_celebrants
  FOR DELETE USING (true);
