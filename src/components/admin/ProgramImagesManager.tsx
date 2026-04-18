import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MediaUploader from "./MediaUploader";

interface ProgramRow {
  id: string;
  slug: string;
  title: string;
  card_image_url: string | null;
  hero_image_url: string | null;
}

const ProgramImagesManager = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { card_image_url?: string | null; hero_image_url?: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("programs")
      .select("id, slug, title, card_image_url, hero_image_url")
      .order("display_order", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPrograms((data || []) as ProgramRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getValue = (p: ProgramRow) => ({
    card_image_url: drafts[p.id]?.card_image_url ?? p.card_image_url,
    hero_image_url: drafts[p.id]?.hero_image_url ?? p.hero_image_url,
  });

  const updateDraft = (id: string, patch: { card_image_url?: string | null; hero_image_url?: string | null }) => {
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), ...patch } }));
  };

  const save = async (p: ProgramRow) => {
    const v = getValue(p);
    setSavingId(p.id);
    const { error } = await supabase
      .from("programs")
      .update({
        card_image_url: v.card_image_url || null,
        hero_image_url: v.hero_image_url || null,
      })
      .eq("id", p.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `${p.title} images updated.` });
      setDrafts((d) => {
        const n = { ...d };
        delete n[p.id];
        return n;
      });
      await fetchAll();
    }
    setSavingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm">
        <p className="font-semibold">Program images</p>
        <p className="text-muted-foreground mt-1">
          Each program has a <strong>card image</strong> (shown on Programs list & home preview) and a <strong>detail hero</strong> (large banner on the program's page). Empty slots fall back to the default site images.
        </p>
      </div>

      <div className="space-y-4">
        {programs.map((p) => {
          const v = getValue(p);
          const dirty = !!drafts[p.id];
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      {p.title}
                      {dirty && <Badge variant="secondary">Unsaved changes</Badge>}
                      {p.card_image_url && p.hero_image_url ? (
                        <Badge variant="default">Both set</Badge>
                      ) : p.card_image_url || p.hero_image_url ? (
                        <Badge variant="outline">Partial</Badge>
                      ) : (
                        <Badge variant="outline">Using defaults</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Slug: <code className="text-xs">{p.slug}</code>
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => save(p)} disabled={savingId === p.id}>
                    {savingId === p.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Card image</p>
                    <MediaUploader
                      kind="image"
                      folder={`programs/${p.slug}/card`}
                      value={v.card_image_url || ""}
                      mediaType="image"
                      onChange={(url) => updateDraft(p.id, { card_image_url: url })}
                      onClear={() => updateDraft(p.id, { card_image_url: null })}
                      recommendedSize="800 × 600 px (4:3)"
                      recommendedWeight="Under 200 KB"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Detail page hero</p>
                    <MediaUploader
                      kind="image"
                      folder={`programs/${p.slug}/hero`}
                      value={v.hero_image_url || ""}
                      mediaType="image"
                      onChange={(url) => updateDraft(p.id, { hero_image_url: url })}
                      onClear={() => updateDraft(p.id, { hero_image_url: null })}
                      recommendedSize="1600 × 900 px (16:9)"
                      recommendedWeight="Under 400 KB"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProgramImagesManager;
