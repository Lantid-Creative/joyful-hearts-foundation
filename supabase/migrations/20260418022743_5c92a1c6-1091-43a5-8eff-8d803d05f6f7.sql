ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS card_image_url text,
  ADD COLUMN IF NOT EXISTS hero_image_url text;