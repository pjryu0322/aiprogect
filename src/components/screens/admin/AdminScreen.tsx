import { AnalysisJobList } from "./AnalysisJobList";
import type { AdminScreenProps } from "./AdminScreen.types";
import { ProcessingStatusSummary } from "./ProcessingStatusSummary";
import "./adminScreen.css";

export function AdminScreenJobsSection({
  viewModel,
  onJobSelect,
  onRetryJob,
  onConfirmJob,
  onStatusChange,
  onRefresh,
  disabled,
}: Pick<
  AdminScreenProps,
  | "viewModel"
  | "onJobSelect"
  | "onRetryJob"
  | "onConfirmJob"
  | "onStatusChange"
  | "onRefresh"
  | "disabled"
>) {
  return (
    <AnalysisJobList
      jobs={viewModel.jobs}
      selectedJobId={viewModel.selectedJobId}
      status={viewModel.status}
      disabled={disabled || viewModel.isRefreshing}
      onJobSelect={onJobSelect}
      onRetryJob={onRetryJob}
      onConfirmJob={onConfirmJob}
      onStatusChange={onStatusChange}
      onRefresh={onRefresh}
    />
  );
}

export function AdminScreenSummarySection({
  viewModel,
}: Pick<AdminScreenProps, "viewModel">) {
  return (
    <ProcessingStatusSummary summary={viewModel.summary} status={viewModel.status} />
  );
}

export function AdminScreen({
  viewModel,
  onRefresh,
  onJobSelect,
  onRetryJob,
  onConfirmJob,
  onStatusChange,
  disabled = false,
  className,
}: AdminScreenProps) {
  const rootClass = ["admin-screen", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="admin-screen-layout">
        <aside className="admin-screen-layout__summary" aria-label="분석 작업 요약">
          <AdminScreenSummarySection viewModel={viewModel} />
        </aside>

        <section className="admin-screen-layout__main" aria-label="분석 작업 관리">
          <AdminScreenJobsSection
            viewModel={viewModel}
            onJobSelect={onJobSelect}
            onRetryJob={onRetryJob}
            onConfirmJob={onConfirmJob}
            onStatusChange={onStatusChange}
            onRefresh={onRefresh}
            disabled={disabled}
          />
        </section>
      </div>
    </div>
  );
}

export type {
  AdminAnalysisJob,
  AdminJobResultStatus,
  AdminJobStage,
  AdminScreenCallbacks,
  AdminScreenContainerProps,
  AdminScreenProps,
  AdminScreenStatus,
  AdminScreenViewModel,
  AdminStatusSummary,
  AnalysisJobCardProps,
  AnalysisJobListProps,
  ProcessingStatusSummaryProps,
} from "./AdminScreen.types";

export { AnalysisJobCard, AnalysisJobList, ProcessingStatusSummary };

export {
  buildAdminStatusSummary,
  canChangeAdminJobStatus,
  canConfirmAdminJob,
  canRetryAdminJob,
  formatAdminUpdatedAt,
  getAdminJobResultStatusChipClass,
  getAdminJobResultStatusLabel,
  getAdminJobStageChipClass,
  getAdminJobStageLabel,
  getAdminScreenDescription,
  getAdminScreenHeadline,
} from "./adminScreen.utils";

export { buildAdminScreenViewModel } from "./buildAdminScreenViewModel";
