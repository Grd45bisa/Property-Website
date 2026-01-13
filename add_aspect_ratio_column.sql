DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'aspect_ratio') THEN 
        ALTER TABLE hotspots ADD COLUMN aspect_ratio NUMERIC DEFAULT 1; 
    END IF; 
END $$;
