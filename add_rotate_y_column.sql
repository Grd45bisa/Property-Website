-- Run this to add the rotate_y column for Wall Slant/Perspective
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS rotate_y numeric DEFAULT 0;
