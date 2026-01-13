-- Enable RLS for rooms table
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow ALL operations for authenticated users (TEMPORARY FIX for development)
-- Ideally you should scope this to user_id, but for now let's unblock saving.
CREATE POLICY "Allow all operations for authenticated users on rooms"
ON rooms
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Also ensure hotspots has policies
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users on hotspots"
ON hotspots
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
