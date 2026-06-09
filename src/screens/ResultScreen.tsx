import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { MeetingData } from '../data/types';
import { ResultPanel } from '../components/screens/result';
import type {
  DraftTimelineEntry,
  MeetingSummary,
  ProcessingStatus,
  ScriptSegment,
} from '../data/types';
import {
  RESULT_SCREEN_STATUS_LABELS,
  resolveResultScreenFromMeeting,
  resolveResultScreenProps,
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
  scenario,
  meetingData,
  summary: summaryProp,
  script: scriptProp,
  draftTimeline: draftTimelineProp,
  stageStatus: stageStatusProp,
  loadingMessage: loadingMessageProp,
  progressPercent: progressPercentProp,
  error,
  errorMessage,
  errorDescription,
  onRetry,
  onTabChange,
  children,
}: ResultScreenProps & { children: ReactNode }) {
  const resolved = useMemo(
    () =>
      resolveResultScreenProps({
        scenario,
        meetingData,
        status: statusProp,
        summary: summaryProp,
        script: scriptProp,
        draftTimeline: draftTimelineProp,
        stageStatus: stageStatusProp,
        loadingMessage: loadingMessageProp,
        progressPercent: progressPercentProp,
      }),
    [
      scenario,
      meetingData,
      statusProp,
      summaryProp,
      scriptProp,
      draftTimelineProp,
      stageStatusProp,
      loadingMessageProp,
      progressPercentProp,
    ],
  );

  const status = useMemo(
    () => resolved.status ?? resolveResultScreenStatus(resolved.stageStatus, resolved.summary, resolved.script),
    [resolved.status, resolved.stageStatus, resolved.summary, resolved.script],
  );

  const value = useMemo<ResultScreenContextValue>(
    () => ({
      status,
      summary: resolved.summary,
      script: resolved.script,
      draftTimeline: resolved.draftTimeline,
      stageStatus: resolved.stageStatus,
      loadingMessage: resolved.loadingMessage,
      progressPercent: resolved.progressPercent,
      error,
      errorMessage,
      errorDescription,
      onRetry,
      onTabChange,
    }),
    [
      status,
      resolved.summary,
      resolved.script,
      resolved.draftTimeline,
      resolved.stageStatus,
      resolved.loadingMessage,
      resolved.progressPercent,
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

export interface ResultScreenFromMeetingProps {
  meetingData: MeetingData;
  onRetry?: () => void;
  onTabChange?: ResultScreenProps['onTabChange'];
  onStatusChange?: ResultScreenProps['onStatusChange'];
  defaultTab?: ResultTab;
  className?: string;
}

export function ResultScreenFromMeeting({
  meetingData,
  onRetry,
  onTabChange,
  onStatusChange,
  defaultTab,
  className,
}: ResultScreenFromMeetingProps) {
  return (
    <ResultScreen
      meetingData={meetingData}
      onRetry={onRetry}
      onTabChange={onTabChange}
      onStatusChange={onStatusChange}
      defaultTab={defaultTab}
      className={className}
    />
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
  resolveResultScreenProps,
  resolveResultScreenStatus,
  RESULT_SCREEN_STATUS_LABELS,
  RESULT_TABS,
} from './ResultScreen.types';
