import { useEffect, useMemo, useState } from 'react';
import analystImage from '../assets/optimized/advisor_profile/advisor_analyst_profile.png';
import gamblerImage from '../assets/optimized/advisor_profile/advisor_gambler_profile.png';
import guardianImage from '../assets/optimized/advisor_profile/advisor_guardian_profile.png';
import raiderImage from '../assets/optimized/advisor_profile/advisor_raider_profile.png';
import {
  CLEAR_GRADE_COLORS,
  RECORD_RESULT_TYPES,
  buildRunRecord,
  formatNumberWon,
  getRecordRows,
} from '../logic/recordEngine';
import { playBGM } from '../logic/audioEngine';
import { saveRecord } from '../logic/saveEngine';
import { useGameStore } from '../store/useGameStore';
import '../styles/ending.css';

const ADVISOR_IMAGES = Object.freeze({
  raider: raiderImage,
  guardian: guardianImage,
  analyst: analystImage,
  gambler: gamblerImage,
});

const PAGE_COUNT = 3;

export default function EndingScreen() {
  const state = useGameStore();
  const restartToTitle = useGameStore((store) => store.restartToTitle);
  const [page, setPage] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle');
  const record = useMemo(() => buildRunRecord(state, RECORD_RESULT_TYPES.CLEAR), [state]);
  const gradeColor = CLEAR_GRADE_COLORS[record.clear_grade] ?? '#00FF41';

  useEffect(() => {
    if (page === 0) {
      playBGM('main');
    }
  }, [page]);

  async function handleSave() {
    setSaveStatus('saving');
    const saved = await saveRecord(record);
    setSaveStatus(saved === false ? 'failed' : 'saved');
  }

  return (
    <main className="cr2-ending-screen">
      <section className="cr2-ending-panel" style={{ '--cr2-grade-color': gradeColor }}>
        <div className="cr2-page-body">
          {page === 0 ? <ClearPage record={record} /> : null}
          {page === 1 ? <ClearStatsPage record={record} /> : null}
          {page === 2 ? (
            <SavePage
              saveStatus={saveStatus}
              onSave={handleSave}
              onTitle={restartToTitle}
            />
          ) : null}
        </div>
        <PageNav page={page} setPage={setPage} />
      </section>
    </main>
  );
}

function ClearPage({ record }) {
  const advisorImage = ADVISOR_IMAGES[record.advisor_id];

  return (
    <article className="cr2-ending-page cr2-ending-page--hero">
      <div className="cr2-ending-art">
        <span>CLEAR</span>
      </div>
      <h1>{record.clear_grade} 등급 클리어</h1>
      <div className="cr2-ending-advisor">
        {advisorImage ? <img alt="" src={advisorImage} /> : null}
        <strong>{record.advisor_name}와 함께</strong>
      </div>
      <dl className="cr2-ending-summary">
        <div>
          <dt>최종 자본</dt>
          <dd>{formatNumberWon(record.final_capital)}</dd>
        </div>
        <div>
          <dt>신용등급</dt>
          <dd>{record.credit_grade}</dd>
        </div>
      </dl>
    </article>
  );
}

function ClearStatsPage({ record }) {
  return (
    <article className="cr2-ending-page">
      <p className="cr2-kicker">CLEAR STATS</p>
      <h1>클리어 통계</h1>
      <div className="cr2-run-scroll">
        <dl className="cr2-record-table">
          {getRecordRows(record).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="cr2-met-rivals">
          {(record.met_rivals ?? []).length > 0
            ? record.met_rivals.map((rivalId) => <span key={rivalId}>{rivalId}</span>)
            : <span>만난 라이벌 기록 없음</span>}
        </div>
      </div>
    </article>
  );
}

function SavePage({ saveStatus, onSave, onTitle }) {
  return (
    <article className="cr2-ending-page cr2-ending-page--save">
      <p className="cr2-kicker">SAVE RECORD</p>
      <h1>기록 저장</h1>
      <p>이 클리어 기록을 플레이 기록에 저장하시겠습니까?</p>
      <button
        className="cr2-primary-button"
        disabled={saveStatus === 'saving' || saveStatus === 'saved'}
        type="button"
        onClick={onSave}
      >
        {saveStatus === 'saving' ? '저장 중...' : '저장하기'}
      </button>
      {saveStatus === 'saved' ? <strong className="cr2-save-success">플레이 기록에 저장됐습니다.</strong> : null}
      {saveStatus === 'failed' ? <strong className="cr2-save-failed">저장에 실패했습니다. 로컬 기록은 남겼습니다.</strong> : null}
      <button className="cr2-secondary-button" type="button" onClick={onTitle}>
        타이틀로
      </button>
    </article>
  );
}

function PageNav({ page, setPage }) {
  return (
    <footer className="cr2-run-nav">
      <button
        className="cr2-secondary-button"
        disabled={page === 0}
        type="button"
        onClick={() => setPage((current) => Math.max(0, current - 1))}
      >
        이전
      </button>
      <span>{Array.from({ length: PAGE_COUNT }, (_, index) => (index === page ? '●' : '○')).join(' ')}</span>
      <button
        className="cr2-secondary-button"
        disabled={page === PAGE_COUNT - 1}
        type="button"
        onClick={() => setPage((current) => Math.min(PAGE_COUNT - 1, current + 1))}
      >
        다음
      </button>
    </footer>
  );
}
