-- Run this in your Supabase SQL Editor to add the missing column
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS rotate_x numeric DEFAULT 75;

-- Optional: Update existing 'floor' hotspots to have default tilt if needed
-- UPDATE hotspots SET rotate_x = 75 WHERE render_mode = 'floor';
