import { useCallback, useMemo, useReducer, useRef } from "react";
import { type ConversionStepId } from "../../components/WorkspaceShell.types";
import type { DraftTimelineEvent, DraftTimelineStatus } from "../../types/meeting";
import type {
  ProcessingFlowError,
  ProcessingFlowStage,
  ProcessingFlowState,
  ProcessingFlowStatus,
  ProcessingFlowViewModel,
  UseProcessingFlowOptions,
} from "./ProcessingFlow.types";
import {
  getProcessingFlowStepDisplayStatus,
  type ProcessingFlowStepDisplayStatus,
} from "./ProcessingFlow.types";

export type {
  ProcessingFlowCallbacks,
  ProcessingFlowConversionStepsProps,
  ProcessingFlowActiveStepChipProps,
  ProcessingFlowDraftTimelineProps,
  ProcessingFlowError,
  ProcessingFlowProps,
  ProcessingFlowStage,
  ProcessingFlowState,
  ProcessingFlowStatus,
  ProcessingFlowStepDisplayStatus,
  ProcessingFlowViewModel,
  ProcessingFlowWorkspaceProps,
  UseProcessingFlowOptions,
} from "./ProcessingFlow.types";

export {
  getProcessingFlowStepDisplayStatus,
} from "./ProcessingFlow.types";

const PROCESSING_STAGES: ProcessingFlowStage[] = [
  "uploading",
  "stt_processing",
  "speaker_waiting",
  "draft_pending",
];

const STAGE_MESSAGES: Record<ProcessingFlowStage, string> = {
  uploading: "회의 파일을 업로드하고 있습니다.",
  stt_processing: "STT 변환을 진행하고 있습니다.",
  speaker_waiting: "화자 분리를 처리하고 있습니다.",
  draft_pending: "회의록 초안을 생성하고 있습니다.",
};

const STAGE_SUB_MESSAGES: Record<ProcessingFlowStage, string> = {
  uploading: "완료되면 STT 변환 단계로 이어집니다.",
  stt_processing: "음성을 텍스트로 변환하는 중입니다.",
  speaker_waiting: "발화자별로 구간을 분리하는 중입니다.",
  draft_pending: "요약·스크립트·초안을 준비하는 중입니다.",
};

const TIMELINE_LABELS: Record<ProcessingFlowStage, string> = {
  uploading: "파일 업로드",
  stt_processing: "STT 변환",
  speaker_waiting: "화자 분리",
  draft_pending: "초안 생성",
};

const TIMELINE_IDS: Record<ProcessingFlowStage, string> = {
  uploading: "upload",
  stt_processing: "stt",
  speaker_waiting: "speaker",
  draft_pending: "draft",
};

type ProcessingFlowAction =
  | { type: "SET_STAGE"; stage: ProcessingFlowStage; timestamp?: string }
  | { type: "SET_PROGRESS"; progress: number | null }
  | { type: "COMPLETE"; timestamp?: string }
  | { type: "FAIL"; error: ProcessingFlowError }
  | { type: "RETRY" }
  | { type: "RESET"; initialStatus?: ProcessingFlowStatus };

function isProcessingStage(status: ProcessingFlowStatus): status is ProcessingFlowStage {
  return PROCESSING_STAGES.includes(status as ProcessingFlowStage);
}

export function isProcessingFlowStage(
  status: ProcessingFlowStatus
): status is ProcessingFlowStage {
  return isProcessingStage(status);
}

function createInitialState(initialStatus: ProcessingFlowStatus = "uploading"): ProcessingFlowState {
  const stageTimestamps: Partial<Record<ProcessingFlowStage, string>> = {};

  if (isProcessingStage(initialStatus)) {
    stageTimestamps[initialStatus] = "시작됨";
  }

  return {
    status: initialStatus,
    progress: null,
    error: null,
    stageTimestamps,
  };
}

function getStageIndex(stage: ProcessingFlowStage): number {
  return PROCESSING_STAGES.indexOf(stage);
}

function getNextStage(stage: ProcessingFlowStage): ProcessingFlowStage | null {
  const index = getStageIndex(stage);
  return index >= 0 && index < PROCESSING_STAGES.length - 1
    ? PROCESSING_STAGES[index + 1]
    : null;
}

