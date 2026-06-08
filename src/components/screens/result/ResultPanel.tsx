import { useMemo, useState } from 'react';
import { DraftTimelineLoading } from '../../common/LoadingState';
import type { DraftTimelineEntry, MeetingSummary, ProcessingStatus, ScriptSegment } from '../../../data/types';
import {
  resolveResultScreenStatus,
  type ResultScreenSlotProps,
  type ResultScreenStatus,
  type ResultTab,
} from '../../../screens/ResultScreen.types';
import { DraftTimelineView } from './DraftTimelineView';
import { ResultTabPanel } from './ResultTabPanel';
import { ResultTabs } from './ResultTabs';
import './resultScreen.css';

export interface ResultPanelProps extends ResultScreenSlotProps {
  status?: ResultScreenStatus;
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
}

export function ResultPanel({
  className = '',
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
}: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>(defaultTab);

  const status = useMemo(
    () => statusProp ?? resolveResultScreenStatus(stageStatus, summary, script),
    [statusProp, stageStatus, summary, script],
  );

  const isTimelineLoading =
    status === 'loading' && draftTimeline.some((entry) => entry.status === 'processing');
  const showReviewHint = status === 'success' && (summary !== null || script.length > 0);

  const handleTabChange = (tab: ResultTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div
      className={`result-screen-panel panel-content panel-content--right${className ? ` ${className}` : ''}`}
      data-result-status={status}
    >
      <section className="panel-section panel-section--flex" aria-labelledby="results-heading">
        <h2 id="results-heading" className="panel-section-title">
          결과 패널
        </h2>

        <ResultTabs activeTab={activeTab} onTabChange={handleTabChange} />

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
          <p className="result-screen-panel__hint" role="note">
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
