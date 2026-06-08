import { ResultPanelEmptyState } from '../../common/EmptyState';
import { ResultPanelErrorState } from '../../common/ErrorState';
import { LoadingState } from '../../common/LoadingState';
import type { MeetingSummary, ScriptSegment } from '../../../data/types';
import type { ResultScreenStatus, ResultTab } from '../../../screens/ResultScreen.types';
import { ScriptView } from './ScriptView';
import { SummaryCards } from './SummaryCards';

export interface ResultTabPanelProps {
  activeTab: ResultTab;
  status: ResultScreenStatus;
  summary: MeetingSummary | null;
  script: ScriptSegment[];
  loadingMessage: string;
  progressPercent?: number;
  error?: boolean;
  errorMessage?: string;
  errorDescription?: string;
  onRetry?: () => void;
}

export function ResultTabPanel({
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
}: ResultTabPanelProps) {
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
