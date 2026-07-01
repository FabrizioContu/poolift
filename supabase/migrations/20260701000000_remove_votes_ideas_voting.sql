-- Simplify the proposal flow: remove voting and the legacy ideas table.
--
-- Product decision: one editable "Propuesta de regalo" per party, no voting,
-- no multiple proposals. The `votes` and `ideas` tables and the
-- `proposals.voting_deadline` column are no longer used by the app.
--
-- Destructive: dropping these tables also removes their RLS policies and grants.

DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.ideas CASCADE;

ALTER TABLE public.proposals DROP COLUMN IF EXISTS voting_deadline;

-- Enforce a single proposal per party (the "one gift proposal per party" rule).
ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_party_id_unique UNIQUE (party_id);
