import { useCallback, useMemo, useReducer } from "react";
import type { ConversionStepId } from "../../components/WorkspaceShell.types";
import type {
  StartFlowBlocker,
  StartFlowState,
  StartFlowStatus,
  StartFlowViewModel,
  StartMeetingFile,
  UseStartFlowOptions,
} from "./StartFlow.types";

export type {
  StartFlowBlocker,
  StartFlowCallbacks,
  StartFlowConversionStepsProps,
  StartFlowMeetingFileProps,
  StartFlowProps,
  StartFlowState,
  StartFlowStatus,
  StartFlowViewModel,
  StartFlowWorkspaceProps,
  StartMeetingFile,
  UseStartFlowOptions,
} from "./StartFlow.types";

const START_FLOW_ACTIVE_STEP: ConversionStepId = "uploading";

const BLOCKER_MESSAGES: Record<StartFlowBlocker, string> = {
  no_file: "분석을 시작하려면 회의 녹취 파일을 먼저 선택해 주세요.",
  insufficient_input: "분석을 시작하려면 업무 입력을 작성해 주세요.",
};

type StartFlowAction =
  | { type: "SELECT_FILE"; meetingFile: StartMeetingFile }
  | { type: "CLEAR_FILE" }
  | { type: "SET_INPUT"; value: string }
  | { type: "START_ANALYSIS" }
  | { type: "START_ATTEMPT" }
  | { type: "RESET" };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createMeetingFile(file: File): StartMeetingFile {
  return {
    id: `start-file-${file.lastModified}-${file.size}`,
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    sourceFile: file,
  };
}

function createInitialState(initialInputValue = ""): StartFlowState {
  return {
    status: "idle",
    meetingFile: null,
    inputValue: initialInputValue,
    startAttempted: false,
  };
}

function resolveBlocker(
  state: StartFlowState,
  requireInput: boolean
): StartFlowBlocker | null {
  if (!state.meetingFile) {
    return "no_file";
  }

  if (requireInput && state.inputValue.trim().length === 0) {
    return "insufficient_input";
  }

  return null;
}

function resolveStatus(state: StartFlowState): StartFlowStatus {
  if (state.status === "uploading") {
    return "uploading";
  }

  if (!state.meetingFile) {
    return "idle";
  }

  return "ready";
}

function startFlowReducer(
  state: StartFlowState,
  action: StartFlowAction
): StartFlowState {
  switch (action.type) {
    case "SELECT_FILE":
      return {
        ...state,
        status: "ready",
        meetingFile: action.meetingFile,
        startAttempted: false,
      };
    case "CLEAR_FILE":
      return {
        ...state,
        status: "idle",
        meetingFile: null,
        startAttempted: false,
      };
    case "SET_INPUT":
      return {
        ...state,
        inputValue: action.value,
        startAttempted: false,
      };
    case "START_ATTEMPT":
      return {
        ...state,
        startAttempted: true,
      };
    case "START_ANALYSIS":
      return {
        ...state,
        status: "uploading",
        startAttempted: false,
      };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

export function getStartFlowBlockerMessage(
  blocker: StartFlowBlocker | null
): string | null {
  if (!blocker) {
    return null;
  }

  return BLOCKER_MESSAGES[blocker];
}

export function canStartAnalysis(
  state: StartFlowState,
  requireInput = false
): boolean {
  return resolveBlocker(state, requireInput) === null && state.status !== "uploading";
}

export function buildStartFlowViewModel(
  state: StartFlowState,
  requireInput = false
): StartFlowViewModel {
  const status = resolveStatus(state);
  const validationBlocker = resolveBlocker(state, requireInput);
  const blocker = state.startAttempted ? validationBlocker : null;

  return {
    status,
    blocker,
    meetingFile: state.meetingFile,
    inputValue: state.inputValue,
    canStartAnalysis: validationBlocker === null && status === "ready",
    activeConversionStep: START_FLOW_ACTIVE_STEP,
    blockerMessage: getStartFlowBlockerMessage(blocker),
    isFileSelected: state.meetingFile !== null,
    isUploading: status === "uploading",
  };
}

export function useStartFlow(options: UseStartFlowOptions = {}) {
  const {
    requireInput = false,
    initialInputValue = "",
    onFileSelect,
    onFileClear,
    onAnalysisStart,
    onUploading,
  } = options;

  const [state, dispatch] = useReducer(
    startFlowReducer,
    initialInputValue,
    createInitialState
  );

  const viewModel = useMemo(
    () => buildStartFlowViewModel(state, requireInput),
    [state, requireInput]
  );

  const selectFile = useCallback(
    (file: File) => {
      const meetingFile = createMeetingFile(file);
      dispatch({ type: "SELECT_FILE", meetingFile });
      onFileSelect?.(file, meetingFile);
    },
    [onFileSelect]
  );

  const clearFile = useCallback(() => {
    dispatch({ type: "CLEAR_FILE" });
    onFileClear?.();
  }, [onFileClear]);

  const setInputValue = useCallback((value: string) => {
    dispatch({ type: "SET_INPUT", value });
  }, []);

  const startAnalysis = useCallback(() => {
    const validationBlocker = resolveBlocker(state, requireInput);

    if (validationBlocker) {
      dispatch({ type: "START_ATTEMPT" });
      return;
    }

    if (!state.meetingFile || state.status === "uploading") {
      return;
    }

    dispatch({ type: "START_ANALYSIS" });
    onAnalysisStart?.(state.meetingFile);
    onUploading?.(state.meetingFile);
  }, [state, requireInput, onAnalysisStart, onUploading]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    viewModel,
    selectFile,
    clearFile,
    setInputValue,
    startAnalysis,
    reset,
  };
}

export {
  StartFlow,
  StartFlowConversionSteps,
  StartFlowMeetingFile,
  StartFlowWorkspace,
} from "./StartFlow.tsx";
