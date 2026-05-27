-- ============================================================
-- Add share_code to families
-- Purpose: Allows family members to re-access their group from
-- any device without requiring auth or a new invite code.
-- Pattern mirrors direct_gifts.share_code.
-- ============================================================

ALTER TABLE families ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE;

-- Backfill existing families with a unique 8-char hex code
UPDATE families
SET share_code = encode(gen_random_bytes(4), 'hex')
WHERE share_code IS NULL;

ALTER TABLE families ALTER COLUMN share_code SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_families_share_code ON families(share_code);
