-- Add category column to tours table
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS category text;

-- Add check constraint for valid categories (optional, but good practice if predictable)
-- ALTER TABLE public.tours ADD CONSTRAINT check_category CHECK (category IN ('Villa', 'Apartment', 'House', 'Office', 'Land', 'Other'));
