import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Image as ImageIcon, Film, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/imageCompression";

export interface MediaLibraryItem {
  id: string;
  url: string;
  type: "image" | "video";
  file_name: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Restrict to image or video, omit for both */
  kind?: "image" | "video";
  onSelect: (item: MediaLibraryItem) => void;
}

const MediaPicker = ({ open, onOpenChange, kind, onSelect }: MediaPickerProps) => {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">(kind || "all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    let q = supabase
      .from("media_library")
      .select("id, url, type, file_name, file_size, width, height, alt_text, caption, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (kind) q = q.eq("type", kind);
    const { data } = await q;
    setItems((data as MediaLibraryItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filter !== "all" && it.type !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${it.file_name} ${it.alt_text || ""} ${it.caption || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [items, search, filter]);

  const selected = items.find((i) => i.id === selectedId) || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose from Media Library</DialogTitle>
          <DialogDescription>
            Pick an existing image or video instead of re-uploading.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, alt text, caption..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {!kind && (
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No media found. Upload assets in the Media Library tab first.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelectedId(it.id)}
                  onDoubleClick={() => {
                    onSelect(it);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-muted",
                    selectedId === it.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {it.type === "image" ? (
                    <img
                      src={it.url}
                      alt={it.alt_text || it.file_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                      <Film className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                    <p className="text-[10px] text-white truncate text-left font-medium">
                      {it.file_name}
                    </p>
                  </div>
                  {selectedId === it.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-background/80 rounded px-1.5 py-0.5 text-[9px] font-medium flex items-center gap-1">
                    {it.type === "image" ? (
                      <ImageIcon className="w-2.5 h-2.5" />
                    ) : (
                      <Film className="w-2.5 h-2.5" />
                    )}
                    {it.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {selected ? (
              <>
                <strong>{selected.file_name}</strong> ·{" "}
                {selected.width && selected.height
                  ? `${selected.width}×${selected.height} · `
                  : ""}
                {selected.file_size ? formatBytes(selected.file_size) : ""}
              </>
            ) : (
              `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onSelect(selected);
                  onOpenChange(false);
                }
              }}
            >
              Use selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPicker;
