-- Run this to add ALL necessary columns for the new Tilt features
-- This handles both "Wall Tilt" (Left/Right) and "Wall Slant" (Perspective)

ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS rotate_x numeric DEFAULT 0;

ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS rotate_z numeric DEFAULT 0;

ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS rotate_y numeric DEFAULT 0;
