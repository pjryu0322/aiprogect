import type { ConversionStage, MeetingData, ProcessingStatus, SampleScenario } from '../../data/types';

export type ProcessingFlowPhase = 'idle' | 'processing' | 'complete' | 'error';

export interface ProcessingFlowStageDefinition {
  id: ConversionStage;
  label: string;
}

export const PROCESSING_FLOW_STAGES: ProcessingFlowStageDefinition[] = [
  { id: 'uploading', label: '업로드' },
  { id: 'stt_processing', label: 'STT 변환' },
  { id: 'speaker_waiting', label: '화자 분리' },
  { id: 'draft_pending', label: '초안 생성' },
];

export const STAGE_PROCESSING_MESSAGES: Record<ConversionStage, string> = {
  uploading: '녹취 파일을 업로드하는 중입니다…',
  stt_processing: '음성을 텍스트로 변환하는 중입니다…',
  speaker_waiting: '화자를 분리하고 참여자를 매칭하는 중입니다…',
  draft_pending: '회의록 초안을 생성하는 중입니다…',
  complete: '모든 변환 단계가 완료되었습니다.',
};

export interface ProcessingFlowState {
  meetingData: MeetingData;
  retrying: boolean;
  phase: ProcessingFlowPhase;
}

export interface ProcessingFlowActions {
  setMeetingData: (data: MeetingData) => void;
  loadScenario: (scenario: SampleScenario) => void;
  markStageError: (message?: string) => void;
  markStageComplete: () => void;
  retryCurrentStage: () => void;
  reset: () => void;
}

export type ProcessingFlowContextValue = ProcessingFlowState & ProcessingFlowActions;

export function resolveStageIndex(stage: ConversionStage): number {
  return PROCESSING_FLOW_STAGES.findIndex((item) => item.id === stage);
}

export function resolveStageStatus(
  stage: ConversionStage,
  meetingData: MeetingData,
): ProcessingStatus {
  const timelineEntry = meetingData.draftTimeline.find((entry) => entry.stage === stage);
  if (timelineEntry) {
    return timelineEntry.status;
  }

  const currentIndex = resolveStageIndex(meetingData.workspaceStatus.currentStage);
  const stageIndex = resolveStageIndex(stage);

  if (stageIndex < currentIndex || meetingData.workspaceStatus.currentStage === 'complete') {
    return 'success';
  }

  if (stageIndex > currentIndex) {
    return 'idle';
  }

  return meetingData.workspaceStatus.stageStatus;
}

export function resolveProcessingPhase(meetingData: MeetingData): ProcessingFlowPhase {
  const { stageStatus, currentStage } = meetingData.workspaceStatus;

  if (stageStatus === 'error') {
    return 'error';
  }

  if (stageStatus === 'processing') {
    return 'processing';
  }

  if (currentStage === 'complete' && stageStatus === 'success') {
    return 'complete';
  }

  return 'idle';
}

export function isActiveProcessingStage(meetingData: MeetingData): boolean {
  return meetingData.workspaceStatus.stageStatus === 'processing';
}

export function hasActiveTimelineEntry(meetingData: MeetingData): boolean {
  return meetingData.draftTimeline.some((entry) => entry.status === 'processing');
}
