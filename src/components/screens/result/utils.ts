import type { DraftTimelineEntry } from '../../../data/types';

export const STAGE_LABELS: Record<DraftTimelineEntry['stage'], string> = {
  uploading: '업로드',
  stt_processing: 'STT 변환',
  speaker_waiting: '화자 분리',
  draft_pending: '초안 생성',
  summary: '요약 생성',
};

export function formatTimestamp(value: string): string {
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

export function formatSegmentTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
