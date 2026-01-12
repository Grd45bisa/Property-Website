-- Add visual customization columns to hotspots table
ALTER TABLE hotspots 
ADD COLUMN scale FLOAT DEFAULT 1.0,
ADD COLUMN opacity FLOAT DEFAULT 1.0,
ADD COLUMN render_mode TEXT DEFAULT '2d'; -- '2d', 'floor', 'wall'

COMMENT ON COLUMN hotspots.scale IS 'Scale factor for the hotspot icon (0.5 to 2.0)';
COMMENT ON COLUMN hotspots.opacity IS 'Opacity of the hotspot icon (0.1 to 1.0)';
COMMENT ON COLUMN hotspots.render_mode IS 'Rendering mode for 3D effect (2d, floor, wall)';
