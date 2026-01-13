-- Run this in your Supabase SQL Editor to add the rotate_z column
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS rotate_z numeric DEFAULT 0;
