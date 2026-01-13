DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'blur_shape') THEN 
        ALTER TABLE hotspots ADD COLUMN blur_shape TEXT DEFAULT 'circle'; 
    END IF; 
END $$;
