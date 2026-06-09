import { useMemo, useState } from 'react';
import type {
  ActionItem,
  DraftTimelineEntry,
  MeetingData,
  MeetingSummary,
  ProcessingStatus,
  ScriptSegment,
} from '../../data/types';
import { ResultPanelEmptyState } from '../../components/common/EmptyState';
import { ResultPanelErrorState } from '../../components/common/ErrorState';
import { LoadingState, DraftTimelineLoading } from '../../components/common/LoadingState';
import './ResultReviewFlow.css';

export type ResultTab = 'summary' | 'script';

export type ResultReviewStatus = 'empty' | 'loading' | 'success' | 'error';

const TABS: { id: ResultTab; label: string }[] = [
  { id: 'summary', label: '요약본' },
  { id: 'script', label: '스크립트' },
];

const STAGE_LABELS: Record<DraftTimelineEntry['stage'], string> = {
  uploading: '업로드',
  stt_processing: 'STT 변환',
  speaker_waiting: '화자 분리',
  draft_pending: '초안 생성',
  summary: '요약 생성',
};

export interface ResultReviewFlowProps {
  status?: ResultReviewStatus;
  summary?: MeetingSummary | null;
  script?: ScriptSegment[];
  draftTimeline?: DraftTimelineEntry[];
  stageStatus?: ProcessingStatus;
  loadingMessage?: string;
  progressPercent?: number;
  error?: boolean;
  errorMessage?: string;
  errorDescription?: string;
  onRetry?: () => void;
  onTabChange?: (tab: ResultTab) => void;
  defaultTab?: ResultTab;
  className?: string;
}

export function resolveResultReviewStatus(
  stageStatus: ProcessingStatus,
  summary: MeetingSummary | null | undefined,
  script: ScriptSegment[] | undefined,
): ResultReviewStatus {
  if (stageStatus === 'error') {
    return 'error';
  }

  if (stageStatus === 'processing') {
    return 'loading';
  }

  const hasSummary = summary !== null && summary !== undefined;
  const hasScript = (script?.length ?? 0) > 0;

  if (!hasSummary && !hasScript) {
    return 'empty';
  }

  return 'success';
}

export function resolveResultReviewFromMeeting(data: MeetingData): {
  status: ResultReviewStatus;
  summary: MeetingSummary | null;
  script: ScriptSegment[];
  draftTimeline: DraftTimelineEntry[];
  loadingMessage: string;
  progressPercent: number;
} {
  const { workspaceStatus, summary, script, draftTimeline } = data;

  return {
    status: resolveResultReviewStatus(workspaceStatus.stageStatus, summary, script),
    summary,
    script,
    draftTimeline,
    loadingMessage: workspaceStatus.message,
    progressPercent: workspaceStatus.progressPercent,
  };
}

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

function formatSegmentTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function SummaryCards({ summary }: { summary: MeetingSummary }) {
  return (
    <div className="result-review-summary">
      <p className="result-review-summary__overview">{summary.overview}</p>

      <div className="result-review-cards">
        <ResultCard title="핵심 안건" items={summary.keyPoints} emptyText="핵심 안건이 없습니다." />
        <ResultCard title="결정사항" items={summary.decisions} emptyText="결정사항이 없습니다." />
        <ActionItemsCard actionItems={summary.actionItems} />
      </div>
    </div>
  );
}

function ResultCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <article className="result-review-card" aria-labelledby={`card-${title}`}>
      <h3 id={`card-${title}`} className="result-review-card__title">
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="result-review-card__list">
          {items.map((item) => (
            <li key={item} className="result-review-card__item">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="result-review-card__empty">{emptyText}</p>
      )}
    </article>
  );
}

