import { useNavigate, useLocation } from 'react-router-dom';
import { TimelineIcon, CalendarIcon, PencilIcon, GearIcon } from './icons';
import { todayMmdd, currentYear } from '../lib/date';
import './BottomNav.css';

// Unified Korean bottom nav: 타임라인 · 달력 · 쓰기 · 설정
export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHome = pathname === '/' || pathname.startsWith('/?');
  const isCalendar = pathname.startsWith('/calendar');
  const isSettings = pathname.startsWith('/settings');

  const goWrite = () => navigate(`/edit/${todayMmdd()}/${currentYear()}`);

  return (
    <nav className="bottomnav">
      <button
        className={`bottomnav-item${isHome ? ' is-active' : ''}`}
        onClick={() => navigate('/')}
      >
        <TimelineIcon size={22} />
        <span>타임라인</span>
      </button>
      <button
        className={`bottomnav-item${isCalendar ? ' is-active' : ''}`}
        onClick={() => navigate('/calendar')}
      >
        <CalendarIcon size={22} />
        <span>달력</span>
      </button>
      <button className="bottomnav-item" onClick={goWrite}>
        <PencilIcon size={22} />
        <span>쓰기</span>
      </button>
      <button
        className={`bottomnav-item${isSettings ? ' is-active' : ''}`}
        onClick={() => navigate('/settings')}
      >
        <GearIcon size={22} />
        <span>설정</span>
      </button>
    </nav>
  );
}
