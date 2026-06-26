import { useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import {
  DownloadIcon,
  UploadIcon,
  HistoryIcon,
  PaletteIcon,
  InfoIcon,
  ChevronRight,
} from '../components/icons';
import { getMeta, setMeta, type Meta } from '../lib/db';
import { downloadBackup, importBackup } from '../lib/backup';
import './Settings.css';

const APP_VERSION = 'v1.0.4';
const OPTIONS: { label: string; value: Meta['displayYears'] }[] = [
  { label: '5년', value: 5 },
  { label: '10년', value: 10 },
  { label: '전체', value: 'all' },
];

export default function Settings() {
  const [meta, setMetaState] = useState<Meta>(getMeta());
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateDisplayYears = (value: Meta['displayYears']) => {
    const next = { ...meta, displayYears: value };
    setMetaState(next);
    setMeta(next);
  };

  const onExport = async () => {
    setBusy(true);
    try {
      await downloadBackup();
    } catch (e) {
      alert('내보내기에 실패했습니다.');
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    if (
      !confirm(
        '가져오기를 진행하면 같은 항목은 덮어쓰여집니다. 계속하시겠어요?',
      )
    ) {
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setBusy(true);
    try {
      const res = await importBackup(file);
      alert(`가져오기 완료: 기록 ${res.entries}개, 사진 ${res.photos}장`);
    } catch (e) {
      alert(e instanceof Error ? e.message : '가져오기에 실패했습니다.');
      console.error(e);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <header className="appbar">
        <span className="icon-btn" aria-hidden />
        <h1 className="appbar-title serif set-apptitle">Warm Paper Diary</h1>
        <span className="icon-btn" aria-hidden />
      </header>

      <main className="page page--with-nav set-page">
        <div className="set-head">
          <h2 className="set-h2">설정</h2>
          <p className="set-sub">다이어리의 환경을 관리합니다.</p>
        </div>

        <section className="set-group">
          <div className="set-grouptitle">백업</div>
          <div className="set-card">
            <button className="set-row" onClick={onExport} disabled={busy}>
              <span className="set-rowicon">
                <DownloadIcon size={20} />
              </span>
              <span className="set-rowlabel">내보내기 (JSON)</span>
              <ChevronRight size={20} className="set-chev" />
            </button>
            <div className="set-divider" />
            <button
              className="set-row"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <span className="set-rowicon">
                <UploadIcon size={20} />
              </span>
              <span className="set-rowlabel">가져오기</span>
              <ChevronRight size={20} className="set-chev" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => onImportFile(e.target.files?.[0])}
            />
          </div>
        </section>

        <section className="set-group">
          <div className="set-grouptitle">표시</div>
          <div className="set-card">
            <div className="set-row set-row--stack">
              <div className="set-rowtop">
                <span className="set-rowicon">
                  <HistoryIcon size={20} />
                </span>
                <span className="set-rowlabel">표시 연수</span>
              </div>
              <div className="segment">
                {OPTIONS.map((o) => (
                  <button
                    key={String(o.value)}
                    className={`segment-item${
                      meta.displayYears === o.value ? ' is-active' : ''
                    }`}
                    onClick={() => updateDisplayYears(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="set-divider" />
            <div className="set-row">
              <span className="set-rowicon">
                <PaletteIcon size={20} />
              </span>
              <span className="set-rowlabel">테마</span>
              <span className="set-rowvalue">Warm Analog</span>
            </div>
          </div>
        </section>

        <section className="set-group">
          <div className="set-grouptitle">정보</div>
          <div className="set-card">
            <div className="set-row">
              <span className="set-rowicon">
                <InfoIcon size={20} />
              </span>
              <span className="set-rowlabel">앱 정보</span>
              <span className="set-rowvalue">{APP_VERSION}</span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
