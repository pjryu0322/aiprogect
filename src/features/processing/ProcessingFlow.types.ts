import type { ConversionStepId } from "../../components/WorkspaceShell.types";
import type { DraftTimelineEvent, ProcessingStage } from "../../types/meeting";

export type ProcessingFlowStatus = ProcessingStage;

export type ProcessingFlowStage = Extract<
  ProcessingFlowStatus,
  "uploading" | "stt_processing" | "speaker_waiting" | "draft_pending"
>;

export interface ProcessingFlowError {
  stage: ProcessingFlowStage;
  message: string;
}

export interface ProcessingFlowState {
  status: ProcessingFlowStatus;
  progress: number | null;
  error: ProcessingFlowError | null;
  stageTimestamps: Partial<Record<ProcessingFlowStage, string>>;
}

export interface ProcessingFlowCallbacks {
  onStageChange?: (
    stage: ProcessingFlowStage,
    previousStage: ProcessingFlowStage | null
  ) => void;
  onComplete?: () => void;
  onError?: (error: ProcessingFlowError) => void;
  onRetry?: (stage: ProcessingFlowStage) => void;
}

export interface UseProcessingFlowOptions extends ProcessingFlowCallbacks {
  initialStatus?: ProcessingFlowStatus;
}

export interface ProcessingFlowViewModel {
  status: ProcessingFlowStatus;
  activeConversionStep: ConversionStepId;
  progress: number | null;
  message: string;
  subMessage: string | null;
  timelineItems: DraftTimelineEvent[];
  error: ProcessingFlowError | null;
  isProcessing: boolean;
  isSuccess: boolean;
  isError: boolean;
  canRetry: boolean;
}

export interface ProcessingFlowConversionStepsProps {
  activeStep: ConversionStepId;
  isSuccess?: boolean;
  className?: string;
}

export interface ProcessingFlowWorkspaceProps {
  viewModel: ProcessingFlowViewModel;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export interface ProcessingFlowDraftTimelineProps {
  items: DraftTimelineEvent[];
  error?: ProcessingFlowError | null;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export interface ProcessingFlowProps {
  viewModel: ProcessingFlowViewModel;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}
