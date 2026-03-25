-- Add optional email fields for notifications

-- organizer contact email for direct gifts
ALTER TABLE direct_gifts
  ADD COLUMN organizer_email TEXT;

-- participant contact email for direct gifts
ALTER TABLE direct_gift_participants
  ADD COLUMN email TEXT;

-- participant contact email for group gifts
ALTER TABLE participants
  ADD COLUMN email TEXT;
