-- ======================================================================
-- MIGRATION: UPDATE HOTSPOTS SCHEMA (Safe to run multiple times)
-- ======================================================================

DO $$ 
BEGIN 
    -- 1. Ensure scale_y column exists (for Height Stretching)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'scale_y') THEN 
        ALTER TABLE public.hotspots ADD COLUMN scale_y float DEFAULT 1.0; 
    END IF;

    -- 2. Ensure rotate_z column exists (used for Floor Spin)
    -- It should exist, but just in case of old schema
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'rotate_z') THEN 
        ALTER TABLE public.hotspots ADD COLUMN rotate_z float DEFAULT 0; 
    END IF;
    
    -- 3. Ensure other transform columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'aspect_ratio') THEN 
        ALTER TABLE public.hotspots ADD COLUMN aspect_ratio float DEFAULT 1.0; 
    END IF;

END $$;
