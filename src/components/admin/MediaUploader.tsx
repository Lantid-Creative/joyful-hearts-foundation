import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Film, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaUploaderKind = "image" | "video" | "any";

interface MediaUploaderProps {
  value?: string;
  mediaType?: "image" | "video";
  onChange: (url: string, mediaType: "image" | "video") => void;
  onClear?: () => void;
  /** Allowed kind. "any" lets the user upload either. */
  kind?: MediaUploaderKind;
  /** Folder inside the `media` bucket (e.g. "hero", "gallery"). */
  folder?: string;
  /** Recommended dimensions hint, e.g. "1920 × 1080 (16:9)". */
  recommendedSize?: string;
  /** Recommended file size hint, e.g. "Under 500 KB". */
  recommendedWeight?: string;
  /** Hard max file size in MB. Defaults: 10MB image, 1024MB video. */
  maxSizeMB?: number;
  className?: string;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/**
 * Compress an image client-side: resize to fit within maxDimension and re-encode as WebP.
 * Skips GIFs (to preserve animation) and AVIF (already efficient). Falls back to original on failure.
 */
const compressImage = async (
  file: File,
  maxDimension = 1920,
  quality = 0.82,
): Promise<File> => {
  if (file.type === "image/gif" || file.type === "image/avif") return file;
  try {
    const bitmap = await createImageBitmap(file).catch(() => null);
    let width: number;
    let height: number;
    let source: CanvasImageSource;

    if (bitmap) {
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      // Fallback via HTMLImageElement
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      URL.revokeObjectURL(url);
      width = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    }

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality),
    );
    if (!blob) return file;
    // Only use compressed version if it's actually smaller
    if (blob.size >= file.size && scale === 1) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  }
};

const MediaUploader = ({
  value,
  mediaType = "image",
  onChange,
  onClear,
  kind = "image",
  folder = "uploads",
  recommendedSize,
  recommendedWeight,
  maxSizeMB,
  className,
}: MediaUploaderProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<{ size: number; name: string } | null>(null);

  const acceptList =
    kind === "image" ? IMAGE_TYPES : kind === "video" ? VIDEO_TYPES : [...IMAGE_TYPES, ...VIDEO_TYPES];
  const accept = acceptList.join(",");
  const effectiveMaxMB = maxSizeMB ?? (kind === "video" ? 1024 : 10);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      // Validate type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (kind === "image" && !isImage) {
        toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
        return;
      }
      if (kind === "video" && !isVideo) {
        toast({ title: "Invalid file", description: "Please upload a video.", variant: "destructive" });
        return;
      }
      if (kind === "any" && !isImage && !isVideo) {
        toast({ title: "Invalid file", description: "Upload an image or video.", variant: "destructive" });
        return;
      }

      // Validate size
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB > effectiveMaxMB) {
        toast({
          title: "File too large",
          description: `Max allowed is ${effectiveMaxMB} MB. Yours is ${sizeMB.toFixed(1)} MB.`,
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      setProgress(5);
      setPreviewMeta({ size: file.size, name: file.name });

      // Compress images before upload (videos pass through)
      let uploadFile = file;
      let savedBytes = 0;
      if (isImage) {
        const compressed = await compressImage(file, 1920, 0.82);
        if (compressed !== file) {
          savedBytes = file.size - compressed.size;
          uploadFile = compressed;
        }
      }

      // Simulated progress while upload runs (Supabase JS doesn't expose progress events for storage)
      const tick = setInterval(() => {
        setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.08) : p));
      }, 200);

      const ext = uploadFile.name.split(".").pop() || "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage.from("media").upload(path, uploadFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: uploadFile.type,
      });

      clearInterval(tick);

      if (error) {
        setUploading(false);
        setProgress(0);
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        return;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 400);

      onChange(data.publicUrl, isVideo ? "video" : "image");
      const savingsNote =
        savedBytes > 0
          ? ` · optimized, saved ${formatBytes(savedBytes)}`
          : "";
      toast({
        title: "Uploaded",
        description: `${uploadFile.name} (${formatBytes(uploadFile.size)})${savingsNote}`,
      });
    },
    [folder, kind, effectiveMaxMB, onChange, toast],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const hasPreview = !!value;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          "bg-muted/30 hover:bg-muted/50 border-border",
          isDragging && "border-primary bg-primary/5",
          uploading && "cursor-not-allowed opacity-90",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {hasPreview && !uploading ? (
          <div className="w-full">
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-lg bg-background shadow-sm">
              {mediaType === "video" ? (
                <video src={value} controls className="w-full h-48 object-cover bg-black" />
              ) : (
                <img src={value} alt="preview" className="w-full h-48 object-cover" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Replace
              </Button>
              {onClear && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              )}
            </div>
          </div>
        ) : uploading ? (
          <div className="w-full max-w-sm space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm font-medium">
              {progress < 15 && previewMeta ? "Optimizing" : "Uploading"}
              {previewMeta ? ` ${previewMeta.name}` : "..."}
            </p>
            {previewMeta && (
              <p className="text-xs text-muted-foreground">{formatBytes(previewMeta.size)}</p>
            )}
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}%
              {progress < 15 ? " · resizing & converting to WebP" : ""}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Drag & drop or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {kind === "image" && "JPG, PNG, WebP, GIF, AVIF · auto-optimized to WebP, max 1920px"}
                {kind === "video" && "MP4, WebM, MOV, MKV"}
                {kind === "any" && "Image (auto-optimized) or video"}
                {" · max "}
                {effectiveMaxMB >= 1024 ? `${(effectiveMaxMB / 1024).toFixed(0)} GB` : `${effectiveMaxMB} MB`}
              </p>
            </div>
            {(recommendedSize || recommendedWeight) && (
              <div className="text-xs text-muted-foreground border-t pt-2 mt-1 w-full max-w-xs">
                <div className="flex items-center justify-center gap-1.5">
                  {kind === "video" ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span className="font-medium">Recommended:</span>
                </div>
                {recommendedSize && <p>{recommendedSize}</p>}
                {recommendedWeight && <p>{recommendedWeight}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