export function resolveActiveConversionStep(
  status: ProcessingFlowStatus,
  errorStage?: ProcessingFlowStage | null
): ConversionStepId {
  if (status === "success") {
    return "draft_pending";
  }

  if (status === "error" && errorStage) {
    return errorStage;
  }

  if (isProcessingStage(status)) {
    return status;
  }

  return "uploading";
}

function resolveTimelineStatus(
  stage: ProcessingFlowStage,
  state: ProcessingFlowState
): DraftTimelineStatus {
  if (state.status === "success") {
    return "done";
  }

  if (state.status === "error") {
    const errorStage = state.error?.stage;
    const stageIndex = getStageIndex(stage);
    const errorIndex = errorStage ? getStageIndex(errorStage) : -1;

    if (errorIndex >= 0 && stageIndex < errorIndex) {
      return "done";
    }

    if (errorStage === stage) {
      return "active";
    }

    return "pending";
  }

  if (!isProcessingStage(state.status)) {
    return "pending";
  }

  const currentIndex = getStageIndex(state.status);
  const stageIndex = getStageIndex(stage);

  if (stageIndex < currentIndex) {
    return "done";
  }

  if (stageIndex === currentIndex) {
    return "active";
  }

  return "pending";
}

function resolveTimelineTime(
  stage: ProcessingFlowStage,
  timelineStatus: DraftTimelineStatus,
  timestamp?: string
): string {
  if (timelineStatus === "done") {
    return timestamp ?? "완료";
  }

  if (timelineStatus === "active") {
    return timestamp ?? "진행 중";
  }

  return "대기 중";
}

export function buildProcessingFlowTimelineItems(
  state: ProcessingFlowState
): DraftTimelineEvent[] {
  return PROCESSING_STAGES.map((stage) => {
    const status = resolveTimelineStatus(stage, state);

    return {
      id: TIMELINE_IDS[stage],
      label: TIMELINE_LABELS[stage],
      time: resolveTimelineTime(stage, status, state.stageTimestamps[stage]),
      status,
    };
  });
}

export function getProcessingFlowMessage(
  status: ProcessingFlowStatus,
  progress: number | null = null
): string {
  if (status === "success") {
    return "모든 처리가 완료되었습니다.";
  }

  if (status === "error") {
    return "처리 중 오류가 발생했습니다.";
  }

  if (status === "idle") {
    return "처리를 시작하면 진행 상태가 표시됩니다.";
  }

  if (!isProcessingStage(status)) {
    return "처리 상태를 확인하고 있습니다.";
  }

  const baseMessage = STAGE_MESSAGES[status];

  if (progress !== null && progress >= 0 && progress <= 100) {
    return `${baseMessage} (${progress}%)`;
  }

  return baseMessage;
}

export function getProcessingFlowSubMessage(
  status: ProcessingFlowStatus
): string | null {
  if (status === "success") {
    return "요약본·스크립트·초안을 결과 패널에서 확인할 수 있습니다.";
  }

  if (status === "error") {
    return "다시 시도하면 실패한 단계부터 처리를 재개합니다.";
  }

  if (isProcessingStage(status)) {
    return STAGE_SUB_MESSAGES[status];
  }

  return null;
}

export function buildProcessingFlowViewModel(
  state: ProcessingFlowState
): ProcessingFlowViewModel {
  const isProcessing = isProcessingStage(state.status);
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return {
    status: state.status,
    activeStage: isProcessing ? state.status : null,
    activeConversionStep: resolveActiveConversionStep(
      state.status,
      state.error?.stage
    ),
    progress: state.progress,
    message: getProcessingFlowMessage(state.status, state.progress),
    subMessage: getProcessingFlowSubMessage(state.status),
    timelineItems: buildProcessingFlowTimelineItems(state),
    error: state.error,
    isProcessing,
    isSuccess,
    isError,
    canRetry: isError,
  };
}

