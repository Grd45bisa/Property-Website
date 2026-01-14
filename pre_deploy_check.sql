-- ======================================================================
-- PRE-DEPLOYMENT SCHEMA CHECK
-- Run this in your Supabase SQL Editor to ensure all tables have the latest columns.
-- ======================================================================

DO $$ 
BEGIN 

    -- 1. HOTSPOTS TABLE UPDATES
    -- ------------------------------------------------------------------
    -- Ensure scale_y exists (Height Stretch)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'scale_y') THEN 
        ALTER TABLE public.hotspots ADD COLUMN scale_y float DEFAULT 1.0; 
    END IF;

    -- Ensure rotate_z exists (Floor Spin)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'rotate_z') THEN 
        ALTER TABLE public.hotspots ADD COLUMN rotate_z float DEFAULT 0; 
    END IF;

    -- Ensure aspect_ratio exists (Width Stretch)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotspots' AND column_name = 'aspect_ratio') THEN 
        ALTER TABLE public.hotspots ADD COLUMN aspect_ratio float DEFAULT 1.0; 
    END IF;

    -- 2. TOURS TABLE UPDATES
    -- ------------------------------------------------------------------
    -- Ensure client_logo exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'client_logo') THEN 
        ALTER TABLE public.tours ADD COLUMN client_logo text; 
    END IF;

    -- Ensure client_name exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'client_name') THEN 
        ALTER TABLE public.tours ADD COLUMN client_name text; 
    END IF;

    -- Ensure client_url exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'client_url') THEN 
        ALTER TABLE public.tours ADD COLUMN client_url text; 
    END IF;

    -- Ensure agent_whatsapp exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'agent_whatsapp') THEN 
        ALTER TABLE public.tours ADD COLUMN agent_whatsapp text; 
    END IF;

    -- Ensure nadir_enabled exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'nadir_enabled') THEN 
        ALTER TABLE public.tours ADD COLUMN nadir_enabled boolean DEFAULT false; 
    END IF;

    -- Ensure nadir_image_url exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'nadir_image_url') THEN 
        ALTER TABLE public.tours ADD COLUMN nadir_image_url text; 
    END IF;

    -- Ensure min_pitch exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'min_pitch') THEN 
        ALTER TABLE public.tours ADD COLUMN min_pitch float DEFAULT -90; 
    END IF;

    -- 3. ROOMS TABLE UPDATES
    -- ------------------------------------------------------------------
    -- Ensure initial_view_pitch exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'initial_view_pitch') THEN 
        ALTER TABLE public.rooms ADD COLUMN initial_view_pitch float DEFAULT 0; 
    END IF;

    -- Ensure initial_view_yaw exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'initial_view_yaw') THEN 
        ALTER TABLE public.rooms ADD COLUMN initial_view_yaw float DEFAULT 0; 
    END IF;

END $$;
