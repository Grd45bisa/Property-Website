-- Fix RLS policies for table 'rooms' to allow proper management by tour owners

-- 1. Drop existing restrictive policies on rooms
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;
DROP POLICY IF EXISTS "Users can manage rooms of their tours" ON public.rooms;

-- 2. Validate RLS is enabled
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 3. Re-create policies with explicit permissions

-- View policy (Public)
CREATE POLICY "Rooms are viewable by everyone" 
ON public.rooms FOR SELECT 
USING (true);

-- Insert policy
-- Checks if the tour belongs to the user
CREATE POLICY "Users can insert rooms for their tours" 
ON public.rooms FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tours
    WHERE tours.id = rooms.tour_id
    AND tours.user_id = auth.uid()
  )
);

-- Update policy
CREATE POLICY "Users can update rooms of their tours" 
ON public.rooms FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.tours
    WHERE tours.id = rooms.tour_id
    AND tours.user_id = auth.uid()
  )
);

-- Delete policy
CREATE POLICY "Users can delete rooms of their tours" 
ON public.rooms FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.tours
    WHERE tours.id = rooms.tour_id
    AND tours.user_id = auth.uid()
  )
);
