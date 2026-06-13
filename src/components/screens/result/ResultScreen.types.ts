import type { ResultTabId } from "../../WorkspaceShell.types";
import type { ActionItemStatus, DraftTimelineStatus } from "../../../types/meeting";
import type {
  ResultReviewFlowStatus,
  ResultReviewPayload,
} from "../../../features/result/ResultReviewFlow.types";

export type ResultScreenStatus = ResultReviewFlowStatus;

export type ResultScreenTabId = ResultTabId;

export interface ResultScreenSummary {
  meetingTitle: string;
  date: string;
  duration: string;
  participantCount: number;
  overview: string;
}

export interface ResultScreenDecision {
  id: string;
  summary: string;
  rationale?: string;
}

export interface ResultScreenActionItem {
  id: string;
  task: string;
  assigneeName: string;
  dueDate: string;
  status: ActionItemStatus;
  statusLabel: string;
}

export interface ResultScreenScriptSegment {
  id: string;
  speakerName: string;
  startTime: string;
  endTime: string;
  text: string;
}

export interface ResultScreenTimelineEvent {
  id: string;
  label: string;
  time: string;
  status: DraftTimelineStatus;
  displayTime: string;
}

export interface ResultScreenViewModel {
  status: ResultScreenStatus;
  activeTab: ResultScreenTabId;
  errorMessage: string | null;
  summary: ResultScreenSummary | null;
  highlights: string[];
  decisions: ResultScreenDecision[];
  actionItems: ResultScreenActionItem[];
  scriptSegments: ResultScreenScriptSegment[];
  timelineEvents: ResultScreenTimelineEvent[];
  isEmpty: boolean;
  isLoading: boolean;
  hasError: boolean;
  isSuccess: boolean;
  canReview: boolean;
  canProceed: boolean;
  hasSummaryContent: boolean;
  hasScriptContent: boolean;
}

export interface ResultTabsBarProps {
  activeTab: ResultScreenTabId;
  onTabChange: (tab: ResultScreenTabId) => void;
  disabled?: boolean;
  tabPanelId?: string;
  className?: string;
}

export interface SummaryTabContentProps {
  status: ResultScreenStatus;
  summary: ResultScreenSummary | null;
  highlights: string[];
  decisions: ResultScreenDecision[];
  actionItems: ResultScreenActionItem[];
  errorMessage?: string | null;
  onRetry?: () => void;
  onDecisionSelect?: (decision: ResultScreenDecision) => void;
  onActionItemSelect?: (actionItem: ResultScreenActionItem) => void;
  retrying?: boolean;
  className?: string;
}

export interface ScriptTabContentProps {
  status: ResultScreenStatus;
  scriptSegments: ResultScreenScriptSegment[];
  errorMessage?: string | null;
  onRetry?: () => void;
  onSegmentSelect?: (segment: ResultScreenScriptSegment) => void;
  retrying?: boolean;
  className?: string;
}

export interface DraftTimelineBlockProps {
  status: ResultScreenStatus;
  events: ResultScreenTimelineEvent[];
  errorMessage?: string | null;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export interface ResultReviewActionsBarProps {
  viewModel: ResultScreenViewModel;
  onReviewAcknowledge?: () => void;
  onProceedNext?: () => void;
  onRetry?: () => void;
  retrying?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ResultScreenCallbacks {
  onTabChange?: (tab: ResultScreenTabId) => void;
  onRetry?: () => void;
  onReviewAcknowledge?: () => void;
  onProceedNext?: () => void;
  onDecisionSelect?: (decision: ResultScreenDecision) => void;
  onActionItemSelect?: (actionItem: ResultScreenActionItem) => void;
  onSegmentSelect?: (segment: ResultScreenScriptSegment) => void;
}

export interface ResultScreenProps extends ResultScreenCallbacks {
  viewModel: ResultScreenViewModel;
  mobileActive?: boolean;
  disabled?: boolean;
  retrying?: boolean;
  className?: string;
}

export interface ResultScreenContainerProps extends ResultScreenCallbacks {
  initialTab?: ResultScreenTabId;
  initialStatus?: ResultReviewFlowStatus;
  initialErrorMessage?: string | null;
  initialResults?: Partial<ResultReviewPayload>;
  useSampleData?: boolean;
  mobileActive?: boolean;
  disabled?: boolean;
  retrying?: boolean;
  className?: string;
}
