import { Spinner } from "./LoadingState";
import { RetryButton } from "./RetryButton";
import "./DraftSaveStatus.css";

export type DraftSaveStatusState = "draft" | "saving" | "saved" | "error";

export type DraftSaveStatusVariant = "workspace" | "result" | "action" | "inline" | "chip";

const DEFAULT_MESSAGES: Record<DraftSaveStatusState, string> = {
  draft: "입력 중인 내용이 아직 저장되지 않았습니다",
  saving: "임시 저장 중...",
  saved: "임시 저장됨",
  error: "임시 저장에 실패했습니다",
};

function formatSavedAt(savedAt?: string | Date): string | null {
  if (!savedAt) {
    return null;
  }

  const date = savedAt instanceof Date ? savedAt : new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DraftIcon() {
  return (
    <span className="draft-save-status__icon" aria-hidden="true">
      <svg
        className="draft-save-status__icon-svg"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 4.5A1.5 1.5 0 0 1 6.5 3h5.879a1.5 1.5 0 0 1 1.06.439l2.122 2.122A1.5 1.5 0 0 1 16 6.621V15.5A1.5 1.5 0 0 1 14.5 17h-8A1.5 1.5 0 0 1 5 15.5v-11Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 3.5v3.25A.75.75 0 0 0 8.75 7.5h5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function SavedIcon() {
  return (
    <span className="draft-save-status__icon" aria-hidden="true">
      <svg
        className="draft-save-status__icon-svg"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="m6.5 10.25 2.25 2.25 4.75-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ErrorIcon() {
  return (
    <span className="draft-save-status__icon" aria-hidden="true">
      <svg
        className="draft-save-status__icon-svg"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="14" r="0.75" fill="currentColor" />
      </svg>
    </span>
  );
}

export interface DraftSaveStatusProps {
  status: DraftSaveStatusState;
  message?: string;
  description?: string;
  savedAt?: string | Date;
  variant?: DraftSaveStatusVariant;
  onSave?: () => void;
  onRetry?: () => void;
  onDiscard?: () => void;
  retrying?: boolean;
  saveLabel?: string;
  retryLabel?: string;
  discardLabel?: string;
  className?: string;
}

export function DraftSaveStatus({
  status,
  message,
  description,
  savedAt,
  variant = "workspace",
  onSave,
  onRetry,
  onDiscard,
  retrying = false,
  saveLabel = "임시 저장",
  retryLabel = "다시 저장",
  discardLabel = "임시 저장 삭제",
  className,
}: DraftSaveStatusProps) {
  const statusMessage = message ?? DEFAULT_MESSAGES[status];
  const savedAtLabel = status === "saved" ? formatSavedAt(savedAt) : null;

  const rootClass = [
    "draft-save-status",
    `draft-save-status--${status}`,
    `draft-save-status--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const statusIcon =
    status === "saving" ? (
      <Spinner size="sm" label={statusMessage} />
    ) : status === "saved" ? (
      <SavedIcon />
    ) : status === "error" ? (
      <ErrorIcon />
    ) : (
      <DraftIcon />
    );

  const actionButtons =
    variant === "action" ? (
      <div className="draft-save-status__actions">
        {status === "draft" && onSave ? (
          <button
            type="button"
            className="draft-save-status__btn draft-save-status__btn--primary"
            onClick={onSave}
          >
            {saveLabel}
          </button>
        ) : null}
        {status === "saving" ? (
          <button
            type="button"
            className="draft-save-status__btn draft-save-status__btn--primary"
            disabled
            aria-busy="true"
          >
            <Spinner size="sm" className="draft-save-status__btn-spinner" />
            <span>{saveLabel}</span>
          </button>
        ) : null}
        {status === "saved" && onDiscard ? (
          <button
            type="button"
            className="draft-save-status__btn draft-save-status__btn--secondary"
            onClick={onDiscard}
          >
            {discardLabel}
          </button>
        ) : null}
        {status === "error" && onRetry ? (
          <RetryButton
            onRetry={onRetry}
            retrying={retrying}
            label={retryLabel}
            size="sm"
            variant="primary"
          />
        ) : null}
      </div>
    ) : null;

  const descriptionNode = description ? (
    <p className="draft-save-status__description">{description}</p>
  ) : null;

  const savedAtNode = savedAtLabel ? (
    <span className="draft-save-status__saved-at">{savedAtLabel} 저장</span>
  ) : null;

  if (variant === "chip") {
    return (
      <span
        className={rootClass}
        role="status"
        aria-live="polite"
        aria-busy={status === "saving" || undefined}
      >
        {statusIcon}
        <span className="draft-save-status__text">{statusMessage}</span>
        {savedAtNode}
        {actionButtons}
      </span>
    );
  }

  if (variant === "action") {
    return (
      <div
        className={rootClass}
        role="status"
        aria-live="polite"
        aria-busy={status === "saving" || undefined}
      >
        <div className="draft-save-status__action-summary">
          {statusIcon}
          <div className="draft-save-status__content">
            <span className="draft-save-status__text">{statusMessage}</span>
            {savedAtNode}
            {descriptionNode}
          </div>
        </div>
        {actionButtons}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={rootClass}
        role="status"
        aria-live="polite"
        aria-busy={status === "saving" || undefined}
      >
        {statusIcon}
        <div className="draft-save-status__content">
          <span className="draft-save-status__text">{statusMessage}</span>
          {savedAtNode}
          {descriptionNode}
        </div>
        {actionButtons}
      </div>
    );
  }

  if (variant === "result") {
    return (
      <div
        className={rootClass}
        role="status"
        aria-live="polite"
        aria-busy={status === "saving" || undefined}
      >
        {statusIcon}
        <div className="draft-save-status__content">
          <p className="draft-save-status__message">{statusMessage}</p>
          {savedAtNode}
          {descriptionNode}
        </div>
        {actionButtons}
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      role="status"
      aria-live="polite"
      aria-busy={status === "saving" || undefined}
    >
      {statusIcon}
      <div className="draft-save-status__content">
        <p className="draft-save-status__message">{statusMessage}</p>
        {savedAtNode}
        {descriptionNode}
      </div>
      {actionButtons}
    </div>
  );
}
