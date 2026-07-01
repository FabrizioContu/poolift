-- Editing a "Propuesta de regalo" replaces its items (delete existing + insert
-- new). proposal_items had only INSERT/SELECT policies, so the DELETE was
-- silently blocked by RLS, duplicating items on edit.
--
-- Validation phase: mirror the existing permissive "Anyone can..." policies.

CREATE POLICY "Anyone can delete proposal_items"
  ON public.proposal_items FOR DELETE
  TO public
  USING (true);
