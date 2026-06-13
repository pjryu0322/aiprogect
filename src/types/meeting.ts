export type MeetingFileStatus =
  | "pending"
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "error";

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "stt_processing"
  | "speaker_waiting"
  | "draft_pending"
  | "success"
  | "error";

export type DraftTimelineStatus = "pending" | "active" | "done";

export type ActionItemStatus = "pending" | "in_progress" | "done";

export interface MeetingFile {
  id: string;
  name: string;
  sizeLabel: string;
  durationLabel: string;
  uploadedAt: string;
  status: MeetingFileStatus;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  speakerLabel: string;
  avatarInitial: string;
}

export interface TranscriptSegment {
  id: string;
  participantId: string;
  speakerLabel: string;
  startTime: string;
  endTime: string;
  text: string;
}

export interface MeetingSummary {
  meetingTitle: string;
  date: string;
  duration: string;
  participantCount: number;
  overview: string;
  highlights: string[];
}

export interface MeetingDecision {
  id: string;
  summary: string;
  rationale?: string;
  relatedSegmentIds?: string[];
}

export interface MeetingActionItem {
  id: string;
  task: string;
  assigneeId: string;
  dueDate: string;
  status: ActionItemStatus;
}

export interface DraftTimelineEvent {
  id: string;
  label: string;
  time: string;
  status: DraftTimelineStatus;
}
