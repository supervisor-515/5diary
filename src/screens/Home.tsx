import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import {
  CalendarIcon,
  GearIcon,
  PencilIcon,
  ImagePlusIcon,
  PlusIcon,
} from '../components/icons';
import BottomNav from '../components/BottomNav';
import PhotoImg from '../components/PhotoImg';
import { getEntriesByMmdd, getMeta } from '../lib/db';
import type { Entry } from '../lib/types';
import {
  currentYear,
  formatMmddKo,
  nextMmdd,
  prevMmdd,
  todayMmdd,
  weekdayKo,
} from '../lib/date';
import './Home.css';

// Which year rows to render for this page. Years run from the current year
// down to (currentYear - displayYears + 1); each row shows its entry or an
// empty "start a record" state. Recorded years older than the window are still
// included so no data is hidden.
function useYearRows(entries: Entry[]) {
  return useMemo(() => {
    const meta = getMeta();
    const byYear = new Map<number, Entry>();
    entries.forEach((e) => byYear.set(e.year, e));

    const cy = currentYear();
    const years = new Set<number>([cy]);
    entries.forEach((e) => years.add(e.year));

    let floor = -Infinity;
    if (meta.displayYears !== 'all') {
      floor = cy - (meta.displayYears - 1);
    }

    return [...years]
      .filter((y) => y >= floor || byYear.has(y))
      .sort((a, b) => b - a)
      .map((year) => ({ year, entry: byYear.get(year) }));
  }, [entries]);
}

export default function Home() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const mmdd = params.get('d') || todayMmdd();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getEntriesByMmdd(mmdd).then((e) => {
      if (!active) return;
      setEntries(e);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [mmdd]);

  const rows = useYearRows(entries);

  const goMmdd = useCallback(
    (next: string) => {
      setParams(next === todayMmdd() ? {} : { d: next }, { replace: true });
    },
    [setParams],
  );

  const swipe = useSwipeable({
    onSwipedLeft: () => goMmdd(nextMmdd(mmdd)), // right->next day
    onSwipedRight: () => goMmdd(prevMmdd(mmdd)),
    trackMouse: true,
    preventScrollOnSwipe: false,
    delta: 40,
  });

  const headWeekday = weekdayKo(mmdd, currentYear());

  return (
    <>
      <header className="appbar">
        <button className="icon-btn" onClick={() => navigate('/calendar')} aria-label="달력">
          <CalendarIcon />
        </button>
        <div className="appbar-title home-date">
          <div className="serif home-date-main">{formatMmddKo(mmdd)}</div>
          {headWeekday && <div className="home-date-weekday">{headWeekday}요일</div>}
        </div>
        <div className="home-actions">
          <button className="pill" onClick={() => goMmdd(todayMmdd())}>
            오늘
          </button>
          <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="설정">
            <GearIcon />
          </button>
        </div>
      </header>

      <main className="page page--with-nav home-page" {...swipe}>
        {!loading &&
          rows.map(({ year, entry }) => (
            <YearCard
              key={year}
              year={year}
              entry={entry}
              onOpenPhoto={(entryId, idx) => navigate(`/photo/${entryId}/${idx}`)}
              onEdit={() => navigate(`/edit/${mmdd}/${year}`)}
            />
          ))}
      </main>

      <button
        className="fab"
        onClick={() => navigate(`/edit/${todayMmdd()}/${currentYear()}`)}
        aria-label="오늘 기록 쓰기"
      >
        <PencilIcon size={24} />
      </button>

      <BottomNav />
    </>
  );
}

function YearCard({
  year,
  entry,
  onOpenPhoto,
  onEdit,
}: {
  year: number;
  entry?: Entry;
  onOpenPhoto: (entryId: string, idx: number) => void;
  onEdit: () => void;
}) {
  if (!entry) {
    return (
      <button className="yearcard yearcard--empty" onClick={onEdit}>
        <div className="yearcard-thumb yearcard-thumb--empty">
          <ImagePlusIcon size={26} />
        </div>
        <div className="yearcard-body">
          <div className="serif yearcard-year yearcard-year--muted">{year}</div>
          <div className="yearcard-add">
            <PlusIcon size={15} /> 이 날 기록 남기기
          </div>
        </div>
      </button>
    );
  }

  const firstPhoto = entry.photoIds[0];
  return (
    <div className="yearcard" onClick={onEdit}>
      <div className="yearcard-thumb">
        {firstPhoto ? (
          <button
            className="yearcard-thumb-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhoto(entry.id, 0);
            }}
            aria-label="사진 보기"
          >
            <PhotoImg photoId={firstPhoto} alt="" className="yearcard-img" />
          </button>
        ) : (
          <div className="yearcard-thumb--empty">
            <ImagePlusIcon size={24} />
          </div>
        )}
      </div>
      <div className="yearcard-body">
        <div className="serif yearcard-year">{year}</div>
        <p className="yearcard-preview">{entry.body || ' '}</p>
      </div>
    </div>
  );
}
