DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'scale_y') THEN 
        ALTER TABLE hotspots ADD COLUMN scale_y NUMERIC DEFAULT 1; 
    END IF; 
END $$;
