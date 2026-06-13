import type { ConversionStepId } from "../../components/WorkspaceShell.types";

export type StartFlowStatus = "idle" | "ready" | "uploading";

export type StartFlowBlocker = "no_file" | "insufficient_input";

export interface StartMeetingFile {
  id: string;
  name: string;
  sizeLabel: string;
  sourceFile?: File;
}

export interface StartFlowState {
  status: StartFlowStatus;
  meetingFile: StartMeetingFile | null;
  inputValue: string;
  startAttempted: boolean;
}

export interface StartFlowCallbacks {
  onFileSelect?: (file: File, meetingFile: StartMeetingFile) => void;
  onFileClear?: () => void;
  onAnalysisStart?: (meetingFile: StartMeetingFile) => void;
  onUploading?: (meetingFile: StartMeetingFile) => void;
}

export interface UseStartFlowOptions extends StartFlowCallbacks {
  requireInput?: boolean;
  initialInputValue?: string;
}

export interface StartFlowViewModel {
  status: StartFlowStatus;
  blocker: StartFlowBlocker | null;
  meetingFile: StartMeetingFile | null;
  inputValue: string;
  canStartAnalysis: boolean;
  activeConversionStep: ConversionStepId;
  blockerMessage: string | null;
  isFileSelected: boolean;
  isUploading: boolean;
}

export interface StartFlowMeetingFileProps {
  status: StartFlowStatus;
  meetingFile: StartMeetingFile | null;
  blocker: StartFlowBlocker | null;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export interface StartFlowWorkspaceProps {
  status: StartFlowStatus;
  blocker: StartFlowBlocker | null;
  blockerMessage?: string | null;
  canStartAnalysis: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onStartAnalysis: () => void;
  requireInput?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface StartFlowConversionStepsProps {
  activeStep: ConversionStepId;
  className?: string;
}

export interface StartFlowProps {
  viewModel: StartFlowViewModel;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  onInputChange: (value: string) => void;
  onStartAnalysis: () => void;
  requireInput?: boolean;
  accept?: string;
  disabled?: boolean;
}
