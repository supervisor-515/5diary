import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Entry, Photo } from './types';
import { toMmdd } from './date';

interface DiaryDB extends DBSchema {
  entries: {
    key: string;
    value: Entry;
    indexes: { 'by-mmdd': string; 'by-year': number };
  };
  photos: {
    key: string;
    value: Photo;
  };
}

const DB_NAME = 'warm-paper-diary';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DiaryDB>> | null = null;

export const getDB = (): Promise<IDBPDatabase<DiaryDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<DiaryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const entries = db.createObjectStore('entries', { keyPath: 'id' });
        entries.createIndex('by-mmdd', 'mmdd');
        entries.createIndex('by-year', 'year');
        db.createObjectStore('photos', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const uuid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

/* ---------- Entry CRUD ---------- */

// Core page query: all years' entries for one mmdd, newest year first.
export const getEntriesByMmdd = async (mmdd: string): Promise<Entry[]> => {
  const db = await getDB();
  const entries = await db.getAllFromIndex('entries', 'by-mmdd', mmdd);
  return entries.sort((a, b) => b.year - a.year);
};

export const getEntry = async (id: string): Promise<Entry | undefined> => {
  const db = await getDB();
  return db.get('entries', id);
};

export const getEntryByDate = async (
  mmdd: string,
  year: number,
): Promise<Entry | undefined> => {
  const entries = await getEntriesByMmdd(mmdd);
  return entries.find((e) => e.year === year);
};

export const getAllEntries = async (): Promise<Entry[]> => {
  const db = await getDB();
  return db.getAll('entries');
};

// Upsert by (mmdd, year): reuse existing id when present so a day/year is unique.
export const saveEntry = async (input: {
  id?: string;
  year: number;
  month: number;
  day: number;
  body: string;
  photoIds: string[];
}): Promise<Entry> => {
  const db = await getDB();
  const mmdd = toMmdd(input.month, input.day);
  const now = Date.now();

  let existing: Entry | undefined;
  if (input.id) {
    existing = await db.get('entries', input.id);
  }
  if (!existing) {
    existing = await getEntryByDate(mmdd, input.year);
  }

  const entry: Entry = {
    id: existing?.id ?? input.id ?? uuid(),
    year: input.year,
    month: input.month,
    day: input.day,
    mmdd,
    body: input.body,
    photoIds: input.photoIds,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.put('entries', entry);
  return entry;
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await getDB();
  const entry = await db.get('entries', id);
  if (entry) {
    await Promise.all(entry.photoIds.map((pid) => deletePhotoIfOrphan(pid, id)));
  }
  await db.delete('entries', id);
};

/* ---------- Photo CRUD ---------- */

export const getPhoto = async (id: string): Promise<Photo | undefined> => {
  const db = await getDB();
  return db.get('photos', id);
};

export const getPhotos = async (ids: string[]): Promise<Photo[]> => {
  const db = await getDB();
  const photos = await Promise.all(ids.map((id) => db.get('photos', id)));
  return photos.filter((p): p is Photo => !!p);
};

export const putPhoto = async (photo: Photo): Promise<void> => {
  const db = await getDB();
  await db.put('photos', photo);
};

export const getAllPhotos = async (): Promise<Photo[]> => {
  const db = await getDB();
  return db.getAll('photos');
};

// Delete a photo only if no other entry still references it.
const deletePhotoIfOrphan = async (photoId: string, excludeEntryId: string) => {
  const db = await getDB();
  const all = await db.getAll('entries');
  const stillUsed = all.some(
    (e) => e.id !== excludeEntryId && e.photoIds.includes(photoId),
  );
  if (!stillUsed) {
    await db.delete('photos', photoId);
  }
};

/* ---------- meta (small settings; not photos) ---------- */

const META_KEY = 'wpd:meta';

export type Meta = {
  displayYears: 5 | 10 | 'all';
};

export const defaultMeta: Meta = { displayYears: 10 };

export const getMeta = (): Meta => {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta;
    return { ...defaultMeta, ...JSON.parse(raw) };
  } catch {
    return defaultMeta;
  }
};

export const setMeta = (meta: Meta): void => {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
};
