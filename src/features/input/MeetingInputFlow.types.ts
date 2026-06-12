import type { MeetingFile, Participant } from '../../data/types';

export type MeetingInputFlowStatus = 'idle' | 'validating' | 'ready';

export interface MeetingInputFile {
  id: string;
  name: string;
  sizeBytes: number;
  format: string;
  file: File;
}

export interface MeetingInputParticipant {
  id: string;
  name: string;
  role: string;
}

export interface AnalysisOptions {
  enableSpeakerSeparation: boolean;
  generateSummary: boolean;
  generateScript: boolean;
  language: 'ko' | 'en' | 'auto';
}

export interface WorkspaceTask {
  id: string;
  text: string;
  createdAt: string;
}

export interface MeetingInputFieldErrors {
  files?: string;
  participants?: string;
  tasks?: string;
  general?: string;
}

export interface MeetingInputPayload {
  files: MeetingFile[];
  participants: Participant[];
  analysisOptions: AnalysisOptions;
  workspaceTasks: WorkspaceTask[];
}

export interface MeetingInputFlowState {
  status: MeetingInputFlowStatus;
  files: MeetingInputFile[];
  participants: MeetingInputParticipant[];
  analysisOptions: AnalysisOptions;
  workspaceTasks: WorkspaceTask[];
  fieldErrors: MeetingInputFieldErrors;
  statusMessage: string;
}

export interface MeetingInputFlowActions {
  addFile: (file: File) => void;
  removeFile: (fileId: string) => void;
  addParticipant: (participant?: Partial<MeetingInputParticipant>) => void;
  updateParticipant: (
    participantId: string,
    updates: Partial<Pick<MeetingInputParticipant, 'name' | 'role'>>,
  ) => void;
  removeParticipant: (participantId: string) => void;
  updateAnalysisOptions: (updates: Partial<AnalysisOptions>) => void;
  addWorkspaceTask: (text: string) => boolean;
  removeWorkspaceTask: (taskId: string) => void;
  validate: () => boolean;
  buildPayload: () => MeetingInputPayload | null;
  reset: () => void;
}

export type MeetingInputFlowContextValue = MeetingInputFlowState & MeetingInputFlowActions;

export const ACCEPTED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.m4a',
  '.wav',
  '.ogg',
  '.webm',
  '.aac',
  '.flac',
];

export const DEFAULT_ANALYSIS_OPTIONS: AnalysisOptions = {
  enableSpeakerSeparation: true,
  generateSummary: true,
  generateScript: true,
  language: 'ko',
};

export const ANALYSIS_LANGUAGE_OPTIONS: { value: AnalysisOptions['language']; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'auto', label: '자동 감지' },
];
