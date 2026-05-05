import { useEffect, useMemo, useState } from 'react';
import {
  RECORD_RESULT_TYPES,
  formatNumberWon,
  formatTime,
  getCriticalReview,
  getRecordRows,
  normalizeRecord,
} from '../../logic/recordEngine';
import { loadAllRecords } from '../../logic/saveEngine';
import '../../styles/playRecord.css';

const PAGE_COUNT = 3;

export default function PlayRecord({ onBack = null }) {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadAllRecords().then((loadedRecords) => {
      if (!mounted) {
        return;
      }

      setRecords((loadedRecords ?? []).map(normalizeRecord));
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (selectedRecord) {
    return (
      <div className="cr2-play-record">
        <button className="cr2-record-back-button" type="button" onClick={() => setSelectedRecord(null)}>
          뒤로가기
        </button>
        <RecordDetail record={selectedRecord} page={page} setPage={setPage} />
      </div>
    );
  }

  return (
    <div className="cr2-play-record">
      <header className="cr2-play-record-head">
        <h2>플레이 기록</h2>
        {onBack ? (
          <button className="cr2-record-back-button" type="button" onClick={onBack}>
            뒤로가기
          </button>
        ) : null}
      </header>
      {loading ? <div className="cr2-record-empty-slot">기록 불러오는 중...</div> : null}
      {!loading && records.length === 0 ? <div className="cr2-record-empty-slot">아직 플레이 기록이 없습니다.</div> : null}
      <div className="cr2-record-slot-list">
        {records.map((record) => (
          <button
            className={[
              'cr2-record-slot',
              record.result_type === RECORD_RESULT_TYPES.CLEAR
                ? 'cr2-record-slot--clear'
                : 'cr2-record-slot--bankrupt',
            ].join(' ')}
            key={`${record.created_at}-${record.clear_floor}-${record.result_type}`}
            type="button"
            onClick={() => {
              setSelectedRecord(record);
              setPage(0);
            }}
          >
            <strong>{getRecordTitle(record)}</strong>
            <span>{record.advisor_name} · Floor {record.clear_floor}</span>
            <span>자본 {formatNumberWon(record.final_capital)}</span>
            <small>{formatRecordDate(record.created_at)} · {formatTime(record.playtime)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecordDetail({ record, page, setPage }) {
  const review = useMemo(() => getCriticalReview(record.timeline ?? []), [record.timeline]);
  const isClear = record.result_type === RECORD_RESULT_TYPES.CLEAR;

  return (
    <section className="cr2-record-detail">
      <div className="cr2-page-body">
        {page === 0 ? (
          isClear ? <RecordStatsPage record={record} /> : <RecordReviewPage review={review} />
        ) : null}
        {page === 1 ? <RecordStatsPage record={record} /> : null}
        {page === 2 ? <RecordArchivePage record={record} /> : null}
      </div>
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
    </section>
  );
}

function RecordReviewPage({ review }) {
  return (
    <article className="cr2-record-page">
      <h2>결정 복기</h2>
      <div className="cr2-review-highlight">
        <strong>가장 큰 적자</strong>
        <p>
          {review.worstProfit
            ? `Floor ${review.worstProfit.floor} - ${formatNumberWon(review.worstProfit.profit)}`
            : '기록 없음'}
        </p>
      </div>
      <div className="cr2-run-scroll">
        {review.recent.map((turn) => (
          <div className="cr2-review-row" key={`${turn.floor}-${turn.profit}`}>
            <strong>Floor {turn.floor}</strong>
            <span>{formatNumberWon(turn.profit)}</span>
            <small>{turn.eventTitle || '전략 정산 완료'}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecordStatsPage({ record }) {
  return (
    <article className="cr2-record-page">
      <h2>{record.result_type === RECORD_RESULT_TYPES.CLEAR ? '클리어 통계' : '최종 통계'}</h2>
      <div className="cr2-run-scroll">
        <dl className="cr2-record-table">
          {getRecordRows(record).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function RecordArchivePage({ record }) {
  return (
    <article className="cr2-record-page">
      <h2>기록 요약</h2>
      <div className="cr2-record-archive">
        <strong>{getRecordTitle(record)}</strong>
        <p>{record.advisor_name} · Floor {record.clear_floor}</p>
        <p>플레이타임 {formatTime(record.playtime)}</p>
        <p>저장일 {formatRecordDate(record.created_at)}</p>
      </div>
    </article>
  );
}

function getRecordTitle(record) {
  if (record.result_type === RECORD_RESULT_TYPES.CLEAR) {
    return `${record.clear_grade ?? 'C'}등급 클리어`;
  }

  return '파산';
}

function formatRecordDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
