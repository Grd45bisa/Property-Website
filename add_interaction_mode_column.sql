-- Add interaction_mode column to hotspots table
-- 'popup': Default behavior (opens modal)
-- 'label': Label only (no click action)

ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS interaction_mode text DEFAULT 'popup';
