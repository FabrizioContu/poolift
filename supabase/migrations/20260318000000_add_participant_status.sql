-- Add status column to direct_gift_participants
ALTER TABLE direct_gift_participants
  ADD COLUMN status TEXT NOT NULL DEFAULT 'joined'
  CHECK (status IN ('joined', 'declined'));

-- Add status column to participants (group gifts)
ALTER TABLE participants
  ADD COLUMN status TEXT NOT NULL DEFAULT 'joined'
  CHECK (status IN ('joined', 'declined'));
