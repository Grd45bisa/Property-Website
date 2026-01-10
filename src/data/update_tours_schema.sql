-- Add new columns to tours table for extended information
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS price text,
ADD COLUMN IF NOT EXISTS agent_name text,
ADD COLUMN IF NOT EXISTS agent_whatsapp text;
