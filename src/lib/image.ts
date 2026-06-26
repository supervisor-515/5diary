import { uuid } from './db';
import type { Photo } from './types';

const FULL_MAX = 1600;
const THUMB_MAX = 320;

const fit = (w: number, h: number, max: number) => {
  const long = Math.max(w, h);
  if (long <= max) return { w, h };
  const scale = max / long;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
};

// Decode with EXIF orientation already applied. createImageBitmap with
// imageOrientation:'from-image' handles rotation in all modern browsers.
const decode = async (file: Blob): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Fallback for browsers without the option support.
    return await createImageBitmap(file);
  }
};

const drawToBlob = async (
  src: ImageBitmap,
  target: { w: number; h: number },
  quality = 0.85,
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = target.w;
  canvas.height = target.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, target.w, target.h);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  if (!blob) throw new Error('toBlob failed');
  return blob;
};

// Import a user file -> Photo with resized full + thumb blobs.
export const importImage = async (file: Blob): Promise<Photo> => {
  const bitmap = await decode(file);
  const w = bitmap.width;
  const h = bitmap.height;

  const fullSize = fit(w, h, FULL_MAX);
  const thumbSize = fit(w, h, THUMB_MAX);

  const full = await drawToBlob(bitmap, fullSize, 0.85);
  const thumb = await drawToBlob(bitmap, thumbSize, 0.8);
  bitmap.close?.();

  return {
    id: uuid(),
    full,
    thumb,
    w: fullSize.w,
    h: fullSize.h,
  };
};

/* ---------- blob <-> dataURL helpers (used by JSON backup) ---------- */

export const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const res = await fetch(dataURL);
  return res.blob();
};
