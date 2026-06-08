import type { ConversionStage } from '../../data/types';

export type StartFlowStatus = 'idle' | 'ready' | 'uploading';

export interface StartFlowFile {
  id: string;
  name: string;
  sizeBytes: number;
  format: string;
  file: File;
}

export interface StartFlowState {
  status: StartFlowStatus;
  selectedFile: StartFlowFile | null;
  validationError: string | null;
  currentStage: ConversionStage;
  progressPercent: number;
  statusMessage: string;
}

export interface StartFlowActions {
  selectFile: (file: File) => void;
  clearFile: () => void;
  startAnalysis: () => void;
  reset: () => void;
}

export type StartFlowContextValue = StartFlowState & StartFlowActions;

export const START_FLOW_STAGES: { id: ConversionStage; label: string }[] = [
  { id: 'uploading', label: '업로드' },
  { id: 'stt_processing', label: 'STT 변환' },
  { id: 'speaker_waiting', label: '화자 분리' },
  { id: 'draft_pending', label: '초안 생성' },
];

export const ACCEPTED_AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.ogg', '.webm', '.aac', '.flac'];
