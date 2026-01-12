-- Add min_pitch column to tours table
-- This controls how far down users can look in the panorama viewer
-- Default is -90 (full view to bottom), higher values restrict the bottom view

ALTER TABLE tours ADD COLUMN IF NOT EXISTS min_pitch INTEGER DEFAULT -90;

-- Add comment for documentation
COMMENT ON COLUMN tours.min_pitch IS 'Minimum pitch angle (-90 to 0). -90 = full view, higher = more restricted';
