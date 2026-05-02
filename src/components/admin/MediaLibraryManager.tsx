import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Trash2,
  Copy,
  Pencil,
  Image as ImageIcon,
  Film,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/imageCompression";
import BulkMediaUploader from "./BulkMediaUploader";

interface LibraryItem {
  id: string;
  url: string;
  storage_path: string | null;
  type: "image" | "video";
  mime_type: string | null;
  file_name: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  tags: string[] | null;
  folder: string | null;
  created_at: string;
}

const MediaLibraryManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [editForm, setEditForm] = useState({ alt_text: "", caption: "", tags: "", category: "General" });
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bulkCategory, setBulkCategory] = useState<string>("");

  const GALLERY_CATEGORIES = ["General", "Education", "Health", "Culture", "Community", "Events"];

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setItems((data as LibraryItem[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filter !== "all" && it.type !== filter) return false;
      if (categoryFilter !== "all") {
        const cat = (it.tags && it.tags[0]) || "General";
        if (cat !== categoryFilter) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        const hay = `${it.file_name} ${it.alt_text || ""} ${it.caption || ""} ${(it.tags || []).join(" ")}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [items, search, filter, categoryFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((i) => i.id)));
  };

  const deleteOne = async (item: LibraryItem) => {
    if (!confirm(`Delete "${item.file_name}"? This removes it from storage and the library.`)) return;
    if (item.storage_path) {
      await supabase.storage.from("media").remove([item.storage_path]);
    }
    const { error } = await supabase.from("media_library").delete().eq("id", item.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: item.file_name });
      setItems((arr) => arr.filter((i) => i.id !== item.id));
      setSelectedIds((s) => {
        const n = new Set(s);
        n.delete(item.id);
        return n;
      });
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected file(s)? This cannot be undone.`)) return;
    const toDelete = items.filter((i) => selectedIds.has(i.id));
    const paths = toDelete.map((i) => i.storage_path).filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("media").remove(paths);
    const { error } = await supabase.from("media_library").delete().in("id", Array.from(selectedIds));
    if (error) {
      toast({ title: "Bulk delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `${selectedIds.size} file(s) removed.` });
      setItems((arr) => arr.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "URL copied to clipboard" });
  };

  const openEdit = (item: LibraryItem) => {
    setEditing(item);
    const existingTags = item.tags || [];
    const cat = existingTags[0] && GALLERY_CATEGORIES.includes(existingTags[0]) ? existingTags[0] : "General";
    const restTags = existingTags.filter((t) => t !== cat);
    setEditForm({
      alt_text: item.alt_text || "",
      caption: item.caption || "",
      tags: restTags.join(", "),
      category: cat,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const restTags = editForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    // Always store category as the FIRST tag so the gallery picks it up.
    const tagsArr = [editForm.category, ...restTags.filter((t) => t !== editForm.category)];
    const { error } = await supabase
      .from("media_library")
      .update({
        alt_text: editForm.alt_text || null,
        caption: editForm.caption || null,
        tags: tagsArr,
      })
      .eq("id", editing.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: editing.file_name });
      setItems((arr) =>
        arr.map((i) =>
          i.id === editing.id
            ? { ...i, alt_text: editForm.alt_text || null, caption: editForm.caption || null, tags: tagsArr }
            : i,
        ),
      );
      setEditing(null);
    }
    setSaving(false);
  };

  const applyBulkCategory = async () => {
    if (!bulkCategory || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const updates = items
      .filter((i) => selectedIds.has(i.id))
      .map((i) => {
        const rest = (i.tags || []).filter((t) => !GALLERY_CATEGORIES.includes(t));
        const newTags = [bulkCategory, ...rest];
        return supabase.from("media_library").update({ tags: newTags }).eq("id", i.id);
      });
    const results = await Promise.all(updates);
    const failed = results.filter((r) => r.error).length;
    if (failed) {
      toast({ title: "Some updates failed", description: `${failed} of ${ids.length}`, variant: "destructive" });
    } else {
      toast({ title: "Categorized", description: `${ids.length} item(s) → ${bulkCategory}` });
    }
    setItems((arr) =>
      arr.map((i) => {
        if (!selectedIds.has(i.id)) return i;
        const rest = (i.tags || []).filter((t) => !GALLERY_CATEGORIES.includes(t));
        return { ...i, tags: [bulkCategory, ...rest] };
      }),
    );
    setSelectedIds(new Set());
    setBulkCategory("");
  };

  const totalSize = useMemo(
    () => items.reduce((sum, it) => sum + (it.file_size || 0), 0),
    [items],
  );

  return (
    <div className="space-y-6">
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm">
        <p className="font-semibold">Central Media Library</p>
        <p className="text-muted-foreground mt-1">
          Drag a folder of images and videos here to upload them all at once. Once in the library, any image or video can be reused on the homepage hero, page banners, program cards, gallery, blog posts, and more — without re-uploading.
        </p>
      </div>

      <BulkMediaUploader folder="library" onComplete={() => fetchAll()} />

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, alt text, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {GALLERY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {filtered.length} of {items.length} · {formatBytes(totalSize)} total
          </Badge>
        </div>
        <div className="flex gap-2 items-center">
          {selectedIds.size > 0 && (
            <div className="flex gap-1 items-center">
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Set category…" />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="secondary" disabled={!bulkCategory} onClick={applyBulkCategory}>
                Apply
              </Button>
            </div>
          )}
          {filtered.length > 0 && (
            <Button size="sm" variant="outline" onClick={toggleSelectAll}>
              {selectedIds.size === filtered.length ? "Deselect all" : "Select all"}
            </Button>
          )}
          {selectedIds.size > 0 && (
            <Button size="sm" variant="destructive" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete {selectedIds.size}
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          {items.length === 0
            ? "No media yet. Upload your first batch above to get started."
            : "No media matches your filters."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative rounded-lg overflow-hidden border-2 bg-muted transition-all",
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-border",
                )}
              >
                <div className="aspect-square relative">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.file_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover bg-black"
                      muted
                      preload="metadata"
                    />
                  )}

                  <div className="absolute top-1.5 left-1.5">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="bg-background/90"
                    />
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-background/80 rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1">
                    {item.type === "image" ? (
                      <ImageIcon className="w-2.5 h-2.5" />
                    ) : (
                      <Film className="w-2.5 h-2.5" />
                    )}
                    {item.type}
                  </div>

                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => copyUrl(item.url)} title="Copy URL">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => openEdit(item)} title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7" asChild title="Open in new tab">
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => deleteOne(item)} title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 text-xs space-y-0.5">
                  <p className="font-medium truncate" title={item.file_name}>{item.file_name}</p>
                  <p className="text-muted-foreground">
                    {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                    {item.file_size ? ` · ${formatBytes(item.file_size)}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit media details</DialogTitle>
            <DialogDescription>{editing?.file_name}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              {editing.type === "image" ? (
                <img src={editing.url} alt="" className="w-full max-h-48 object-contain rounded border" />
              ) : (
                <video src={editing.url} controls className="w-full max-h-48 rounded border bg-black" />
              )}
              <div className="space-y-2">
                <Label>Alt text (accessibility & SEO)</Label>
                <Input
                  value={editForm.alt_text}
                  onChange={(e) => setEditForm((f) => ({ ...f, alt_text: e.target.value }))}
                  placeholder="Describe the image briefly"
                />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  rows={2}
                  value={editForm.caption}
                  onChange={(e) => setEditForm((f) => ({ ...f, caption: e.target.value }))}
                  placeholder="Optional caption"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="education, children, lagos"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibraryManager;
