import type { ReactNode } from "react";
import type { ResultTabId } from "../../components/WorkspaceShell.types";
import type {
  DraftTimelineEvent,
  MeetingActionItem,
  MeetingDecision,
  MeetingSummary,
  Participant,
  TranscriptSegment,
} from "../../types/meeting";

export type ResultReviewFlowStatus = "empty" | "loading" | "error" | "success";

export type ResultReviewTabId = ResultTabId;

export interface ResultReviewPayload {
  summary: MeetingSummary | null;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  transcriptSegments: TranscriptSegment[];
  participants: Participant[];
  draftTimeline: DraftTimelineEvent[];
}

export interface ResultReviewFlowState {
  status: ResultReviewFlowStatus;
  activeTab: ResultReviewTabId;
  errorMessage: string | null;
  summary: MeetingSummary | null;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  transcriptSegments: TranscriptSegment[];
  participants: Participant[];
  draftTimeline: DraftTimelineEvent[];
}

export interface ResultReviewFlowCallbacks {
  onTabChange?: (tab: ResultReviewTabId) => void;
  onRetry?: () => void;
  onReviewAcknowledge?: () => void;
  onProceedNext?: () => void;
  onDecisionSelect?: (decision: MeetingDecision) => void;
  onActionItemSelect?: (actionItem: MeetingActionItem) => void;
  onSegmentSelect?: (segment: TranscriptSegment) => void;
}

export interface UseResultReviewFlowOptions extends ResultReviewFlowCallbacks {
  initialTab?: ResultReviewTabId;
  initialStatus?: ResultReviewFlowStatus;
  initialErrorMessage?: string | null;
  initialResults?: Partial<ResultReviewPayload>;
}

export interface ResultReviewFlowViewModel {
  status: ResultReviewFlowStatus;
  activeTab: ResultReviewTabId;
  isEmpty: boolean;
  isLoading: boolean;
  hasError: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  summary: MeetingSummary | null;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  transcriptSegments: TranscriptSegment[];
  participants: Participant[];
  participantById: Record<string, Participant>;
  draftTimeline: DraftTimelineEvent[];
  hasSummaryContent: boolean;
  hasScriptContent: boolean;
  canReview: boolean;
  canProceed: boolean;
}

export interface ResultReviewFlowPanelProps {
  mobileActive?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface ResultReviewFlowTabsProps {
  activeTab: ResultReviewTabId;
  onTabChange: (tab: ResultReviewTabId) => void;
  disabled?: boolean;
  className?: string;
}

export interface ResultReviewFlowSummaryProps {
  status: ResultReviewFlowStatus;
  summary: MeetingSummary | null;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  participantById: Record<string, Participant>;
  errorMessage?: string | null;
  onRetry?: () => void;
  onDecisionSelect?: (decision: MeetingDecision) => void;
  onActionItemSelect?: (actionItem: MeetingActionItem) => void;
  className?: string;
}

export interface ResultReviewFlowScriptProps {
  status: ResultReviewFlowStatus;
  transcriptSegments: TranscriptSegment[];
  participantById: Record<string, Participant>;
  errorMessage?: string | null;
  onRetry?: () => void;
  onSegmentSelect?: (segment: TranscriptSegment) => void;
  className?: string;
}

export interface ResultReviewFlowDraftTimelineProps {
  status: ResultReviewFlowStatus;
  events: DraftTimelineEvent[];
  className?: string;
}

export interface ResultReviewFlowReviewActionsProps {
  viewModel: ResultReviewFlowViewModel;
  onReviewAcknowledge?: () => void;
  onProceedNext?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface ResultReviewFlowProps {
  viewModel: ResultReviewFlowViewModel;
  onTabChange: (tab: ResultReviewTabId) => void;
  onRetry?: () => void;
  onReviewAcknowledge?: () => void;
  onProceedNext?: () => void;
  onDecisionSelect?: (decision: MeetingDecision) => void;
  onActionItemSelect?: (actionItem: MeetingActionItem) => void;
  onSegmentSelect?: (segment: TranscriptSegment) => void;
  mobileActive?: boolean;
  disabled?: boolean;
}
