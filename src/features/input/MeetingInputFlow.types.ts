export type MeetingInputFlowStatus = "idle" | "validating" | "ready";

export type MeetingInputFlowBlocker =
  | "no_file"
  | "no_participants"
  | "invalid_participant"
  | "no_work_items"
  | "insufficient_work_input";

export interface InputMeetingFile {
  id: string;
  name: string;
  sizeLabel: string;
  sourceFile?: File;
}

export interface InputParticipant {
  id: string;
  name: string;
  role: string;
}

export interface InputAnalysisOptions {
  enableSpeakerSeparation: boolean;
  generateSummary: boolean;
  generateDraft: boolean;
}

export interface InputWorkItem {
  id: string;
  text: string;
}

export interface MeetingInputFlowState {
  status: MeetingInputFlowStatus;
  meetingFile: InputMeetingFile | null;
  participants: InputParticipant[];
  analysisOptions: InputAnalysisOptions;
  workItems: InputWorkItem[];
  workspaceInput: string;
  validationAttempted: boolean;
  workItemAddAttempted: boolean;
}

export interface MeetingInputPayload {
  meetingFile: InputMeetingFile;
  participants: InputParticipant[];
  analysisOptions: InputAnalysisOptions;
  workItems: InputWorkItem[];
  workspaceInput: string;
}

export interface MeetingInputFlowCallbacks {
  onFileSelect?: (file: File, meetingFile: InputMeetingFile) => void;
  onFileClear?: () => void;
  onParticipantAdd?: (participant: InputParticipant) => void;
  onParticipantUpdate?: (participant: InputParticipant) => void;
  onParticipantRemove?: (participantId: string) => void;
  onAnalysisOptionsChange?: (options: InputAnalysisOptions) => void;
  onWorkItemAdd?: (workItem: InputWorkItem) => void;
  onWorkItemRemove?: (workItemId: string) => void;
  onWorkItemUpdate?: (workItem: InputWorkItem) => void;
  onWorkspaceInputChange?: (value: string) => void;
  onReady?: (payload: MeetingInputPayload) => void;
  onProceedToAnalysisStart?: (payload: MeetingInputPayload) => void;
}

export interface UseMeetingInputFlowOptions extends MeetingInputFlowCallbacks {
  minParticipants?: number;
  requireWorkItems?: boolean;
  initialWorkspaceInput?: string;
  initialAnalysisOptions?: Partial<InputAnalysisOptions>;
  initialParticipants?: InputParticipant[];
}

export interface MeetingInputFlowViewModel {
  status: MeetingInputFlowStatus;
  blockers: MeetingInputFlowBlocker[];
  primaryBlocker: MeetingInputFlowBlocker | null;
  meetingFile: InputMeetingFile | null;
  participants: InputParticipant[];
  analysisOptions: InputAnalysisOptions;
  workItems: InputWorkItem[];
  workspaceInput: string;
  canProceedToAnalysis: boolean;
  blockerMessages: string[];
  primaryBlockerMessage: string | null;
  isFileSelected: boolean;
  hasParticipants: boolean;
  hasWorkItems: boolean;
}

export interface MeetingInputFlowMeetingFileProps {
  status: MeetingInputFlowStatus;
  meetingFile: InputMeetingFile | null;
  primaryBlocker: MeetingInputFlowBlocker | null;
  primaryBlockerMessage?: string | null;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export interface MeetingInputFlowParticipantsProps {
  status: MeetingInputFlowStatus;
  participants: InputParticipant[];
  primaryBlocker: MeetingInputFlowBlocker | null;
  primaryBlockerMessage?: string | null;
  onParticipantAdd: () => void;
  onParticipantUpdate: (participant: InputParticipant) => void;
  onParticipantRemove: (participantId: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface MeetingInputFlowAnalysisOptionsProps {
  options: InputAnalysisOptions;
  onChange: (options: InputAnalysisOptions) => void;
  disabled?: boolean;
  className?: string;
}

export interface MeetingInputFlowWorkspaceProps {
  status: MeetingInputFlowStatus;
  primaryBlocker: MeetingInputFlowBlocker | null;
  primaryBlockerMessage?: string | null;
  canProceedToAnalysis: boolean;
  workspaceInput: string;
  workItems: InputWorkItem[];
  onWorkspaceInputChange: (value: string) => void;
  onWorkItemAdd: () => void;
  onWorkItemRemove: (workItemId: string) => void;
  onWorkItemUpdate: (workItem: InputWorkItem) => void;
  onProceedToAnalysisStart: () => void;
  disabled?: boolean;
  className?: string;
}

export interface MeetingInputFlowProps {
  viewModel: MeetingInputFlowViewModel;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  onParticipantAdd: () => void;
  onParticipantUpdate: (participant: InputParticipant) => void;
  onParticipantRemove: (participantId: string) => void;
  onAnalysisOptionsChange: (options: InputAnalysisOptions) => void;
  onWorkspaceInputChange: (value: string) => void;
  onWorkItemAdd: () => void;
  onWorkItemRemove: (workItemId: string) => void;
  onWorkItemUpdate: (workItem: InputWorkItem) => void;
  onProceedToAnalysisStart: () => void;
  accept?: string;
  disabled?: boolean;
}
