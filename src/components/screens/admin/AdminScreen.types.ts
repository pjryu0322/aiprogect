import type { ConversionStepId } from "../../WorkspaceShell.types";

export type AdminScreenStatus = "idle" | "loading";

export type AdminJobResultStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "needs_review";

export type AdminJobStage = ConversionStepId | "done";

export interface AdminAnalysisJob {
  id: string;
  meetingTitle: string;
  fileName: string;
  stage: AdminJobStage;
  resultStatus: AdminJobResultStatus;
  updatedAt: string;
  progress?: number | null;
  errorMessage?: string;
}

export interface AdminStatusSummary {
  total: number;
  processing: number;
  completed: number;
  failed: number;
  needsReview: number;
}

export interface AdminScreenViewModel {
  status: AdminScreenStatus;
  jobs: AdminAnalysisJob[];
  summary: AdminStatusSummary;
  selectedJobId: string | null;
  isRefreshing: boolean;
}

export interface ProcessingStatusSummaryProps {
  summary: AdminStatusSummary;
  status: AdminScreenStatus;
  className?: string;
}

export interface AnalysisJobCardProps {
  job: AdminAnalysisJob;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onConfirm?: (jobId: string) => void;
  onStatusChange?: (jobId: string, status: AdminJobResultStatus) => void;
  className?: string;
}

export interface AnalysisJobListProps {
  jobs: AdminAnalysisJob[];
  selectedJobId?: string | null;
  status: AdminScreenStatus;
  disabled?: boolean;
  onJobSelect?: (jobId: string) => void;
  onRetryJob?: (jobId: string) => void;
  onConfirmJob?: (jobId: string) => void;
  onStatusChange?: (jobId: string, status: AdminJobResultStatus) => void;
  onRefresh?: () => void;
  className?: string;
}

export interface AdminScreenCallbacks {
  onRefresh?: () => void;
  onJobSelect?: (jobId: string) => void;
  onRetryJob?: (jobId: string) => void;
  onConfirmJob?: (jobId: string) => void;
  onStatusChange?: (jobId: string, status: AdminJobResultStatus) => void;
}

export interface AdminScreenProps extends AdminScreenCallbacks {
  viewModel: AdminScreenViewModel;
  disabled?: boolean;
  className?: string;
}

export interface AdminScreenContainerProps extends AdminScreenCallbacks {
  initialJobs?: AdminAnalysisJob[];
  simulateRefresh?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface BuildAdminScreenViewModelOptions {
  status?: AdminScreenStatus;
  selectedJobId?: string | null;
  isRefreshing?: boolean;
}
