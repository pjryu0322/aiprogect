import { EmptyState } from "../../common/EmptyState";
import { LoadingState } from "../../common/LoadingState";
import { AnalysisJobCard } from "./AnalysisJobCard";
import type { AnalysisJobListProps } from "./AdminScreen.types";
import "./adminScreen.css";

export function AnalysisJobList({
  jobs,
  selectedJobId = null,
  status,
  disabled = false,
  onJobSelect,
  onRetryJob,
  onConfirmJob,
  onStatusChange,
  onRefresh,
  className,
}: AnalysisJobListProps) {
  const rootClass = ["admin-screen-job-list", className].filter(Boolean).join(" ");
  const isLoading = status === "loading";

  return (
    <section className={rootClass} aria-labelledby="admin-screen-job-list-heading">
      <header className="admin-screen-job-list__header">
        <div>
          <h3 id="admin-screen-job-list-heading" className="admin-screen-job-list__title">
            분석 작업 목록
          </h3>
          <p className="admin-screen-job-list__subtitle">
            회의 분석 결과와 처리 상태를 확인하고 재처리·확인·상태 변경을 수행합니다
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            className="admin-screen-action-btn admin-screen-action-btn--ghost"
            onClick={onRefresh}
            disabled={disabled || isLoading}
          >
            새로고침
          </button>
        ) : null}
      </header>

      <LoadingState
        loading={isLoading}
        message="분석 작업 목록을 불러오는 중입니다"
        label="분석 작업 목록 로딩 중"
        variant="panel"
        size="md"
      >
        <EmptyState
          isEmpty={jobs.length === 0}
          title="표시할 분석 작업이 없습니다"
          description="회의 녹취 분석이 등록되면 이 목록에서 진행 상태와 결과를 관리할 수 있습니다."
          action={
            onRefresh
              ? {
                  label: "목록 새로고침",
                  onClick: onRefresh,
                }
              : undefined
          }
          variant="panel"
        >
          <ul className="admin-screen-job-list__items">
            {jobs.map((job) => (
              <li key={job.id} className="admin-screen-job-list__item">
                <AnalysisJobCard
                  job={job}
                  selected={selectedJobId === job.id}
                  disabled={disabled}
                  onSelect={onJobSelect}
                  onRetry={onRetryJob}
                  onConfirm={onConfirmJob}
                  onStatusChange={onStatusChange}
                />
              </li>
            ))}
          </ul>
        </EmptyState>
      </LoadingState>
    </section>
  );
}
