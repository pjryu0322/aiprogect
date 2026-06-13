import type { ResultReviewFlowViewModel } from "../../../features/result/ResultReviewFlow.types";
import type {
  ResultScreenActionItem,
  ResultScreenDecision,
  ResultScreenScriptSegment,
  ResultScreenSummary,
  ResultScreenTimelineEvent,
  ResultScreenViewModel,
} from "./ResultScreen.types";
import {
  getActionItemStatusLabel,
  getTimelineDisplayTime,
  resolveAssigneeName,
  resolveSpeakerName,
  safeArray,
  safeNumber,
  safeText,
} from "./resultScreen.utils";

function mapSummary(
  flowViewModel: ResultReviewFlowViewModel
): ResultScreenSummary | null {
  const summary = flowViewModel.summary;
  if (!summary) {
    return null;
  }

  const meetingTitle = safeText(summary.meetingTitle);
  const date = safeText(summary.date);
  const duration = safeText(summary.duration);
  const overview = safeText(summary.overview);

  if (!meetingTitle && !date && !duration && !overview) {
    return null;
  }

  return {
    meetingTitle: meetingTitle || "제목 없는 회의",
    date: date || "날짜 미정",
    duration: duration || "시간 미정",
    participantCount: safeNumber(summary.participantCount),
    overview: overview || "요약 내용이 아직 준비되지 않았습니다.",
  };
}

function mapHighlights(flowViewModel: ResultReviewFlowViewModel): string[] {
  return safeArray(flowViewModel.summary?.highlights)
    .map((highlight) => safeText(highlight))
    .filter(Boolean);
}

function mapDecisions(flowViewModel: ResultReviewFlowViewModel): ResultScreenDecision[] {
  return safeArray(flowViewModel.decisions)
    .map((decision, index) => ({
      id: safeText(decision.id, `decision-${index}`),
      summary: safeText(decision.summary),
      rationale: safeText(decision.rationale) || undefined,
    }))
    .filter((decision) => Boolean(decision.summary));
}

function mapActionItems(
  flowViewModel: ResultReviewFlowViewModel
): ResultScreenActionItem[] {
  return safeArray(flowViewModel.actionItems)
    .map((actionItem, index) => ({
      id: safeText(actionItem.id, `action-${index}`),
      task: safeText(actionItem.task),
      assigneeName: resolveAssigneeName(
        actionItem.assigneeId,
        flowViewModel.participantById
      ),
      dueDate: safeText(actionItem.dueDate, "미정"),
      status: actionItem.status ?? "pending",
      statusLabel: getActionItemStatusLabel(actionItem.status),
    }))
    .filter((actionItem) => Boolean(actionItem.task));
}

function mapScriptSegments(
  flowViewModel: ResultReviewFlowViewModel
): ResultScreenScriptSegment[] {
  return safeArray(flowViewModel.transcriptSegments)
    .map((segment, index) => ({
      id: safeText(segment.id, `segment-${index}`),
      speakerName: resolveSpeakerName(
        segment.participantId,
        flowViewModel.participantById,
        segment.speakerLabel
      ),
      startTime: safeText(segment.startTime, "00:00:00"),
      endTime: safeText(segment.endTime, "00:00:00"),
      text: safeText(segment.text),
    }))
    .filter((segment) => Boolean(segment.text));
}

function mapTimelineEvents(
  flowViewModel: ResultReviewFlowViewModel
): ResultScreenTimelineEvent[] {
  return safeArray(flowViewModel.draftTimeline)
    .map((event, index) => ({
      id: safeText(event.id, `timeline-${index}`),
      label: safeText(event.label, "단계"),
      time: safeText(event.time),
      status: event.status ?? "pending",
      displayTime: getTimelineDisplayTime(event.status ?? "pending", event.time),
    }))
    .filter((event) => Boolean(event.label));
}

export function buildResultScreenViewModel(
  flowViewModel: ResultReviewFlowViewModel
): ResultScreenViewModel {
  const summary = mapSummary(flowViewModel);
  const highlights = mapHighlights(flowViewModel);
  const decisions = mapDecisions(flowViewModel);
  const actionItems = mapActionItems(flowViewModel);
  const scriptSegments = mapScriptSegments(flowViewModel);
  const timelineEvents = mapTimelineEvents(flowViewModel);

  const hasSummaryContent =
    summary !== null || highlights.length > 0 || decisions.length > 0 || actionItems.length > 0;
  const hasScriptContent = scriptSegments.length > 0;

  return {
    status: flowViewModel.status,
    activeTab: flowViewModel.activeTab,
    errorMessage: safeText(flowViewModel.errorMessage) || null,
    summary,
    highlights,
    decisions,
    actionItems,
    scriptSegments,
    timelineEvents,
    isEmpty: flowViewModel.isEmpty,
    isLoading: flowViewModel.isLoading,
    hasError: flowViewModel.hasError,
    isSuccess: flowViewModel.isSuccess,
    canReview: flowViewModel.canReview,
    canProceed: flowViewModel.canProceed,
    hasSummaryContent,
    hasScriptContent,
  };
}