function processingFlowReducer(
  state: ProcessingFlowState,
  action: ProcessingFlowAction
): ProcessingFlowState {
  switch (action.type) {
    case "SET_STAGE": {
      const timestamp = action.timestamp ?? "진행 중";

      return {
        ...state,
        status: action.stage,
        progress: null,
        error: null,
        stageTimestamps: {
          ...state.stageTimestamps,
          [action.stage]: timestamp,
        },
      };
    }
    case "SET_PROGRESS":
      return {
        ...state,
        progress: action.progress,
      };
    case "COMPLETE": {
      const completedTimestamps = PROCESSING_STAGES.reduce<
        Partial<Record<ProcessingFlowStage, string>>
      >((timestamps, stage) => {
        timestamps[stage] = state.stageTimestamps[stage] ?? action.timestamp ?? "완료";
        return timestamps;
      }, {});

      return {
        ...state,
        status: "success",
        progress: 100,
        error: null,
        stageTimestamps: completedTimestamps,
      };
    }
    case "FAIL":
      return {
        ...state,
        status: "error",
        error: action.error,
      };
    case "RETRY": {
      const retryStage = state.error?.stage ?? "uploading";

      return {
        ...state,
        status: retryStage,
        progress: null,
        error: null,
        stageTimestamps: {
          ...state.stageTimestamps,
          [retryStage]: "재시도 중",
        },
      };
    }
    case "RESET":
      return createInitialState(action.initialStatus);
    default:
      return state;
  }
}

export function getConversionStepDisplayStatus(
  stepId: ConversionStepId,
  activeStep: ConversionStepId,
  isSuccess = false,
  errorStep: ProcessingFlowStage | null = null
): ProcessingFlowStepDisplayStatus {
  return getProcessingFlowStepDisplayStatus(stepId, activeStep, {
    isSuccess,
    errorStep,
  });
}

export function useProcessingFlow(options: UseProcessingFlowOptions = {}) {
  const {
    initialStatus = "uploading",
    onStageChange,
    onComplete,
    onError,
    onRetry,
  } = options;

  const [state, dispatch] = useReducer(
    processingFlowReducer,
    initialStatus,
    createInitialState
  );
  const initialStatusRef = useRef(initialStatus);

  const viewModel = useMemo(() => buildProcessingFlowViewModel(state), [state]);

  const setStage = useCallback(
    (stage: ProcessingFlowStage, timestamp?: string) => {
      const previousStage = isProcessingStage(state.status) ? state.status : null;
      dispatch({ type: "SET_STAGE", stage, timestamp });
      onStageChange?.(stage, previousStage);
    },
    [state.status, onStageChange]
  );

  const advanceStage = useCallback(
    (timestamp?: string) => {
      if (!isProcessingStage(state.status)) {
        return;
      }

      const nextStage = getNextStage(state.status);
      if (!nextStage) {
        dispatch({ type: "COMPLETE", timestamp });
        onComplete?.();
        return;
      }

      setStage(nextStage, timestamp);
    },
    [state.status, setStage, onComplete]
  );

  const setProgress = useCallback((progress: number | null) => {
    dispatch({ type: "SET_PROGRESS", progress });
  }, []);

  const complete = useCallback(
    (timestamp?: string) => {
      dispatch({ type: "COMPLETE", timestamp });
      onComplete?.();
    },
    [onComplete]
  );

  const fail = useCallback(
    (message: string, stage?: ProcessingFlowStage) => {
      const errorStage = stage ?? (isProcessingStage(state.status) ? state.status : "uploading");
      const error: ProcessingFlowError = { stage: errorStage, message };
      dispatch({ type: "FAIL", error });
      onError?.(error);
    },
    [state.status, onError]
  );

  const retry = useCallback(() => {
    const retryStage = state.error?.stage ?? "uploading";
    dispatch({ type: "RETRY" });
    onRetry?.(retryStage);
  }, [state.error?.stage, onRetry]);

  const reset = useCallback(
    (status: ProcessingFlowStatus = initialStatusRef.current) => {
      dispatch({ type: "RESET", initialStatus: status });
    },
    []
  );

  return {
    state,
    viewModel,
    setStage,
    advanceStage,
    setProgress,
    complete,
    fail,
    retry,
    reset,
  };
}

export {
  ProcessingFlow,
  ProcessingFlowActiveStepChip,
  ProcessingFlowConversionSteps,
  ProcessingFlowDraftTimeline,
  ProcessingFlowWorkspace,
} from "./ProcessingFlow.tsx";
