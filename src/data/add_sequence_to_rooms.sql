-- Add sequence_order column to rooms table for custom sorting
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS sequence_order integer DEFAULT 0;

-- Optional: Update existing rows to have a default sequence based on created_at
-- This ensures they aren't all 0 initially if that matters, though 0 is fine.
-- WITH ranked_rooms AS (
--   SELECT id, ROW_NUMBER() OVER (PARTITION BY tour_id ORDER BY created_at) as proper_order
--   FROM rooms
-- )
-- UPDATE rooms
-- SET sequence_order = ranked_rooms.proper_order
-- FROM ranked_rooms
-- WHERE rooms.id = ranked_rooms.id;
