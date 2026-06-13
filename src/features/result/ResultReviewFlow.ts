import { useCallback, useMemo, useReducer, useRef } from "react";
import type {
  ResultReviewFlowState,
  ResultReviewFlowStatus,
  ResultReviewFlowViewModel,
  ResultReviewPayload,
  ResultReviewTabId,
  UseResultReviewFlowOptions,
} from "./ResultReviewFlow.types";

export type {
  ResultReviewFlowCallbacks,
  ResultReviewFlowDraftTimelineProps,
  ResultReviewFlowPanelProps,
  ResultReviewFlowProps,
  ResultReviewFlowReviewActionsProps,
  ResultReviewFlowScriptProps,
  ResultReviewFlowState,
  ResultReviewFlowStatus,
  ResultReviewFlowSummaryProps,
  ResultReviewFlowTabsProps,
  ResultReviewFlowViewModel,
  ResultReviewPayload,
  ResultReviewTabId,
  UseResultReviewFlowOptions,
} from "./ResultReviewFlow.types";

const DEFAULT_ERROR_MESSAGE = "결과를 불러오지 못했습니다. 다시 시도해 주세요.";

type ResultReviewFlowAction =
  | { type: "SET_TAB"; tab: ResultReviewTabId }
  | {
      type: "SET_STATUS";
      status: ResultReviewFlowStatus;
      errorMessage?: string | null;
    }
  | { type: "SET_RESULTS"; payload: Partial<ResultReviewPayload> }
  | { type: "LOADING" }
  | { type: "ERROR"; errorMessage?: string | null }
  | { type: "SUCCESS"; payload?: Partial<ResultReviewPayload> }
  | { type: "CLEAR" }
  | { type: "RESTORE"; state: ResultReviewFlowState }
  | { type: "RESET" };

function createEmptyResults(): Pick<
  ResultReviewFlowState,
  | "summary"
  | "decisions"
  | "actionItems"
  | "transcriptSegments"
  | "participants"
  | "draftTimeline"
> {
  return {
    summary: null,
    decisions: [],
    actionItems: [],
    transcriptSegments: [],
    participants: [],
    draftTimeline: [],
  };
}

function createInitialState(
  options: UseResultReviewFlowOptions = {}
): ResultReviewFlowState {
  const initialResults = options.initialResults ?? {};

  return {
    status: options.initialStatus ?? "empty",
    activeTab: options.initialTab ?? "summary",
    errorMessage: options.initialErrorMessage ?? null,
    summary: initialResults.summary ?? null,
    decisions: initialResults.decisions ?? [],
    actionItems: initialResults.actionItems ?? [],
    transcriptSegments: initialResults.transcriptSegments ?? [],
    participants: initialResults.participants ?? [],
    draftTimeline: initialResults.draftTimeline ?? [],
  };
}

function hasResultPayload(state: ResultReviewFlowState): boolean {
  return (
    state.summary !== null ||
    state.decisions.length > 0 ||
    state.actionItems.length > 0 ||
    state.transcriptSegments.length > 0
  );
}

function resolveStatus(state: ResultReviewFlowState): ResultReviewFlowStatus {
  if (state.status === "loading" || state.status === "error") {
    return state.status;
  }

  if (hasResultPayload(state)) {
    return "success";
  }

  return "empty";
}

