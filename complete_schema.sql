-- ======================================================================
-- COMPLETE SUPABASE SCHEMA FOR VIRTUAL TOUR (PROPVERSE)
-- Generated on: 2026-01-14
-- ======================================================================

-- 1. UTILS
-- ----------------------------------------------------------------------
-- Ensure helpful extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
-- ----------------------------------------------------------------------

-- TABLE: tours
-- Stores the main project/tour information
CREATE TABLE IF NOT EXISTS public.tours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    
    -- Basic Info
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    category text, -- Villa, House, etc.
    
    -- Media
    thumbnail_url text, -- Cover image
    
    -- Settings & Config
    start_room_id uuid, -- Initial scene
    min_pitch float DEFAULT -90, -- Limit downward view
    nadir_image_url text, -- Patch for bottom of tour
    nadir_enabled boolean DEFAULT false,
    music_url text, -- Background music
    
    -- Agent / Contact Info
    agent_name text,
    agent_whatsapp text,
    agent_email text,
    
    -- Client / Developer Branding
    client_name text,
    client_logo text,
    client_url text,
    
    -- Pricing & Location
    price text,
    location text,
    
    -- Meta
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    UNIQUE(user_id, slug)
);

-- TABLE: rooms
-- Stores individual 360 scenes/panoramas
CREATE TABLE IF NOT EXISTS public.rooms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id uuid REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
    
    name text NOT NULL, -- "Living Room"
    slug text NOT NULL, -- "living-room"
    
    -- Images
    image_url text NOT NULL, -- Main 360 image
    thumbnail_url text, -- Tiny blur placeholder
    
    -- Initial View
    initial_view_pitch float DEFAULT 0,
    initial_view_yaw float DEFAULT 0,
    
    -- Ordering
    sequence_order int DEFAULT 0,
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    UNIQUE(tour_id, slug)
);

-- TABLE: hotspots
-- Stores interactive points within scenes
CREATE TABLE IF NOT EXISTS public.hotspots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    
    -- Core Identity
    type text CHECK (type IN ('scene', 'info')),
    text text,
    description text,
    icon text DEFAULT 'info', -- 'info', 'door', 'arrow', 'blur', etc.
    
    -- Positioning
    pitch float NOT NULL,
    yaw float NOT NULL,
    
    -- Navigation (for type='scene')
    target_room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
    
    -- Visual Styling & Transforms
    scale float DEFAULT 1.0,
    opacity float DEFAULT 1.0,
    aspect_ratio float DEFAULT 1.0,
    scale_y float DEFAULT 1.0, -- Independent Y scaling
    
    -- Render Modes
    render_mode text DEFAULT '2d' CHECK (render_mode IN ('2d', 'floor', 'wall')),
    
    -- 3D Rotations (for floor/wall modes)
    rotate_x float DEFAULT 0,
    rotate_y float DEFAULT 0,
    rotate_z float DEFAULT 0,
    
    -- Special Props
    blur_shape text DEFAULT 'circle' CHECK (blur_shape IN ('circle', 'rect')),
    interaction_mode text DEFAULT 'popup' CHECK (interaction_mode IN ('popup', 'label')),
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CIRCULAR DEPENDENCY FIX
-- Now that 'rooms' exists, add the FK constraint to 'tours'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_tours_start_room') THEN 
        ALTER TABLE public.tours 
        ADD CONSTRAINT fk_tours_start_room 
        FOREIGN KEY (start_room_id) REFERENCES public.rooms(id) ON DELETE SET NULL; 
    END IF; 
END $$;

-- 3. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;

-- 3.1. Tours Policies
DROP POLICY IF EXISTS "Tours are viewable by everyone" ON public.tours;
CREATE POLICY "Tours are viewable by everyone" ON public.tours FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own tours" ON public.tours;
CREATE POLICY "Users can insert their own tours" ON public.tours FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tours" ON public.tours;
CREATE POLICY "Users can update their own tours" ON public.tours FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tours" ON public.tours;
CREATE POLICY "Users can delete their own tours" ON public.tours FOR DELETE USING (auth.uid() = user_id);

-- 3.2. Rooms Policies (Cascade from Tour ownership)
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;
CREATE POLICY "Rooms are viewable by everyone" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage rooms of their tours" ON public.rooms;
CREATE POLICY "Users can manage rooms of their tours" ON public.rooms FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.tours
        WHERE tours.id = rooms.tour_id
        AND tours.user_id = auth.uid()
    )
);

-- 3.3. Hotspots Policies (Cascade from Room -> Tour ownership)
DROP POLICY IF EXISTS "Hotspots are viewable by everyone" ON public.hotspots;
CREATE POLICY "Hotspots are viewable by everyone" ON public.hotspots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage hotspots of their tours" ON public.hotspots;
CREATE POLICY "Users can manage hotspots of their tours" ON public.hotspots FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.rooms
        JOIN public.tours ON tours.id = rooms.tour_id
        WHERE rooms.id = hotspots.room_id
        AND tours.user_id = auth.uid()
    )
);

-- 4. PERMISSIONS (CRITICAL FIX for 401/403 errors)
-- ----------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tours TO authenticated, service_role;
GRANT SELECT ON TABLE public.tours TO anon;

GRANT ALL ON TABLE public.rooms TO authenticated, service_role;
GRANT SELECT ON TABLE public.rooms TO anon;

GRANT ALL ON TABLE public.hotspots TO authenticated, service_role;
GRANT SELECT ON TABLE public.hotspots TO anon;

-- 5. STORAGE
-- ----------------------------------------------------------------------
-- Note: Must be run in SQL Editor (Storage API cannot be perfectly scripted via standard SQL in all envs, but this works for Supabase)

INSERT INTO storage.buckets (id, name, public)
VALUES ('virtual-tours', 'virtual-tours', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'virtual-tours' );

DROP POLICY IF EXISTS "Authenticated Users Upload" ON storage.objects;
CREATE POLICY "Authenticated Users Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'virtual-tours' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "User Update Own Images" ON storage.objects;
CREATE POLICY "User Update Own Images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'virtual-tours' AND auth.uid() = owner );

DROP POLICY IF EXISTS "User Delete Own Images" ON storage.objects;
CREATE POLICY "User Delete Own Images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'virtual-tours' AND auth.uid() = owner );
