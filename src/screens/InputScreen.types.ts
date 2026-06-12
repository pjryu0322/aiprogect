import type {
  MeetingInputFlowStatus,
  MeetingInputPayload,
} from '../features/input/MeetingInputFlow.types';

export type InputScreenStatus = 'idle' | 'uploading' | 'ready';

export interface InputScreenProps {
  className?: string;
  onStatusChange?: (status: InputScreenStatus) => void;
  onReady?: (payload: MeetingInputPayload) => void;
}

export interface InputScreenSlotProps {
  className?: string;
}

export function mapFlowStatusToInputScreenStatus(
  flowStatus: MeetingInputFlowStatus,
  isReadingMetadata: boolean,
): InputScreenStatus {
  if (isReadingMetadata) {
    return 'uploading';
  }

  if (flowStatus === 'ready') {
    return 'ready';
  }

  return 'idle';
}

export const INPUT_SCREEN_STATUS_LABELS: Record<InputScreenStatus, string> = {
  idle: '대기',
  uploading: '파일 확인 중',
  ready: '분석 준비 완료',
};
