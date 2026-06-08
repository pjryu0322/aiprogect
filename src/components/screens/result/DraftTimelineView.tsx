import type { DraftTimelineEntry, ProcessingStatus } from '../../../data/types';
import './resultScreen.css';

const STAGE_LABELS: Record<DraftTimelineEntry['stage'], string> = {
  uploading: '업로드',
  stt_processing: 'STT 변환',
  speaker_waiting: '화자 분리',
  draft_pending: '초안 생성',
  complete: '완료',
  summary: '요약 생성',
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimelineStatusDot({ status }: { status: ProcessingStatus }) {
  if (status === 'processing') {
    return <span className="result-screen-timeline__dot result-screen-timeline__dot--processing" />;
  }

  if (status === 'error') {
    return <span className="result-screen-timeline__dot result-screen-timeline__dot--error" />;
  }

  if (status === 'success') {
    return <span className="result-screen-timeline__dot result-screen-timeline__dot--success" />;
  }

  return <span className="result-screen-timeline__dot result-screen-timeline__dot--idle" />;
}

export function DraftTimelineView({ entries }: { entries: DraftTimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="result-screen-timeline__empty">아직 진행 이력이 없습니다.</p>;
  }

  return (
    <ol className="result-screen-timeline__list" aria-label="초안 생성 단계별 진행 이력">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`result-screen-timeline__entry${
            entry.status === 'processing' ? ' result-screen-timeline__entry--processing' : ''
          }`}
        >
          <div className="result-screen-timeline__indicator" aria-hidden="true">
            <TimelineStatusDot status={entry.status} />
          </div>
          <div className="result-screen-timeline__content">
            <div className="result-screen-timeline__heading">
              <span className="result-screen-timeline__stage">{STAGE_LABELS[entry.stage]}</span>
              <time className="result-screen-timeline__timestamp" dateTime={entry.timestamp}>
                {formatTimestamp(entry.timestamp)}
              </time>
            </div>
            <p className="result-screen-timeline__message">{entry.message}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
