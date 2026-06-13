import { useMemo } from "react";
import {
  sampleActionItems,
  sampleDecisions,
  sampleDraftTimeline,
  sampleMeetingSummary,
  sampleParticipants,
  sampleTranscriptSegments,
} from "../data/sampleData";
import { useResultReviewFlow } from "../features/result/ResultReviewFlow";
import type { ResultReviewPayload } from "../features/result/ResultReviewFlow.types";
import {
  ResultScreen,
  buildResultScreenViewModel,
} from "../components/screens/result/ResultScreen";
import type { ResultScreenContainerProps } from "../components/screens/result/ResultScreen.types";

function resolveInitialResults(
  useSampleData: boolean | undefined,
  initialResults: Partial<ResultReviewPayload> | undefined
): Partial<ResultReviewPayload> | undefined {
  if (initialResults) {
    return initialResults;
  }

  if (!useSampleData) {
    return undefined;
  }

  return {
    summary: sampleMeetingSummary,
    decisions: sampleDecisions,
    actionItems: sampleActionItems,
    transcriptSegments: sampleTranscriptSegments,
    participants: sampleParticipants,
    draftTimeline: sampleDraftTimeline,
  };
}

export function ResultScreenContainer({
  initialTab,
  initialStatus,
  initialErrorMessage,
  initialResults,
  useSampleData = false,
  mobileActive = false,
  disabled = false,
  retrying = false,
  className,
  onTabChange,
  onRetry,
  onReviewAcknowledge,
  onProceedNext,
  onDecisionSelect,
  onActionItemSelect,
  onSegmentSelect,
}: ResultScreenContainerProps) {
  const resolvedInitialResults = resolveInitialResults(useSampleData, initialResults);
  const resolvedInitialStatus =
    initialStatus ?? (useSampleData || resolvedInitialResults ? "success" : "empty");

  const flow = useResultReviewFlow({
    initialTab,
    initialStatus: resolvedInitialStatus,
    initialErrorMessage,
    initialResults: resolvedInitialResults,
    onTabChange,
    onRetry,
    onReviewAcknowledge,
    onProceedNext,
  });

  const viewModel = useMemo(
    () => buildResultScreenViewModel(flow.viewModel),
    [flow.viewModel]
  );

  return (
    <ResultScreen
      viewModel={viewModel}
      onTabChange={flow.setTab}
      onRetry={flow.retry}
      onReviewAcknowledge={flow.reviewAcknowledge}
      onProceedNext={flow.proceedNext}
      onDecisionSelect={onDecisionSelect}
      onActionItemSelect={onActionItemSelect}
      onSegmentSelect={onSegmentSelect}
      mobileActive={mobileActive}
      disabled={disabled}
      retrying={retrying}
      className={className}
    />
  );
}

export type { ResultScreenContainerProps } from "../components/screens/result/ResultScreen.types";

export {
  ResultScreen,
  ActionItemsCard,
  DecisionsCard,
  DraftTimelineBlock,
  HighlightsCard,
  ResultReviewActionsBar,
  ResultTabsBar,
  ScriptTabContent,
  SummaryOverviewBlock,
  SummaryTabContent,
  buildResultScreenViewModel,
} from "../components/screens/result/ResultScreen";

export type {
  DraftTimelineBlockProps,
  ResultReviewActionsBarProps,
  ResultScreenCallbacks,
  ResultScreenDecision,
  ResultScreenActionItem,
  ResultScreenProps,
  ResultScreenScriptSegment,
  ResultScreenStatus,
  ResultScreenSummary,
  ResultScreenTabId,
  ResultScreenTimelineEvent,
  ResultScreenViewModel,
  ScriptTabContentProps,
  SummaryTabContentProps,
  ResultTabsBarProps,
} from "../components/screens/result/ResultScreen.types";
