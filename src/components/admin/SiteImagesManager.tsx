import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MediaUploader from "./MediaUploader";

interface SiteImageRow {
  id: string;
  slot: string;
  url: string;
  media_type: string;
  alt_text: string | null;
  title: string | null;
  subtitle: string | null;
  highlight: string | null;
  description: string | null;
  tagline: string | null;
  overlay_opacity: number | null;
}

type SlotKind = "hero-slide" | "page-hero" | "section-bg";

interface SlotDef {
  slot: string;
  label: string;
  group: string;
  kind: SlotKind;
  recommendedSize: string;
  recommendedWeight: string;
  hasText?: boolean; // hero slides have title/subtitle/description
}

const SLOTS: SlotDef[] = [
  // Home hero carousel
  { slot: "home_hero_1", label: "Home Hero — Slide 1", group: "Home Hero Carousel", kind: "hero-slide", recommendedSize: "1920 × 1080 px (16:9)", recommendedWeight: "Under 500 KB", hasText: true },
  { slot: "home_hero_2", label: "Home Hero — Slide 2", group: "Home Hero Carousel", kind: "hero-slide", recommendedSize: "1920 × 1080 px (16:9)", recommendedWeight: "Under 500 KB", hasText: true },
  { slot: "home_hero_3", label: "Home Hero — Slide 3", group: "Home Hero Carousel", kind: "hero-slide", recommendedSize: "1920 × 1080 px (16:9)", recommendedWeight: "Under 500 KB", hasText: true },
  { slot: "home_hero_4", label: "Home Hero — Slide 4", group: "Home Hero Carousel", kind: "hero-slide", recommendedSize: "1920 × 1080 px (16:9)", recommendedWeight: "Under 500 KB", hasText: true },

  // Page heroes
  { slot: "page_about", label: "About Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_programs", label: "Programs Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_donate", label: "Donate Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_volunteer", label: "Volunteer Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_partner", label: "Partner Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_contact", label: "Contact Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_blog", label: "Blog Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_events", label: "Events Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },
  { slot: "page_gallery", label: "Gallery Page Hero", group: "Page Heroes", kind: "page-hero", recommendedSize: "1600 × 900 px (16:9)", recommendedWeight: "Under 400 KB" },

  // Section backgrounds
  { slot: "section_impact_bg", label: "Impact Section Background", group: "Section Backgrounds", kind: "section-bg", recommendedSize: "1920 × 1080 px (16:9)", recommendedWeight: "Under 500 KB" },
  { slot: "section_mission_image", label: "Mission Section Image", group: "Section Backgrounds", kind: "section-bg", recommendedSize: "1200 × 900 px (4:3)", recommendedWeight: "Under 400 KB" },
  { slot: "section_cta_bg", label: "CTA Section Background", group: "Section Backgrounds", kind: "section-bg", recommendedSize: "1920 × 800 px", recommendedWeight: "Under 400 KB" },
];

const GROUPS = ["Home Hero Carousel", "Page Heroes", "Section Backgrounds"] as const;

const SiteImagesManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Record<string, SiteImageRow>>({});
  const [drafts, setDrafts] = useState<Record<string, Partial<SiteImageRow>>>({});
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_images").select("*");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const map: Record<string, SiteImageRow> = {};
      (data || []).forEach((r) => (map[r.slot] = r as SiteImageRow));
      setRows(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getValue = (slot: string): Partial<SiteImageRow> => ({
    ...(rows[slot] || {}),
    ...(drafts[slot] || {}),
  });

  const updateDraft = (slot: string, patch: Partial<SiteImageRow>) => {
    setDrafts((d) => ({ ...d, [slot]: { ...(d[slot] || {}), ...patch } }));
  };

  const saveSlot = async (def: SlotDef) => {
    const draft = getValue(def.slot);
    if (!draft.url) {
      toast({ title: "Image required", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setSavingSlot(def.slot);
    const payload = {
      slot: def.slot,
      url: draft.url,
      media_type: draft.media_type || "image",
      alt_text: draft.alt_text || null,
      title: draft.title || null,
      subtitle: draft.subtitle || null,
      highlight: draft.highlight || null,
      description: draft.description || null,
      tagline: draft.tagline || null,
      overlay_opacity:
        typeof draft.overlay_opacity === "number" ? draft.overlay_opacity : 60,
    };
    const { error } = await supabase
      .from("site_images")
      .upsert(payload, { onConflict: "slot" });

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `${def.label} updated.` });
      setDrafts((d) => {
        const n = { ...d };
        delete n[def.slot];
        return n;
      });
      await fetchAll();
    }
    setSavingSlot(null);
  };

  const grouped = useMemo(() => {
    const g: Record<string, SlotDef[]> = {};
    SLOTS.forEach((s) => {
      g[s.group] = g[s.group] || [];
      g[s.group].push(s);
    });
    return g;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Manage all site visuals from here</p>
            <p className="text-muted-foreground mt-1">
              Upload high-quality images for the homepage hero carousel, page banners, and section backgrounds.
              Recommended sizes are shown for each slot — staying close to them keeps the site fast.
              If a slot is empty, the site falls back to the default image.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue={GROUPS[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {GROUPS.map((g) => (
            <TabsTrigger key={g} value={g}>{g}</TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map((group) => (
          <TabsContent key={group} value={group} className="space-y-4 mt-4">
            {grouped[group].map((def) => {
              const v = getValue(def.slot);
              const dirty = !!drafts[def.slot];
              const isLive = !!rows[def.slot];
              return (
                <Card key={def.slot}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {def.label}
                          {isLive ? (
                            <Badge variant="default">Live</Badge>
                          ) : (
                            <Badge variant="outline">Using default</Badge>
                          )}
                          {dirty && <Badge variant="secondary">Unsaved changes</Badge>}
                        </CardTitle>
                        <CardDescription>
                          Slot: <code className="text-xs">{def.slot}</code>
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveSlot(def)}
                        disabled={savingSlot === def.slot || !v.url}
                      >
                        {savingSlot === def.slot ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MediaUploader
                      kind="image"
                      folder={`site/${def.slot}`}
                      value={v.url || ""}
                      mediaType="image"
                      onChange={(url) => updateDraft(def.slot, { url, media_type: "image" })}
                      onClear={() => updateDraft(def.slot, { url: "" })}
                      recommendedSize={def.recommendedSize}
                      recommendedWeight={def.recommendedWeight}
                    />

                    <div className="space-y-2">
                      <Label>Alt text (for accessibility & SEO)</Label>
                      <Input
                        value={v.alt_text || ""}
                        onChange={(e) => updateDraft(def.slot, { alt_text: e.target.value })}
                        placeholder="Describe the image briefly"
                      />
                    </div>

                    {v.url && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Dark overlay strength</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Higher = darker overlay, easier to read text on bright photos.
                            </p>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {Math.round(
                              typeof v.overlay_opacity === "number" ? v.overlay_opacity : 60,
                            )}
                            %
                          </Badge>
                        </div>
                        <Slider
                          min={0}
                          max={80}
                          step={5}
                          value={[
                            typeof v.overlay_opacity === "number" ? v.overlay_opacity : 60,
                          ]}
                          onValueChange={([val]) =>
                            updateDraft(def.slot, { overlay_opacity: val })
                          }
                        />
                        {/* Live preview */}
                        <div className="relative h-24 rounded-md overflow-hidden border">
                          <img
                            src={v.url}
                            alt="overlay preview"
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 bg-foreground"
                            style={{
                              opacity:
                                Math.max(
                                  0,
                                  Math.min(
                                    80,
                                    typeof v.overlay_opacity === "number"
                                      ? v.overlay_opacity
                                      : 60,
                                  ),
                                ) / 100,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-display font-bold text-background text-lg drop-shadow">
                              Sample heading text
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {def.hasText && (
                      <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
                        <div className="space-y-2">
                          <Label>Tagline (small pill text)</Label>
                          <Input
                            value={v.tagline || ""}
                            onChange={(e) => updateDraft(def.slot, { tagline: e.target.value })}
                            placeholder="Every child deserves..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={v.title || ""}
                            onChange={(e) => updateDraft(def.slot, { title: e.target.value })}
                            placeholder="Raising the Hope of"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Highlighted word</Label>
                          <Input
                            value={v.highlight || ""}
                            onChange={(e) => updateDraft(def.slot, { highlight: e.target.value })}
                            placeholder="Rural Children"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtitle</Label>
                          <Input
                            value={v.subtitle || ""}
                            onChange={(e) => updateDraft(def.slot, { subtitle: e.target.value })}
                            placeholder="Initiative"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            rows={2}
                            value={v.description || ""}
                            onChange={(e) => updateDraft(def.slot, { description: e.target.value })}
                            placeholder="Empowering rural children through education..."
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SiteImagesManager;
