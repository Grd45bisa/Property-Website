-- Add thumbnail_url column for blur placeholder loading
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS thumbnail_url text;
