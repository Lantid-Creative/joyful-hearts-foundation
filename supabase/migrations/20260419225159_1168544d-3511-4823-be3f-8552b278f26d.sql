ALTER TABLE public.site_images
ADD COLUMN IF NOT EXISTS overlay_opacity smallint NOT NULL DEFAULT 60;

-- Clamp values to 0..80 via a trigger (CHECK constraints are fine here too, but trigger keeps it forgiving)
CREATE OR REPLACE FUNCTION public.clamp_site_images_overlay()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.overlay_opacity IS NULL THEN
    NEW.overlay_opacity := 60;
  END IF;
  IF NEW.overlay_opacity < 0 THEN
    NEW.overlay_opacity := 0;
  ELSIF NEW.overlay_opacity > 80 THEN
    NEW.overlay_opacity := 80;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clamp_site_images_overlay ON public.site_images;
CREATE TRIGGER trg_clamp_site_images_overlay
BEFORE INSERT OR UPDATE ON public.site_images
FOR EACH ROW EXECUTE FUNCTION public.clamp_site_images_overlay();