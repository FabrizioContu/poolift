-- ============================================================
-- Explicit Data API grants for all public tables
-- Required: Supabase removes auto-exposure of public schema
-- on existing projects from October 30, 2026.
-- ============================================================

-- Core
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups              TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families            TO anon, authenticated;

-- Birthdays & Parties
GRANT SELECT, INSERT, UPDATE, DELETE ON public.birthdays           TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parties             TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.party_celebrants    TO anon, authenticated;

-- Gift proposals
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals           TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_items      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes               TO anon, authenticated;

-- Group gifts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gifts               TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants        TO anon, authenticated;

-- Direct gifts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_gifts             TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_gift_participants TO anon, authenticated;

-- Legacy
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas               TO anon, authenticated;

-- Function used in future restrictive RLS policies
GRANT EXECUTE ON FUNCTION public.auth_user_group_ids() TO authenticated;
