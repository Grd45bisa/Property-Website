-- Add opacity column to hotspots table
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS opacity numeric DEFAULT 1;

-- Update existing records to have default opacity
UPDATE hotspots 
SET opacity = 1 
WHERE opacity IS NULL;
