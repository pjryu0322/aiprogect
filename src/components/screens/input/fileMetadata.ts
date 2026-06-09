import type { InputScreenStatus } from '../../../screens/InputScreen.types';
import { INPUT_SCREEN_STATUS_LABELS } from '../../../screens/InputScreen.types';

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) {
    return '길이 확인 중';
  }

  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getConversionStatusLabel(status: InputScreenStatus): string {
  return INPUT_SCREEN_STATUS_LABELS[status];
}

export function getConversionStatusClassName(status: InputScreenStatus): string {
  return `input-screen-status input-screen-status--${status}`;
}
