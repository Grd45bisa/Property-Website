-- Add client branding columns to tours table
-- These allow tour publishers to display their client's logo and name in the viewer

ALTER TABLE tours ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT '';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS client_logo TEXT DEFAULT '';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS client_url TEXT DEFAULT '';

-- Add comments for documentation
COMMENT ON COLUMN tours.client_name IS 'Client or developer name displayed in tour viewer logo area';
COMMENT ON COLUMN tours.client_logo IS 'URL to client logo image displayed in tour viewer';
COMMENT ON COLUMN tours.client_url IS 'URL to client website, opened when clicking the logo';
