import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type {
  InputAnalysisOptions,
  InputMeetingFile,
  InputParticipant,
  InputWorkItem,
  MeetingInputFlowBlocker,
  MeetingInputFlowState,
  MeetingInputFlowStatus,
  MeetingInputFlowViewModel,
  MeetingInputPayload,
  UseMeetingInputFlowOptions,
} from "./MeetingInputFlow.types";

export type {
  InputAnalysisOptions,
  InputMeetingFile,
  InputParticipant,
  InputWorkItem,
  MeetingInputFlowAnalysisOptionsProps,
  MeetingInputFlowBlocker,
  MeetingInputFlowCallbacks,
  MeetingInputFlowMeetingFileProps,
  MeetingInputFlowParticipantsProps,
  MeetingInputFlowProps,
  MeetingInputFlowState,
  MeetingInputFlowStatus,
  MeetingInputFlowViewModel,
  MeetingInputFlowWorkspaceProps,
  MeetingInputPayload,
  UseMeetingInputFlowOptions,
} from "./MeetingInputFlow.types";

const DEFAULT_ANALYSIS_OPTIONS: InputAnalysisOptions = {
  enableSpeakerSeparation: true,
  generateSummary: true,
  generateDraft: true,
};

const BLOCKER_MESSAGES: Record<MeetingInputFlowBlocker, string> = {
  no_file: "분석을 시작하려면 회의 녹취 파일을 먼저 선택해 주세요.",
  no_participants: "참여자를 한 명 이상 추가해 주세요.",
  invalid_participant: "모든 참여자의 이름을 입력해 주세요.",
  no_work_items: "작업 추가(+) 버튼으로 분석할 업무를 한 개 이상 등록해 주세요.",
  insufficient_work_input: "작업을 추가하려면 업무 입력 내용을 작성해 주세요.",
};

type MeetingInputFlowAction =
  | { type: "SELECT_FILE"; meetingFile: InputMeetingFile }
  | { type: "CLEAR_FILE" }
  | { type: "ADD_PARTICIPANT"; participant: InputParticipant }
  | { type: "UPDATE_PARTICIPANT"; participant: InputParticipant }
  | { type: "REMOVE_PARTICIPANT"; participantId: string }
  | { type: "SET_ANALYSIS_OPTIONS"; options: InputAnalysisOptions }
  | { type: "SET_WORKSPACE_INPUT"; value: string }
  | { type: "ADD_WORK_ITEM"; workItem: InputWorkItem }
  | { type: "UPDATE_WORK_ITEM"; workItem: InputWorkItem }
  | { type: "REMOVE_WORK_ITEM"; workItemId: string }
  | { type: "VALIDATION_ATTEMPT" }
  | { type: "WORK_ITEM_ADD_ATTEMPT" }
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

function createMeetingFile(file: File): InputMeetingFile {
  return {
    id: `input-file-${file.lastModified}-${file.size}`,
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    sourceFile: file,
  };
}

function createParticipant(name = "", role = ""): InputParticipant {
  return {
    id: `participant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    role,
  };
}

function createWorkItem(text: string): InputWorkItem {
  return {
    id: `work-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
  };
}

function createInitialState(options: UseMeetingInputFlowOptions = {}): MeetingInputFlowState {
  return {
    status: "idle",
    meetingFile: null,
    participants: options.initialParticipants ?? [],
    analysisOptions: {
      ...DEFAULT_ANALYSIS_OPTIONS,
      ...options.initialAnalysisOptions,
    },
    workItems: [],
    workspaceInput: options.initialWorkspaceInput ?? "",
    validationAttempted: false,
    workItemAddAttempted: false,
  };
}

function resolveBlockers(
  state: MeetingInputFlowState,
  minParticipants: number,
  requireWorkItems: boolean
): MeetingInputFlowBlocker[] {
  const blockers: MeetingInputFlowBlocker[] = [];

  if (!state.meetingFile) {
    blockers.push("no_file");
  }

  if (state.participants.length < minParticipants) {
    blockers.push("no_participants");
  } else if (state.participants.some((participant) => participant.name.trim().length === 0)) {
    blockers.push("invalid_participant");
  }

  if (state.workItemAddAttempted && state.workspaceInput.trim().length === 0) {
    blockers.push("insufficient_work_input");
  }

  if (requireWorkItems && state.workItems.length === 0) {
    blockers.push("no_work_items");
  }

  return blockers;
}

