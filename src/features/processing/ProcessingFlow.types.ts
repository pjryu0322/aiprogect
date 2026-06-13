import {
  CONVERSION_STEPS,
  type ConversionStepId,
} from "../../components/WorkspaceShell.types";
import type { DraftTimelineEvent, ProcessingStage } from "../../types/meeting";

export type ProcessingFlowStatus = ProcessingStage;

export type ProcessingFlowStage = Extract<
  ProcessingFlowStatus,
  "uploading" | "stt_processing" | "speaker_waiting" | "draft_pending"
>;

export type ProcessingFlowStepDisplayStatus = "done" | "active" | "pending" | "error";

export function getProcessingFlowStepDisplayStatus(
  stepId: ConversionStepId,
  activeStep: ConversionStepId,
  options: { isSuccess?: boolean; errorStep?: ProcessingFlowStage | null } = {}
): ProcessingFlowStepDisplayStatus {
  const { isSuccess = false, errorStep = null } = options;

  if (isSuccess) {
    return "done";
  }

  if (errorStep && stepId === errorStep) {
    return "error";
  }

  const stepOrder = CONVERSION_STEPS.map((step) => step.id);
  const activeIndex = stepOrder.indexOf(activeStep);
  const stepIndex = stepOrder.indexOf(stepId);

  if (stepIndex < activeIndex) {
    return "done";
  }

  if (stepIndex === activeIndex) {
    return "active";
  }

  return "pending";
}

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
  activeStage: ProcessingFlowStage | null;
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
  errorStep?: ProcessingFlowStage | null;
  className?: string;
}

export interface ProcessingFlowActiveStepChipProps {
  viewModel: ProcessingFlowViewModel;
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