function resultReviewFlowReducer(
  state: ResultReviewFlowState,
  action: ResultReviewFlowAction
): ResultReviewFlowState {
  switch (action.type) {
    case "SET_TAB":
      return {
        ...state,
        activeTab: action.tab,
      };
    case "SET_STATUS":
      return {
        ...state,
        status: action.status,
        errorMessage:
          action.status === "error"
            ? action.errorMessage ?? state.errorMessage ?? DEFAULT_ERROR_MESSAGE
            : action.status === "loading"
              ? null
              : state.errorMessage,
      };
    case "SET_RESULTS": {
      const nextState = {
        ...state,
        ...action.payload,
      };

      return {
        ...nextState,
        status: resolveStatus(nextState),
        errorMessage: null,
      };
    }
    case "LOADING":
      return {
        ...state,
        status: "loading",
        errorMessage: null,
      };
    case "ERROR":
      return {
        ...state,
        status: "error",
        errorMessage: action.errorMessage ?? DEFAULT_ERROR_MESSAGE,
      };
    case "SUCCESS": {
      const nextState = {
        ...state,
        ...(action.payload ?? {}),
      };

      return {
        ...nextState,
        status: "success",
        errorMessage: null,
      };
    }
    case "CLEAR":
      return {
        ...state,
        ...createEmptyResults(),
        status: "empty",
        errorMessage: null,
      };
    case "RESTORE":
      return action.state;
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

export function buildParticipantMap(
  participants: ResultReviewFlowState["participants"]
): Record<string, ResultReviewFlowState["participants"][number]> {
  return participants.reduce<Record<string, ResultReviewFlowState["participants"][number]>>(
    (map, participant) => {
      map[participant.id] = participant;
      return map;
    },
    {}
  );
}

export function buildResultReviewFlowViewModel(
  state: ResultReviewFlowState
): ResultReviewFlowViewModel {
  const status = resolveStatus(state);
  const participantById = buildParticipantMap(state.participants);
  const hasSummaryContent =
    (state.summary !== null &&
      (Boolean(state.summary.overview) || state.summary.highlights.length > 0)) ||
    state.decisions.length > 0 ||
    state.actionItems.length > 0;
  const hasScriptContent = state.transcriptSegments.length > 0;

  return {
    status,
    activeTab: state.activeTab,
    isEmpty: status === "empty",
    isLoading: status === "loading",
    hasError: status === "error",
    isSuccess: status === "success",
    errorMessage: state.errorMessage,
    summary: state.summary,
    decisions: state.decisions,
    actionItems: state.actionItems,
    transcriptSegments: state.transcriptSegments,
    participants: state.participants,
    participantById,
    draftTimeline: state.draftTimeline,
    hasSummaryContent: Boolean(hasSummaryContent),
    hasScriptContent,
    canReview: status === "success" && (hasSummaryContent || hasScriptContent),
    canProceed: status === "success",
  };
}

export function useResultReviewFlow(options: UseResultReviewFlowOptions = {}) {
  const {
    onTabChange,
    onRetry,
    onReviewAcknowledge,
    onProceedNext,
    onDecisionSelect,
    onActionItemSelect,
    onSegmentSelect,
    ...initialOptions
  } = options;

  const [state, dispatch] = useReducer(
    resultReviewFlowReducer,
    initialOptions,
    createInitialState
  );
  const initialOptionsRef = useRef(initialOptions);

  const viewModel = useMemo(
    () => buildResultReviewFlowViewModel(state),
    [state]
  );

  const setTab = useCallback(
    (tab: ResultReviewTabId) => {
      dispatch({ type: "SET_TAB", tab });
      onTabChange?.(tab);
    },
    [onTabChange]
  );

  const setStatus = useCallback(
    (status: ResultReviewFlowStatus, errorMessage?: string | null) => {
      dispatch({ type: "SET_STATUS", status, errorMessage });
    },
    []
  );

  const setResults = useCallback((payload: Partial<ResultReviewPayload>) => {
    dispatch({ type: "SET_RESULTS", payload });
  }, []);

  const startLoading = useCallback(() => {
    dispatch({ type: "LOADING" });
  }, []);

  const setError = useCallback((errorMessage?: string | null) => {
    dispatch({ type: "ERROR", errorMessage });
  }, []);

  const setSuccess = useCallback((payload?: Partial<ResultReviewPayload>) => {
    dispatch({ type: "SUCCESS", payload });
  }, []);

  const clearResults = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const reset = useCallback(() => {
    dispatch({
      type: "RESTORE",
      state: createInitialState(initialOptionsRef.current),
    });
  }, []);

  const retry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const reviewAcknowledge = useCallback(() => {
    onReviewAcknowledge?.();
  }, [onReviewAcknowledge]);

  const proceedNext = useCallback(() => {
    onProceedNext?.();
  }, [onProceedNext]);

  const selectDecision = useCallback(
    (decision: ResultReviewPayload["decisions"][number]) => {
      onDecisionSelect?.(decision);
    },
    [onDecisionSelect]
  );

  const selectActionItem = useCallback(
    (actionItem: ResultReviewPayload["actionItems"][number]) => {
      onActionItemSelect?.(actionItem);
    },
    [onActionItemSelect]
  );

  const selectSegment = useCallback(
    (segment: ResultReviewPayload["transcriptSegments"][number]) => {
      onSegmentSelect?.(segment);
    },
    [onSegmentSelect]
  );

  return {
    state,
    viewModel,
    setTab,
    setStatus,
    setResults,
    startLoading,
    setError,
    setSuccess,
    clearResults,
    reset,
    retry,
    reviewAcknowledge,
    proceedNext,
    selectDecision,
    selectActionItem,
    selectSegment,
  };
}

export {
  ResultReviewFlow,
  ResultReviewFlowDraftTimeline,
  ResultReviewFlowPanel,
  ResultReviewFlowReviewActions,
  ResultReviewFlowScript,
  ResultReviewFlowSummary,
  ResultReviewFlowTabs,
} from "./ResultReviewFlow.tsx";