function resolveStatus(
  state: MeetingInputFlowState,
  blockers: MeetingInputFlowBlocker[]
): MeetingInputFlowStatus {
  if (blockers.length === 0 && state.meetingFile) {
    return "ready";
  }

  if (state.validationAttempted && blockers.length > 0) {
    return "validating";
  }

  return "idle";
}

function meetingInputFlowReducer(
  state: MeetingInputFlowState,
  action: MeetingInputFlowAction
): MeetingInputFlowState {
  switch (action.type) {
    case "SELECT_FILE":
      return {
        ...state,
        meetingFile: action.meetingFile,
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "CLEAR_FILE":
      return {
        ...state,
        meetingFile: null,
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "ADD_PARTICIPANT":
      return {
        ...state,
        participants: [...state.participants, action.participant],
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "UPDATE_PARTICIPANT":
      return {
        ...state,
        participants: state.participants.map((participant) =>
          participant.id === action.participant.id ? action.participant : participant
        ),
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "REMOVE_PARTICIPANT":
      return {
        ...state,
        participants: state.participants.filter(
          (participant) => participant.id !== action.participantId
        ),
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "SET_ANALYSIS_OPTIONS":
      return {
        ...state,
        analysisOptions: action.options,
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "SET_WORKSPACE_INPUT":
      return {
        ...state,
        workspaceInput: action.value,
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "ADD_WORK_ITEM":
      return {
        ...state,
        workItems: [...state.workItems, action.workItem],
        workspaceInput: "",
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "UPDATE_WORK_ITEM":
      return {
        ...state,
        workItems: state.workItems.map((workItem) =>
          workItem.id === action.workItem.id ? action.workItem : workItem
        ),
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "REMOVE_WORK_ITEM":
      return {
        ...state,
        workItems: state.workItems.filter((workItem) => workItem.id !== action.workItemId),
        validationAttempted: false,
        workItemAddAttempted: false,
      };
    case "VALIDATION_ATTEMPT":
      return {
        ...state,
        validationAttempted: true,
      };
    case "WORK_ITEM_ADD_ATTEMPT":
      return {
        ...state,
        workItemAddAttempted: true,
        validationAttempted: true,
      };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

export function getMeetingInputFlowBlockerMessage(
  blocker: MeetingInputFlowBlocker | null
): string | null {
  if (!blocker) {
    return null;
  }

  return BLOCKER_MESSAGES[blocker];
}

export function getMeetingInputFlowBlockerMessages(
  blockers: MeetingInputFlowBlocker[]
): string[] {
  return blockers.map((blocker) => BLOCKER_MESSAGES[blocker]);
}

export function canProceedToAnalysisStart(
  state: MeetingInputFlowState,
  minParticipants = 1,
  requireWorkItems = true
): boolean {
  return resolveBlockers(state, minParticipants, requireWorkItems).length === 0;
}

export function buildMeetingInputPayload(state: MeetingInputFlowState): MeetingInputPayload | null {
  if (!state.meetingFile) {
    return null;
  }

  return {
    meetingFile: state.meetingFile,
    participants: state.participants,
    analysisOptions: state.analysisOptions,
    workItems: state.workItems,
    workspaceInput: state.workspaceInput,
  };
}

export function buildMeetingInputFlowViewModel(
  state: MeetingInputFlowState,
  minParticipants = 1,
  requireWorkItems = true
): MeetingInputFlowViewModel {
  const validationBlockers = resolveBlockers(state, minParticipants, requireWorkItems);
  const status = resolveStatus(state, validationBlockers);
  const blockers = state.validationAttempted ? validationBlockers : [];
  const primaryBlocker = blockers[0] ?? null;

  return {
    status,
    blockers,
    primaryBlocker,
    meetingFile: state.meetingFile,
    participants: state.participants,
    analysisOptions: state.analysisOptions,
    workItems: state.workItems,
    workspaceInput: state.workspaceInput,
    canProceedToAnalysis:
      validationBlockers.length === 0 && state.meetingFile !== null && status === "ready",
    blockerMessages: getMeetingInputFlowBlockerMessages(blockers),
    primaryBlockerMessage: getMeetingInputFlowBlockerMessage(primaryBlocker),
    isFileSelected: state.meetingFile !== null,
    hasParticipants: state.participants.length >= minParticipants,
    hasWorkItems: state.workItems.length > 0,
  };
}

export function useMeetingInputFlow(options: UseMeetingInputFlowOptions = {}) {
  const {
    minParticipants = 1,
    requireWorkItems = true,
    onFileSelect,
    onFileClear,
    onParticipantAdd,
    onParticipantUpdate,
    onParticipantRemove,
    onAnalysisOptionsChange,
    onWorkItemAdd,
    onWorkItemRemove,
    onWorkItemUpdate,
    onWorkspaceInputChange,
    onReady,
    onProceedToAnalysisStart,
    ...initialOptions
  } = options;

  const [state, dispatch] = useReducer(
    meetingInputFlowReducer,
    initialOptions,
    createInitialState
  );

  const readyNotifiedRef = useRef(false);

  const viewModel = useMemo(
    () => buildMeetingInputFlowViewModel(state, minParticipants, requireWorkItems),
    [state, minParticipants, requireWorkItems]
  );

  useEffect(() => {
    const payload = buildMeetingInputPayload(state);

    if (viewModel.status === "ready" && payload) {
      if (!readyNotifiedRef.current) {
        readyNotifiedRef.current = true;
        onReady?.(payload);
      }
      return;
    }

    readyNotifiedRef.current = false;
  }, [state, viewModel.status, onReady]);

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

  const addParticipant = useCallback(
    (name = "", role = "") => {
      const participant = createParticipant(name, role);
      dispatch({ type: "ADD_PARTICIPANT", participant });
      onParticipantAdd?.(participant);
      return participant;
    },
    [onParticipantAdd]
  );

  const updateParticipant = useCallback(
    (participant: InputParticipant) => {
      dispatch({ type: "UPDATE_PARTICIPANT", participant });
      onParticipantUpdate?.(participant);
    },
    [onParticipantUpdate]
  );

  const removeParticipant = useCallback(
    (participantId: string) => {
      dispatch({ type: "REMOVE_PARTICIPANT", participantId });
      onParticipantRemove?.(participantId);
    },
    [onParticipantRemove]
  );

  const setAnalysisOptions = useCallback(
    (analysisOptions: InputAnalysisOptions) => {
      dispatch({ type: "SET_ANALYSIS_OPTIONS", options: analysisOptions });
      onAnalysisOptionsChange?.(analysisOptions);
    },
    [onAnalysisOptionsChange]
  );

  const setWorkspaceInput = useCallback(
    (value: string) => {
      dispatch({ type: "SET_WORKSPACE_INPUT", value });
      onWorkspaceInputChange?.(value);
    },
    [onWorkspaceInputChange]
  );

  const addWorkItemFromInput = useCallback(() => {
    const trimmedInput = state.workspaceInput.trim();

    if (trimmedInput.length === 0) {
      dispatch({ type: "WORK_ITEM_ADD_ATTEMPT" });
      return false;
    }

    const workItem = createWorkItem(trimmedInput);
    dispatch({ type: "ADD_WORK_ITEM", workItem });
    onWorkItemAdd?.(workItem);
    return true;
  }, [state.workspaceInput, onWorkItemAdd]);

  const updateWorkItem = useCallback(
    (workItem: InputWorkItem) => {
      dispatch({ type: "UPDATE_WORK_ITEM", workItem });
      onWorkItemUpdate?.(workItem);
    },
    [onWorkItemUpdate]
  );

  const removeWorkItem = useCallback(
    (workItemId: string) => {
      dispatch({ type: "REMOVE_WORK_ITEM", workItemId });
      onWorkItemRemove?.(workItemId);
    },
    [onWorkItemRemove]
  );

  const proceedToAnalysisStart = useCallback(() => {
    const validationBlockers = resolveBlockers(state, minParticipants, requireWorkItems);

    if (validationBlockers.length > 0) {
      dispatch({ type: "VALIDATION_ATTEMPT" });
      return false;
    }

    const payload = buildMeetingInputPayload(state);

    if (!payload) {
      dispatch({ type: "VALIDATION_ATTEMPT" });
      return false;
    }

    onProceedToAnalysisStart?.(payload);
    return true;
  }, [state, minParticipants, requireWorkItems, onProceedToAnalysisStart]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    readyNotifiedRef.current = false;
  }, []);

  return {
    state,
    viewModel,
    selectFile,
    clearFile,
    addParticipant,
    updateParticipant,
    removeParticipant,
    setAnalysisOptions,
    setWorkspaceInput,
    addWorkItemFromInput,
    updateWorkItem,
    removeWorkItem,
    proceedToAnalysisStart,
    reset,
  };
}

export {
  MeetingInputFlow,
  MeetingInputFlowAnalysisOptions,
  MeetingInputFlowMeetingFile,
  MeetingInputFlowParticipants,
  MeetingInputFlowWorkspace,
} from "./MeetingInputFlow.tsx";
