import type {
  DraftTimelineEntry,
  MeetingData,
  MeetingSummary,
  ProcessingStatus,
  ScriptSegment,
} from '../data/types';

export type ResultTab = 'summary' | 'script';

export type ResultScreenStatus = 'empty' | 'loading' | 'success' | 'error';

export interface ResultScreenProps {
  className?: string;
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
  onStatusChange?: (status: ResultScreenStatus) => void;
  defaultTab?: ResultTab;
}

export interface ResultScreenSlotProps {
  className?: string;
}

export const RESULT_TABS: { id: ResultTab; label: string }[] = [
  { id: 'summary', label: '요약본' },
  { id: 'script', label: '스크립트' },
];

export const RESULT_SCREEN_STATUS_LABELS: Record<ResultScreenStatus, string> = {
  empty: '결과 없음',
  loading: '생성 중',
  success: '확인 가능',
  error: '오류',
};

export function resolveResultScreenStatus(
  stageStatus: ProcessingStatus,
  summary: MeetingSummary | null | undefined,
  script: ScriptSegment[] | undefined,
): ResultScreenStatus {
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

export function resolveResultScreenFromMeeting(data: MeetingData): {
  status: ResultScreenStatus;
  summary: MeetingSummary | null;
  script: ScriptSegment[];
  draftTimeline: DraftTimelineEntry[];
  loadingMessage: string;
  progressPercent: number;
} {
  const { workspaceStatus, summary, script, draftTimeline } = data;

  return {
    status: resolveResultScreenStatus(workspaceStatus.stageStatus, summary, script),
    summary,
    script,
    draftTimeline,
    loadingMessage: workspaceStatus.message,
    progressPercent: workspaceStatus.progressPercent,
  };
}
