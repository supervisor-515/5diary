import { getAllEntries, getAllPhotos, getDB } from './db';
import { blobToDataURL, dataURLToBlob } from './image';
import type { Entry, Photo } from './types';

const BACKUP_VERSION = 1;

type BackupPhoto = {
  id: string;
  w: number;
  h: number;
  full: string; // dataURL
  thumb: string; // dataURL
};

type Backup = {
  version: number;
  entries: Entry[];
  photos: BackupPhoto[];
};

// Export everything to a single JSON. Photos embedded as base64 dataURLs.
// NOTE (v1): JSON gets heavy with many photos. Future upgrade path: ZIP
// backup with a metadata file + individual image files instead of base64.
export const exportBackup = async (): Promise<Blob> => {
  const [entries, photos] = await Promise.all([getAllEntries(), getAllPhotos()]);
  const backupPhotos: BackupPhoto[] = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      w: p.w,
      h: p.h,
      full: await blobToDataURL(p.full),
      thumb: await blobToDataURL(p.thumb),
    })),
  );
  const data: Backup = { version: BACKUP_VERSION, entries, photos: backupPhotos };
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
};

export const downloadBackup = async (): Promise<void> => {
  const blob = await exportBackup();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `warm-paper-diary-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Merge a backup into IndexedDB (same id overwrites).
export const importBackup = async (
  file: File,
): Promise<{ entries: number; photos: number }> => {
  const text = await file.text();
  const data = JSON.parse(text) as Backup;
  if (!data || !Array.isArray(data.entries) || !Array.isArray(data.photos)) {
    throw new Error('잘못된 백업 파일 형식입니다.');
  }

  const db = await getDB();

  const photos: Photo[] = await Promise.all(
    data.photos.map(async (p) => ({
      id: p.id,
      w: p.w,
      h: p.h,
      full: await dataURLToBlob(p.full),
      thumb: await dataURLToBlob(p.thumb),
    })),
  );

  const tx = db.transaction(['entries', 'photos'], 'readwrite');
  await Promise.all([
    ...photos.map((p) => tx.objectStore('photos').put(p)),
    ...data.entries.map((e) => tx.objectStore('entries').put(e)),
    tx.done,
  ]);

  return { entries: data.entries.length, photos: photos.length };
};
