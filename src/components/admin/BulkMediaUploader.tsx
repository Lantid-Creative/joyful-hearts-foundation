import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Loader2, CheckCircle2, XCircle, Image as ImageIcon, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage, probeVideoDimensions, formatBytes } from "@/lib/imageCompression";

interface BulkMediaUploaderProps {
  /** Folder inside `media` bucket and library `folder` field. */
  folder?: string;
  /** Max single file size in MB. Default: 1024 (1GB) for video, 15 for image. */
  maxImageMB?: number;
  maxVideoMB?: number;
  /** Called once after the batch finishes. */
  onComplete?: (insertedCount: number) => void;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

interface QueueItem {
  id: string;
  file: File;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  finalSize?: number;
  originalSize: number;
  isImage: boolean;
}

const BulkMediaUploader = ({
  folder = "library",
  maxImageMB = 15,
  maxVideoMB = 1024,
  onComplete,
}: BulkMediaUploaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);

  const update = (id: string, patch: Partial<QueueItem>) =>
    setQueue((q) => q.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const processOne = async (item: QueueItem): Promise<boolean> => {
    try {
      let uploadFile = item.file;
      let width = 0;
      let height = 0;

      if (item.isImage) {
        update(item.id, { status: "compressing", progress: 5 });
        const result = await compressImage(item.file, 1920, 0.82);
        uploadFile = result.file;
        width = result.width;
        height = result.height;
      } else {
        const dim = await probeVideoDimensions(item.file);
        width = dim.width;
        height = dim.height;
      }

      update(item.id, { status: "uploading", progress: 25 });

      const ext = uploadFile.name.split(".").pop() || "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Fake progress while upload runs (Supabase JS doesn't expose progress events)
      let cancelled = false;
      const tick = setInterval(() => {
        if (cancelled) return;
        setQueue((q) =>
          q.map((it) =>
            it.id === item.id && it.status === "uploading" && it.progress < 90
              ? { ...it, progress: it.progress + Math.max(1, (90 - it.progress) * 0.1) }
              : it,
          ),
        );
      }, 250);

      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, uploadFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: uploadFile.type,
        });

      cancelled = true;
      clearInterval(tick);

      if (upErr) {
        update(item.id, { status: "error", error: upErr.message, progress: 0 });
        return false;
      }

      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);

      const { error: dbErr } = await supabase.from("media_library").insert({
        url: pub.publicUrl,
        storage_path: path,
        type: item.isImage ? "image" : "video",
        mime_type: uploadFile.type,
        file_name: item.file.name,
        file_size: uploadFile.size,
        width: width || null,
        height: height || null,
        folder,
        uploaded_by: user?.id || null,
      });

      if (dbErr) {
        update(item.id, { status: "error", error: dbErr.message, progress: 0 });
        return false;
      }

      update(item.id, { status: "done", progress: 100, finalSize: uploadFile.size });
      return true;
    } catch (e: any) {
      update(item.id, { status: "error", error: e?.message || "Upload failed", progress: 0 });
      return false;
    }
  };

  const runQueue = async (items: QueueItem[]) => {
    setRunning(true);
    let ok = 0;
    // Run up to 3 in parallel for snappy bulk uploads
    const concurrency = 3;
    let cursor = 0;
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const idx = cursor++;
        const item = items[idx];
        const success = await processOne(item);
        if (success) ok++;
      }
    });
    await Promise.all(workers);
    setRunning(false);
    toast({
      title: "Bulk upload complete",
      description: `${ok}/${items.length} uploaded successfully.`,
    });
    onComplete?.(ok);
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const accepted: QueueItem[] = [];
      const rejected: string[] = [];

      Array.from(files).forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
          rejected.push(`${file.name}: unsupported type`);
          return;
        }
        if (isImage && !IMAGE_TYPES.includes(file.type)) {
          rejected.push(`${file.name}: unsupported image type`);
          return;
        }
        if (isVideo && !VIDEO_TYPES.includes(file.type)) {
          rejected.push(`${file.name}: unsupported video type`);
          return;
        }
        const sizeMB = file.size / 1024 / 1024;
        const limit = isImage ? maxImageMB : maxVideoMB;
        if (sizeMB > limit) {
          rejected.push(`${file.name}: too large (${sizeMB.toFixed(1)} MB > ${limit} MB)`);
          return;
        }
        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          status: "pending",
          progress: 0,
          originalSize: file.size,
          isImage,
        });
      });

      if (rejected.length) {
        toast({
          title: `${rejected.length} file(s) skipped`,
          description: rejected.slice(0, 3).join(" · "),
          variant: "destructive",
        });
      }
      if (accepted.length) {
        setQueue(accepted);
        // Defer to next tick so user sees the queue render before processing
        setTimeout(() => runQueue(accepted), 50);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder, maxImageMB, maxVideoMB],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const clearDone = () => setQueue((q) => q.filter((it) => it.status !== "done"));

  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !running && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          "bg-muted/30 hover:bg-muted/50 border-border",
          isDragging && "border-primary bg-primary/5",
          running && "cursor-not-allowed opacity-90",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="rounded-full bg-primary/10 p-4">
          <Upload className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold">
            {running ? "Uploading..." : "Drag & drop multiple files"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · images auto-optimized to WebP · max {maxImageMB}MB image, {maxVideoMB >= 1024 ? `${(maxVideoMB / 1024).toFixed(0)}GB` : `${maxVideoMB}MB`} video
          </p>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
            <p className="text-sm font-medium">
              {queue.length} file{queue.length !== 1 ? "s" : ""} ·{" "}
              <span className="text-hope-green">{doneCount} done</span>
              {errorCount > 0 && (
                <span className="text-destructive"> · {errorCount} failed</span>
              )}
            </p>
            {!running && doneCount > 0 && (
              <Button size="sm" variant="ghost" onClick={clearDone}>
                Clear completed
              </Button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {queue.map((item) => (
              <div key={item.id} className="px-4 py-2 flex items-center gap-3">
                <div className="text-muted-foreground shrink-0">
                  {item.isImage ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <Film className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={item.progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
                      {item.status === "compressing" && "Optimizing"}
                      {item.status === "uploading" && `${Math.round(item.progress)}%`}
                      {item.status === "pending" && "Queued"}
                      {item.status === "done" && formatBytes(item.finalSize || item.originalSize)}
                      {item.status === "error" && "Failed"}
                    </span>
                  </div>
                  {item.error && (
                    <p className="text-xs text-destructive mt-0.5 truncate">{item.error}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === "done" && <CheckCircle2 className="w-4 h-4 text-hope-green" />}
                  {item.status === "error" && <XCircle className="w-4 h-4 text-destructive" />}
                  {(item.status === "uploading" || item.status === "compressing") && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkMediaUploader;
