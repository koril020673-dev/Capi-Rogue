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
const EMPTY_SLOT_COUNT = 10;

const TEXT = Object.freeze({
  title: '\uD50C\uB808\uC774 \uAE30\uB85D',
  back: '\uB4A4\uB85C\uAC00\uAE30',
  loading: '\uAE30\uB85D \uBD88\uB7EC\uC624\uB294 \uC911...',
  empty: '\uAE30\uB85D \uC5C6\uC74C',
  capital: '\uC790\uBCF8',
  floor: 'Floor',
  previous: '\uC774\uC804',
  next: '\uB2E4\uC74C',
  reviewTitle: '\uACB0\uC815 \uBCF5\uAE30',
  worstLoss: '\uAC00\uC7A5 \uD070 \uC801\uC790',
  noRecord: '\uAE30\uB85D \uC5C6\uC74C',
  settlementDone: '\uC804\uB7B5 \uC815\uC0B0 \uC644\uB8CC',
  clearStats: '\uD074\uB9AC\uC5B4 \uD1B5\uACC4',
  finalStats: '\uCD5C\uC885 \uD1B5\uACC4',
  archiveTitle: '\uAE30\uB85D \uC694\uC57D',
  playtime: '\uD50C\uB808\uC774\uD0C0\uC784',
  savedAt: '\uC800\uC7A5\uC77C',
  clear: '\uB4F1\uAE09 \uD074\uB9AC\uC5B4',
  bankrupt: '\uD30C\uC0B0',
});

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
          {TEXT.back}
        </button>
        <RecordDetail record={selectedRecord} page={page} setPage={setPage} />
      </div>
    );
  }

  const emptySlots = Math.max(0, EMPTY_SLOT_COUNT - records.length);

  return (
    <div className="cr2-play-record">
      <header className="cr2-play-record-head">
        <h2>{TEXT.title}</h2>
        {onBack ? (
          <button className="cr2-record-back-button" type="button" onClick={onBack}>
            {TEXT.back}
          </button>
        ) : null}
      </header>
      {loading ? <div className="cr2-record-empty-slot">{TEXT.loading}</div> : null}
      {!loading ? (
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
              <span>{record.advisor_name} | {TEXT.floor} {record.clear_floor}</span>
              <span>{TEXT.capital} {formatNumberWon(record.final_capital)}</span>
              <small>{formatRecordDate(record.created_at)} | {formatTime(record.playtime)}</small>
            </button>
          ))}
          {Array.from({ length: emptySlots }, (_, index) => (
            <div className="cr2-record-empty-slot" key={`empty-${index}`}>
              {TEXT.empty}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RecordDetail({ record, page, setPage }) {
  const review = useMemo(() => getCriticalReview(record.timeline ?? []), [record.timeline]);
  const isClear = record.result_type === RECORD_RESULT_TYPES.CLEAR;

  return (
    <section className="cr2-record-detail">
      <div className="cr2-page-body cr2-scrollable">
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
          {TEXT.previous}
        </button>
        <span>{Array.from({ length: PAGE_COUNT }, (_, index) => (index === page ? '\u25CF' : '\u25CB')).join(' ')}</span>
        <button
          className="cr2-secondary-button"
          disabled={page === PAGE_COUNT - 1}
          type="button"
          onClick={() => setPage((current) => Math.min(PAGE_COUNT - 1, current + 1))}
        >
          {TEXT.next}
        </button>
      </footer>
    </section>
  );
}

function RecordReviewPage({ review }) {
  return (
    <article className="cr2-record-page">
      <h2>{TEXT.reviewTitle}</h2>
      <div className="cr2-review-highlight">
        <strong>{TEXT.worstLoss}</strong>
        <p>
          {review.worstProfit
            ? `${TEXT.floor} ${review.worstProfit.floor} - ${formatNumberWon(review.worstProfit.profit)}`
            : TEXT.noRecord}
        </p>
      </div>
      <div className="cr2-run-scroll cr2-scrollable">
        {review.recent.map((turn) => (
          <div className="cr2-review-row" key={`${turn.floor}-${turn.profit}`}>
            <strong>{TEXT.floor} {turn.floor}</strong>
            <span>{formatNumberWon(turn.profit)}</span>
            <small>{turn.eventTitle || TEXT.settlementDone}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecordStatsPage({ record }) {
  return (
    <article className="cr2-record-page">
      <h2>{record.result_type === RECORD_RESULT_TYPES.CLEAR ? TEXT.clearStats : TEXT.finalStats}</h2>
      <div className="cr2-run-scroll cr2-scrollable">
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
      <h2>{TEXT.archiveTitle}</h2>
      <div className="cr2-record-archive">
        <strong>{getRecordTitle(record)}</strong>
        <p>{record.advisor_name} | {TEXT.floor} {record.clear_floor}</p>
        <p>{TEXT.playtime} {formatTime(record.playtime)}</p>
        <p>{TEXT.savedAt} {formatRecordDate(record.created_at)}</p>
      </div>
    </article>
  );
}

function getRecordTitle(record) {
  if (record.result_type === RECORD_RESULT_TYPES.CLEAR) {
    return `${record.clear_grade ?? 'C'}${TEXT.clear}`;
  }

  return TEXT.bankrupt;
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
