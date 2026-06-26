import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { CloseIcon } from '../components/icons';
import PhotoImg from '../components/PhotoImg';
import { getEntry } from '../lib/db';
import type { Entry } from '../lib/types';
import { formatFullKo } from '../lib/date';
import './PhotoViewer.css';

export default function PhotoViewer() {
  const navigate = useNavigate();
  const { entryId = '', index = '0' } = useParams();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [idx, setIdx] = useState(Number(index) || 0);

  useEffect(() => {
    let active = true;
    getEntry(entryId).then((e) => {
      if (!active) return;
      setEntry(e ?? null);
    });
    return () => {
      active = false;
    };
  }, [entryId]);

  const photos = entry?.photoIds ?? [];
  const close = () => navigate(-1);

  const go = (next: number) => {
    if (photos.length === 0) return;
    setIdx((next + photos.length) % photos.length);
  };

  const swipe = useSwipeable({
    onSwipedLeft: () => go(idx + 1),
    onSwipedRight: () => go(idx - 1),
    onSwipedDown: close,
    trackMouse: true,
    delta: 40,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, photos.length]);

  return (
    <div className="viewer" {...swipe}>
      <button className="viewer-close" onClick={close} aria-label="닫기">
        <CloseIcon size={26} />
      </button>

      <div className="viewer-stage">
        {photos[idx] && (
          <PhotoImg
            key={photos[idx]}
            photoId={photos[idx]}
            variant="full"
            alt=""
            className="viewer-img"
          />
        )}
      </div>

      <div className="viewer-footer">
        {photos.length > 1 && (
          <div className="viewer-dots">
            {photos.map((id, i) => (
              <span
                key={id}
                className={`viewer-dot${i === idx ? ' is-active' : ''}`}
              />
            ))}
          </div>
        )}
        {entry && (
          <div className="viewer-caption">
            {formatFullKo(entry.year, entry.month, entry.day)}
          </div>
        )}
      </div>
    </div>
  );
}
