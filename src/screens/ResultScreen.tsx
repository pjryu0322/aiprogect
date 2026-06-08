import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { ResultPanel } from '../components/screens/result';
import type {
  DraftTimelineEntry,
  MeetingSummary,
  ProcessingStatus,
  ScriptSegment,
} from '../data/types';
import {
  RESULT_SCREEN_STATUS_LABELS,
  resolveResultScreenStatus,
  type ResultScreenProps,
  type ResultScreenSlotProps,
  type ResultScreenStatus,
  type ResultTab,
} from './ResultScreen.types';
import './ResultScreen.css';

interface ResultScreenContextValue {
  status: ResultScreenStatus;
  summary: MeetingSummary | null;
  script: ScriptSegment[];
  draftTimeline: DraftTimelineEntry[];
  stageStatus: ProcessingStatus;
  loadingMessage: string;
  progressPercent?: number;
  error?: boolean;
  errorMessage?: string;
  errorDescription?: string;
  onRetry?: () => void;
  onTabChange?: (tab: ResultTab) => void;
}

const ResultScreenContext = createContext<ResultScreenContextValue | null>(null);

function useResultScreenContext(): ResultScreenContextValue {
  const context = useContext(ResultScreenContext);
  if (!context) {
    throw new Error('ResultScreen slot components must be used within ResultScreen.');
  }
  return context;
}

function ResultScreenProvider({
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
  children,
}: ResultScreenProps & { children: ReactNode }) {
  const status = useMemo(
    () => statusProp ?? resolveResultScreenStatus(stageStatus, summary, script),
    [statusProp, stageStatus, summary, script],
  );

  const value = useMemo<ResultScreenContextValue>(
    () => ({
      status,
      summary,
      script,
      draftTimeline,
      stageStatus,
      loadingMessage,
      progressPercent,
      error,
      errorMessage,
      errorDescription,
      onRetry,
      onTabChange,
    }),
    [
      status,
      summary,
      script,
      draftTimeline,
      stageStatus,
      loadingMessage,
      progressPercent,
      error,
      errorMessage,
      errorDescription,
      onRetry,
      onTabChange,
    ],
  );

  return <ResultScreenContext.Provider value={value}>{children}</ResultScreenContext.Provider>;
}

function ResultScreenStatusBridge({
  onStatusChange,
  children,
}: {
  onStatusChange?: ResultScreenProps['onStatusChange'];
  children: ReactNode;
}) {
  const { status } = useResultScreenContext();

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  return <>{children}</>;
}

function ResultScreenDefaultLayout({ defaultTab = 'summary' }: { defaultTab?: ResultTab }) {
  const context = useResultScreenContext();

  return (
    <div className="result-screen-layout result-screen-layout--preview">
      <header className="result-screen-layout__header">
        <h1 className="result-screen-layout__title">결과 확인</h1>
        <span
          className={`result-screen-status result-screen-status--${context.status}`}
          aria-live="polite"
        >
          {RESULT_SCREEN_STATUS_LABELS[context.status]}
        </span>
      </header>

      <div className="result-screen-layout__panel">
        <ResultPanel {...context} defaultTab={defaultTab} />
      </div>
    </div>
  );
}

export function ResultScreenPanel(props: ResultScreenSlotProps) {
  const context = useResultScreenContext();
  return <ResultPanel {...props} {...context} />;
}

export function ResultScreen({
  className = '',
  defaultTab = 'summary',
  children,
  ...props
}: ResultScreenProps & { children?: ReactNode }) {
  return (
    <ResultScreenProvider {...props}>
      <div className={`result-screen${className ? ` ${className}` : ''}`}>
        <ResultScreenStatusBridge onStatusChange={props.onStatusChange}>
          {children ?? <ResultScreenDefaultLayout defaultTab={defaultTab} />}
        </ResultScreenStatusBridge>
      </div>
    </ResultScreenProvider>
  );
}

export type {
  ResultScreenProps,
  ResultScreenSlotProps,
  ResultScreenStatus,
  ResultTab,
} from './ResultScreen.types';
export {
  resolveResultScreenFromMeeting,
  resolveResultScreenStatus,
  RESULT_SCREEN_STATUS_LABELS,
  RESULT_TABS,
} from './ResultScreen.types';
