import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackIcon, CalendarIcon, ImagePlusIcon, CloseIcon } from '../components/icons';
import PhotoImg from '../components/PhotoImg';
import {
  getEntryByDate,
  saveEntry,
  putPhoto,
  deleteEntry,
} from '../lib/db';
import { importImage } from '../lib/image';
import {
  parseMmdd,
  toMmdd,
  formatMmddKo,
  daysInMonth,
  currentYear,
} from '../lib/date';
import './Editor.css';

export default function Editor() {
  const navigate = useNavigate();
  const { mmdd = '01-01', year: yearParam } = useParams();

  const initial = parseMmdd(mmdd);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [year, setYear] = useState(Number(yearParam) || currentYear());

  const [entryId, setEntryId] = useState<string | undefined>();
  const [body, setBody] = useState('');
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingDate, setEditingDate] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);

  // Load existing entry for this (mmdd, year) if present.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getEntryByDate(toMmdd(month, day), year).then((e) => {
      if (!active) return;
      if (e) {
        setEntryId(e.id);
        setBody(e.body);
        setPhotoIds(e.photoIds);
      } else {
        setEntryId(undefined);
        setBody('');
        setPhotoIds([]);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, day, year]);

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const photo = await importImage(file);
        await putPhoto(photo);
        added.push(photo.id);
      }
      setPhotoIds((prev) => [...prev, ...added]);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setPhotoIds((prev) => prev.filter((p) => p !== id));
  };

  const reorder = (from: number, to: number) => {
    setPhotoIds((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onSave = async () => {
    setBusy(true);
    try {
      const saved = await saveEntry({ id: entryId, year, month, day, body, photoIds });
      // if the entry is now empty (no body, no photos) remove it instead.
      if (!body.trim() && photoIds.length === 0) {
        await deleteEntry(saved.id);
      }
      navigate(`/?d=${toMmdd(month, day)}`, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const years = [];
  for (let y = currentYear() + 1; y >= currentYear() - 49; y--) years.push(y);
  const dim = daysInMonth(month, year);

  return (
    <div className="editor">
      <header className="appbar">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="뒤로">
          <BackIcon />
        </button>
        <div className="appbar-title serif editor-title">
          {formatMmddKo(toMmdd(month, day))} · {year}
        </div>
        <button className="pill" onClick={onSave} disabled={busy || loading}>
          저장
        </button>
      </header>

      <div className="page editor-page">
        <button
          className="datechip"
          onClick={() => setEditingDate((v) => !v)}
        >
          <CalendarIcon size={18} />
          <span>
            {year}년 {month}월 {day}일
          </span>
        </button>

        {editingDate && (
          <div className="date-editor">
            <label>
              년
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label>
              월
              <select
                value={month}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setMonth(m);
                  setDay((d) => Math.min(d, daysInMonth(m, year)));
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label>
              일
              <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
                {Array.from({ length: dim }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="photo-strip">
          {photoIds.map((id, idx) => (
            <div
              key={id}
              className="photo-tile"
              draggable
              onDragStart={() => (dragIdx.current = idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx.current !== null) reorder(dragIdx.current, idx);
                dragIdx.current = null;
              }}
            >
              <PhotoImg photoId={id} alt="" className="photo-tile-img" />
              <button
                className="photo-remove"
                onClick={() => removePhoto(id)}
                aria-label="사진 삭제"
              >
                <CloseIcon size={14} strokeWidth={2.4} />
              </button>
            </div>
          ))}

          <button
            className="photo-add"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <ImagePlusIcon size={22} />
            <span>사진</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => onPickFiles(e.target.files)}
          />
        </div>

        <textarea
          className="editor-body"
          placeholder="오늘 하루를 적어보세요"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
    </div>
  );
}
