export type ConversionStage =
  | 'uploading'
  | 'stt_processing'
  | 'speaker_waiting'
  | 'draft_pending'
  | 'complete';

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export type SampleScenario =
  | 'idle'
  | 'uploading'
  | 'stt_processing'
  | 'speaker_waiting'
  | 'draft_pending'
  | 'success';

export interface MeetingFile {
  id: string;
  name: string;
  sizeBytes: number;
  durationSeconds: number;
  format: string;
  uploadedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  speakerLabel?: string;
}

export interface ScriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface ActionItem {
  id: string;
  assignee: string;
  task: string;
  dueDate?: string;
}

export interface MeetingSummary {
  title: string;
  overview: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
}

export interface DraftTimelineEntry {
  id: string;
  stage: ConversionStage | 'summary';
  status: ProcessingStatus;
  timestamp: string;
  message: string;
}

export interface WorkspaceStatus {
  currentStage: ConversionStage;
  stageStatus: ProcessingStatus;
  progressPercent: number;
  message: string;
}

export interface MeetingData {
  id: string;
  title: string;
  files: MeetingFile[];
  participants: Participant[];
  script: ScriptSegment[];
  summary: MeetingSummary | null;
  workspaceStatus: WorkspaceStatus;
  draftTimeline: DraftTimelineEntry[];
}

export type DataSource = 'sample' | 'mock' | 'api';

export interface MeetingDataProviderOptions {
  source?: DataSource;
  apiBaseUrl?: string;
}