function ActionItemsCard({ actionItems }: { actionItems: ActionItem[] }) {
  return (
    <article className="result-review-card" aria-labelledby="card-action-items">
      <h3 id="card-action-items" className="result-review-card__title">
        할 일
      </h3>
      {actionItems.length > 0 ? (
        <ul className="result-review-card__list result-review-card__list--actions">
          {actionItems.map((item) => (
            <li key={item.id} className="result-review-card__action-item">
              <span className="result-review-card__action-task">{item.task}</span>
              <span className="result-review-card__action-meta">
                담당: {item.assignee}
                {item.dueDate ? ` · 마감: ${item.dueDate}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="result-review-card__empty">할 일이 없습니다.</p>
      )}
    </article>
  );
}

function ScriptView({ script }: { script: ScriptSegment[] }) {
  return (
    <div className="result-review-script" role="list" aria-label="화자별 스크립트">
      {script.map((segment) => (
        <article
          key={segment.id}
          className="result-review-script__segment"
          role="listitem"
          aria-label={`${segment.speakerName} 발화`}
        >
          <header className="result-review-script__header">
            <span className="result-review-script__speaker">{segment.speakerName}</span>
            <time className="result-review-script__time" dateTime={`PT${segment.startSeconds}S`}>
              {formatSegmentTime(segment.startSeconds)}
            </time>
          </header>
          <p className="result-review-script__text">{segment.text}</p>
        </article>
      ))}
    </div>
  );
}

function TimelineStatusDot({ status }: { status: ProcessingStatus }) {
  if (status === 'processing') {
    return <span className="result-review-timeline__dot result-review-timeline__dot--processing" />;
  }

  if (status === 'error') {
    return <span className="result-review-timeline__dot result-review-timeline__dot--error" />;
  }

  if (status === 'success') {
    return <span className="result-review-timeline__dot result-review-timeline__dot--success" />;
  }

  return <span className="result-review-timeline__dot result-review-timeline__dot--idle" />;
}

function DraftTimelineView({ entries }: { entries: DraftTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="result-review-timeline__empty">아직 진행 이력이 없습니다.</p>
    );
  }

  return (
    <ol className="result-review-timeline__list" aria-label="초안 생성 단계별 진행 이력">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`result-review-timeline__entry${
            entry.status === 'processing' ? ' result-review-timeline__entry--processing' : ''
          }`}
        >
          <div className="result-review-timeline__indicator" aria-hidden="true">
            <TimelineStatusDot status={entry.status} />
          </div>
          <div className="result-review-timeline__content">
            <div className="result-review-timeline__heading">
              <span className="result-review-timeline__stage">{STAGE_LABELS[entry.stage]}</span>
              <time className="result-review-timeline__timestamp" dateTime={entry.timestamp}>
                {formatTimestamp(entry.timestamp)}
              </time>
            </div>
            <p className="result-review-timeline__message">{entry.message}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ResultTabPanel({
  activeTab,
  status,
  summary,
  script,
  loadingMessage,
  progressPercent,
  error,
  errorMessage,
  errorDescription,
  onRetry,
}: {
  activeTab: ResultTab;
  status: ResultReviewStatus;
  summary: MeetingSummary | null;
  script: ScriptSegment[];
  loadingMessage: string;
  progressPercent?: number;
  error?: boolean;
  errorMessage?: string;
  errorDescription?: string;
  onRetry?: () => void;
}) {
  if (status === 'error' || error) {
    return (
      <ResultPanelErrorState
        error
        message={errorMessage}
        description={errorDescription}
        onRetry={onRetry}
      />
    );
  }

  if (status === 'empty') {
    return <ResultPanelEmptyState isEmpty />;
  }

  if (activeTab === 'summary') {
    if (status === 'loading' && !summary) {
      return (
        <LoadingState
          loading
          message={loadingMessage}
          progressPercent={progressPercent}
          variant="block"
        />
      );
    }

    if (!summary) {
      return (
        <ResultPanelEmptyState
          isEmpty
          title="요약본이 아직 없습니다"
          description="초안 생성이 완료되면 요약본이 이 영역에 표시됩니다."
        />
      );
    }

    return <SummaryCards summary={summary} />;
  }

  if (script.length === 0) {
    if (status === 'loading') {
      return (
        <LoadingState
          loading
          message={loadingMessage}
          progressPercent={progressPercent}
          variant="block"
        />
      );
    }

    return (
      <ResultPanelEmptyState
        isEmpty
        title="스크립트가 아직 없습니다"
        description="STT 변환이 완료되면 화자별 스크립트가 이 영역에 표시됩니다."
      />
    );
  }

  return <ScriptView script={script} />;
}

export function ResultReviewFlow({
  status: statusProp,
  summary = null,
  script = [],
  draftTimeline = [],
  stageStatus = 'idle',
  loadingMessage = '결과를 불러오는 중입니다…',
  progressPercent,
  error,
  errorMessage,
  errorDescription,
  onRetry,
  onTabChange,
  defaultTab = 'summary',
  className = '',
}: ResultReviewFlowProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>(defaultTab);

  const status = useMemo(
    () => statusProp ?? resolveResultReviewStatus(stageStatus, summary, script),
    [statusProp, stageStatus, summary, script],
  );

  const isTimelineLoading = status === 'loading' && draftTimeline.some((entry) => entry.status === 'processing');

  const handleTabChange = (tab: ResultTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const showReviewHint = status === 'success' && (summary !== null || script.length > 0);

  return (
    <div className={`result-review-flow panel-content panel-content--right${className ? ` ${className}` : ''}`}>
      <section className="panel-section panel-section--flex" aria-labelledby="results-heading">
        <h2 id="results-heading" className="panel-section-title">
          결과 패널
        </h2>

        <div className="result-tabs" role="tablist" aria-label="결과 보기">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`result-tab${activeTab === tab.id ? ' result-tab--active' : ''}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`result-tabpanel-${tab.id}`}
              id={`result-tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`result-tabpanel-${activeTab}`}
          className="result-tab-panel"
          role="tabpanel"
          aria-labelledby={`result-tab-${activeTab}`}
        >
          <ResultTabPanel
            activeTab={activeTab}
            status={status}
            summary={summary}
            script={script}
            loadingMessage={loadingMessage}
            progressPercent={progressPercent}
            error={error}
            errorMessage={errorMessage}
            errorDescription={errorDescription}
            onRetry={onRetry}
          />
        </div>

        {showReviewHint ? (
          <p className="result-review-flow__hint" role="note">
            요약본과 스크립트를 검토한 뒤 초안 확정 또는 재생성 여부를 판단할 수 있습니다.
          </p>
        ) : null}
      </section>

      <section className="draft-timeline" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="panel-section-title">
          초안 생성 타임라인
        </h2>
        <div className="timeline-body">
          <DraftTimelineLoading loading={isTimelineLoading} entries={draftTimeline}>
            <DraftTimelineView entries={draftTimeline} />
          </DraftTimelineLoading>
        </div>
      </section>
    </div>
  );
}
