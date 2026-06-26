export type Entry = {
  id: string; // uuid
  year: number; // e.g. 2026
  month: number; // 1-12
  day: number; // 1-31
  mmdd: string; // derived index key, "06-25" (zero-pad)
  body: string;
  photoIds: string[]; // Photo.id references (order = display order)
  createdAt: number;
  updatedAt: number;
};

export type Photo = {
  id: string; // uuid
  full: Blob; // display (long edge <= 1600px)
  thumb: Blob; // thumbnail (long edge <= 320px)
  w: number;
  h: number;
};
