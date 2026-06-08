import type {
  ConversionStage,
  MeetingData,
  MeetingFile,
  ProcessingStatus,
  SampleScenario,
} from '../../../data/types';

export type AdminScreenStatus = 'idle' | 'loading';

export type AdminActionType = 'reprocess' | 'confirm' | 'changeStatus';

export interface AdminMeetingRecord {
  id: string;
  title: string;
  scenario: SampleScenario;
  files: MeetingFile[];
  currentStage: ConversionStage;
  stageStatus: ProcessingStatus;
  progressPercent: number;
  message: string;
  hasSummary: boolean;
  hasScript: boolean;
  lastUpdated: string;
}

export interface AdminStatusSummary {
  total: number;
  processing: number;
  complete: number;
  idleOrError: number;
}

export interface AdminScreenActions {
  onReprocess?: (recordId: string) => void;
  onConfirm?: (recordId: string) => void;
  onStatusChange?: (recordId: string, status: ProcessingStatus) => void;
  onRefresh?: () => void;
  onSelectRecord?: (recordId: string | null) => void;
}

export const STAGE_LABELS: Record<ConversionStage, string> = {
  uploading: '업로드',
  stt_processing: 'STT 변환',
  speaker_waiting: '화자 분리',
  draft_pending: '초안 생성',
  complete: '완료',
};

export const STATUS_LABELS: Record<ProcessingStatus, string> = {
  idle: '대기',
  processing: '처리 중',
  success: '완료',
  error: '오류',
};

export function resolveLastUpdated(data: MeetingData): string {
  const timeline = data.draftTimeline;
  if (timeline.length === 0) {
    return data.files[0]?.uploadedAt ?? new Date().toISOString();
  }

  return timeline[timeline.length - 1]?.timestamp ?? new Date().toISOString();
}

export function toAdminMeetingRecord(
  data: MeetingData,
  scenario: SampleScenario,
): AdminMeetingRecord {
  const { workspaceStatus } = data;

  return {
    id: data.id,
    title: data.title,
    scenario,
    files: data.files,
    currentStage: workspaceStatus.currentStage,
    stageStatus: workspaceStatus.stageStatus,
    progressPercent: workspaceStatus.progressPercent,
    message: workspaceStatus.message,
    hasSummary: data.summary !== null,
    hasScript: data.script.length > 0,
    lastUpdated: resolveLastUpdated(data),
  };
}

export function summarizeAdminRecords(records: AdminMeetingRecord[]): AdminStatusSummary {
  return records.reduce<AdminStatusSummary>(
    (summary, record) => {
      summary.total += 1;

      if (record.stageStatus === 'processing') {
        summary.processing += 1;
      } else if (
        record.currentStage === 'complete' &&
        record.stageStatus === 'success'
      ) {
        summary.complete += 1;
      } else {
        summary.idleOrError += 1;
      }

      return summary;
    },
    { total: 0, processing: 0, complete: 0, idleOrError: 0 },
  );
}
