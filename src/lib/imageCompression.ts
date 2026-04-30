/**
 * Compress an image client-side: resize to fit within maxDimension and re-encode as WebP.
 * Skips GIFs (to preserve animation) and AVIF (already efficient). Falls back to original on failure.
 * Returns the (possibly new) File plus measured dimensions.
 */
export interface CompressionResult {
  file: File;
  width: number;
  height: number;
  savedBytes: number;
}

export const compressImage = async (
  file: File,
  maxDimension = 1920,
  quality = 0.82,
): Promise<CompressionResult> => {
  const passthrough = (w = 0, h = 0): CompressionResult => ({
    file,
    width: w,
    height: h,
    savedBytes: 0,
  });
  if (file.type === "image/gif" || file.type === "image/avif") return passthrough();

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
    if (!ctx) return passthrough(width, height);
    ctx.drawImage(source, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality),
    );
    if (!blob) return passthrough(width, height);
    if (blob.size >= file.size && scale === 1) return passthrough(width, height);

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const newFile = new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
    return {
      file: newFile,
      width: targetW,
      height: targetH,
      savedBytes: file.size - newFile.size,
    };
  } catch {
    return passthrough();
  }
};

/** Get video dimensions via a hidden <video> element. */
export const probeVideoDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      video.src = url;
    } catch {
      resolve({ width: 0, height: 0 });
    }
  });
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};
