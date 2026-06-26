import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from '../components/icons';
import BottomNav from '../components/BottomNav';
import PhotoImg from '../components/PhotoImg';
import { getAllEntries } from '../lib/db';
import type { Entry } from '../lib/types';
import {
  WEEKDAYS_KO,
  currentYear,
  daysInMonth,
  toMmdd,
  todayMmdd,
} from '../lib/date';
import './Calendar.css';

export default function Calendar() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    getAllEntries().then(setEntries);
  }, []);

  // entries for this displayed year+month, keyed by day.
  const byDay = useMemo(() => {
    const map = new Map<number, Entry>();
    entries.forEach((e) => {
      if (e.year === year && e.month === month) map.set(e.day, e);
    });
    return map;
  }, [entries, year, month]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const firstDow = new Date(year, month - 1, 1).getDay();
  const dim = daysInMonth(month, year);
  const todayM = todayMmdd();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  return (
    <>
      <header className="appbar">
        <span className="icon-btn" aria-hidden />
        <h1 className="appbar-title serif cal-title">기록 달력</h1>
        <span className="icon-btn" aria-hidden />
      </header>

      <main className="page page--with-nav cal-page">
        <div className="cal-monthbar">
          <button className="icon-btn" onClick={prevMonth} aria-label="이전 달">
            <ChevronLeft />
          </button>
          <div className="cal-monthlabel">
            <div className="serif cal-year">{year}</div>
            <div className="serif cal-month">{month}월</div>
          </div>
          <button className="icon-btn" onClick={nextMonth} aria-label="다음 달">
            <ChevronRight />
          </button>
        </div>

        <div className="cal-card">
          <div className="cal-weekdays">
            {WEEKDAYS_KO.map((w, i) => (
              <div
                key={w}
                className={`cal-weekday${i === 0 ? ' is-sun' : ''}${
                  i === 6 ? ' is-sat' : ''
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="cal-grid">
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} className="cal-cell cal-cell--empty" />;
              const entry = byDay.get(d);
              const mmdd = toMmdd(month, d);
              const isToday = mmdd === todayM && year === currentYear();
              const dow = (firstDow + d - 1) % 7;
              return (
                <button
                  key={d}
                  className={`cal-cell${isToday ? ' is-today' : ''}`}
                  onClick={() => navigate(`/?d=${mmdd}`)}
                >
                  <span
                    className={`cal-day${dow === 0 ? ' is-sun' : ''}${
                      dow === 6 ? ' is-sat' : ''
                    }`}
                  >
                    {d}
                  </span>
                  {entry && entry.photoIds[0] ? (
                    <PhotoImg
                      photoId={entry.photoIds[0]}
                      alt=""
                      className="cal-thumb"
                    />
                  ) : entry ? (
                    <span className="cal-dot" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
