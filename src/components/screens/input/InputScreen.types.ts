export type InputScreenStatus = "idle" | "uploading" | "ready";

export type InputScreenFileStatus =
  | "waiting"
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "error";

export type InputScreenParticipantStatus = "draft" | "ready";

export interface InputScreenMeetingFile {
  id: string;
  name: string;
  sizeLabel: string;
  durationLabel?: string;
  status: InputScreenFileStatus;
  uploadedAt?: string;
}

export interface InputScreenParticipant {
  id: string;
  name: string;
  role: string;
  status: InputScreenParticipantStatus;
  avatarInitial?: string;
}

export interface InputScreenWorkItem {
  id: string;
  text: string;
}

export interface InputScreenAnalysisOptions {
  enableSpeakerSeparation: boolean;
  generateSummary: boolean;
  generateDraft: boolean;
}

export type InputScreenBlocker =
  | "no_file"
  | "no_participants"
  | "invalid_participant"
  | "no_work_items"
  | "insufficient_work_input";

export interface InputScreenViewModel {
  status: InputScreenStatus;
  screenStatus: InputScreenStatus;
  meetingFile: InputScreenMeetingFile | null;
  participants: InputScreenParticipant[];
  workItems: InputScreenWorkItem[];
  workspaceInput: string;
  analysisOptions: InputScreenAnalysisOptions;
  canProceedToAnalysis: boolean;
  primaryBlocker: InputScreenBlocker | null;
  primaryBlockerMessage: string | null;
  uploadProgress?: number;
}

export interface MeetingFileBlockProps {
  status: InputScreenStatus;
  meetingFile: InputScreenMeetingFile | null;
  uploadProgress?: number;
  primaryBlocker: InputScreenBlocker | null;
  primaryBlockerMessage?: string | null;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export interface ParticipantListBlockProps {
  status: InputScreenStatus;
  participants: InputScreenParticipant[];
  primaryBlocker: InputScreenBlocker | null;
  primaryBlockerMessage?: string | null;
  onParticipantAdd: () => void;
  onParticipantUpdate: (participant: InputScreenParticipant) => void;
  onParticipantRemove: (participantId: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface WorkspaceWorkItemsProps {
  status: InputScreenStatus;
  meetingFile: InputScreenMeetingFile | null;
  participants: InputScreenParticipant[];
  workItems: InputScreenWorkItem[];
  primaryBlocker: InputScreenBlocker | null;
  primaryBlockerMessage?: string | null;
  onWorkItemUpdate: (workItem: InputScreenWorkItem) => void;
  onWorkItemRemove: (workItemId: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface WorkspaceInputBarProps {
  status: InputScreenStatus;
  workspaceInput: string;
  canProceedToAnalysis: boolean;
  onWorkspaceInputChange: (value: string) => void;
  onWorkItemAdd: () => void;
  onProceedToAnalysisStart: () => void;
  disabled?: boolean;
  className?: string;
}

export interface InputScreenCallbacks {
  onFileSelect?: (file: File) => void;
  onFileClear?: () => void;
  onParticipantAdd?: () => void;
  onParticipantUpdate?: (participant: InputScreenParticipant) => void;
  onParticipantRemove?: (participantId: string) => void;
  onWorkspaceInputChange?: (value: string) => void;
  onWorkItemAdd?: () => void;
  onWorkItemRemove?: (workItemId: string) => void;
  onWorkItemUpdate?: (workItem: InputScreenWorkItem) => void;
  onProceedToAnalysisStart?: () => void;
}

export interface InputScreenProps extends InputScreenCallbacks {
  viewModel: InputScreenViewModel;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export interface InputScreenContainerProps extends InputScreenCallbacks {
  onProceedToAnalysis?: (payload: unknown) => void;
  simulateUpload?: boolean;
  disabled?: boolean;
  className?: string;
}
