import type { AnalysisJobCardProps, AdminJobResultStatus } from "./AdminScreen.types";
import {
  canChangeAdminJobStatus,
  canConfirmAdminJob,
  canRetryAdminJob,
  formatAdminUpdatedAt,
  getAdminJobResultStatusChipClass,
  getAdminJobResultStatusLabel,
  getAdminJobStageChipClass,
  getAdminJobStageLabel,
} from "./adminScreen.utils";
import "./adminScreen.css";

const STATUS_OPTIONS: AdminJobResultStatus[] = [
  "pending",
  "processing",
  "completed",
  "failed",
  "needs_review",
];

export function AnalysisJobCard({
  job,
  selected = false,
  disabled = false,
  onSelect,
  onRetry,
  onConfirm,
  onStatusChange,
  className,
}: AnalysisJobCardProps) {
  const rootClass = [
    "admin-screen-job-card",
    selected ? " admin-screen-job-card--selected" : "",
    disabled ? " admin-screen-job-card--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showRetry = canRetryAdminJob(job) && onRetry;
  const showConfirm = canConfirmAdminJob(job) && onConfirm;
  const showStatusChange = canChangeAdminJobStatus(job) && onStatusChange;

  return (
    <article
      className={rootClass}
      aria-current={selected ? "true" : undefined}
      aria-labelledby={`admin-job-${job.id}-title`}
    >
      <button
        type="button"
        className="admin-screen-job-card__select"
        onClick={() => onSelect?.(job.id)}
        disabled={disabled || !onSelect}
      >
        <div className="admin-screen-job-card__header">
          <div className="admin-screen-job-card__title-row">
            <h3 id={`admin-job-${job.id}-title`} className="admin-screen-job-card__title">
              {job.meetingTitle}
            </h3>
            <span className={getAdminJobResultStatusChipClass(job.resultStatus)}>
              {getAdminJobResultStatusLabel(job.resultStatus)}
            </span>
          </div>
          <p className="admin-screen-job-card__file">{job.fileName}</p>
        </div>

        <div className="admin-screen-job-card__meta">
          <span className={getAdminJobStageChipClass(job.stage)}>
            {getAdminJobStageLabel(job.stage)}
          </span>
          <span className="admin-screen-job-card__updated">
            갱신 {formatAdminUpdatedAt(job.updatedAt)}
          </span>
        </div>

        {typeof job.progress === "number" && job.resultStatus === "processing" ? (
          <div
            className="admin-screen-job-card__progress"
            role="progressbar"
            aria-valuenow={job.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${job.meetingTitle} 진행률`}
          >
            <div
              className="admin-screen-job-card__progress-bar"
              style={{ width: `${job.progress}%` }}
            />
            <span className="admin-screen-job-card__progress-label">{job.progress}%</span>
          </div>
        ) : null}

        {job.errorMessage ? (
          <p className="admin-screen-job-card__error" role="alert">
            {job.errorMessage}
          </p>
        ) : null}
      </button>

      <div className="admin-screen-job-card__actions">
        {showRetry ? (
          <button
            type="button"
            className="admin-screen-action-btn admin-screen-action-btn--secondary"
            onClick={() => onRetry(job.id)}
            disabled={disabled}
          >
            재처리
          </button>
        ) : null}

        {showConfirm ? (
          <button
            type="button"
            className="admin-screen-action-btn admin-screen-action-btn--primary"
            onClick={() => onConfirm(job.id)}
            disabled={disabled}
          >
            확인
          </button>
        ) : null}

        {showStatusChange ? (
          <label className="admin-screen-status-select">
            <span className="sr-only">{job.meetingTitle} 상태 변경</span>
            <select
              className="admin-screen-status-select__control"
              value={job.resultStatus}
              disabled={disabled}
              onChange={(event) =>
                onStatusChange(job.id, event.target.value as AdminJobResultStatus)
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getAdminJobResultStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </article>
  );
}
