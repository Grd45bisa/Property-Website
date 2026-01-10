-- Add nadir settings to tours table
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS nadir_image_url text,
ADD COLUMN IF NOT EXISTS nadir_enabled boolean default false;
