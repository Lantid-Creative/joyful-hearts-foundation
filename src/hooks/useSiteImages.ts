import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteImage {
  slot: string;
  url: string;
  media_type: string;
  alt_text: string | null;
  title: string | null;
  subtitle: string | null;
  highlight: string | null;
  description: string | null;
  tagline: string | null;
  /** 0–80, percent darkness of the overlay placed on top of the image. */
  overlay_opacity?: number | null;
}

/** Fetch a single site_images slot. Returns null while loading or if not set. */
export const useSiteImage = (slot: string) => {
  const [image, setImage] = useState<SiteImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_images")
        .select("*")
        .eq("slot", slot)
        .eq("is_active", true)
        .maybeSingle();
      if (!cancelled) {
        setImage((data as SiteImage) || null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slot]);

  return { image, loading };
};

/** Fetch many slots at once, returns a map keyed by slot. */
export const useSiteImages = (slots: string[]) => {
  const [images, setImages] = useState<Record<string, SiteImage>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_images")
        .select("*")
        .in("slot", slots);
      if (!cancelled) {
        const map: Record<string, SiteImage> = {};
        (data || []).forEach((r: any) => (map[r.slot] = r as SiteImage));
        setImages(map);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.join(",")]);

  return { images, loading };
};
