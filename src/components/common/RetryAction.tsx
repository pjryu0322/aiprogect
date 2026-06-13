import type { ReactNode } from "react";
import { RetryButton } from "./RetryButton";
import "./RetryAction.css";

export type RetryActionVariant = "panel" | "inline" | "chip" | "timeline";

const DEFAULT_FAILURE_MESSAGE = "작업에 실패했습니다";

export interface RetryActionProps {
  failed: boolean;
  message?: string;
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
  loading?: boolean;
  retryLabel?: string;
  retryingLabel?: string;
  variant?: RetryActionVariant;
  children?: ReactNode;
  className?: string;
}

function FailureIcon() {
  return (
    <span className="retry-action__icon" aria-hidden="true">
      <svg
        className="retry-action__icon-svg"
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

export function RetryAction({
  failed,
  message,
  description,
  onRetry,
  retrying = false,
  loading = false,
  retryLabel,
  retryingLabel,
  variant = "panel",
  children,
  className,
}: RetryActionProps) {
  if (!failed) {
    return children ? <>{children}</> : null;
  }

  const failureMessage = message ?? DEFAULT_FAILURE_MESSAGE;
  const isBusy = retrying || loading;

  const rootClass = [
    "retry-action",
    `retry-action--${variant}`,
    isBusy ? "retry-action--retrying" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const retryButton = (
    <RetryButton
      onRetry={onRetry}
      retrying={retrying}
      loading={loading}
      label={retryLabel}
      retryingLabel={retryingLabel}
      size={variant === "chip" ? "sm" : "md"}
    />
  );

  if (variant === "chip") {
    return (
      <span className={rootClass} role="alert" aria-live="assertive">
        <FailureIcon />
        <span className="retry-action__text">{failureMessage}</span>
        {retryButton}
      </span>
    );
  }

  if (variant === "timeline") {
    return (
      <div className={rootClass} role="alert" aria-live="assertive">
        <span className="retry-action__timeline-dot" aria-hidden="true" />
        <div className="retry-action__timeline-content">
          <div className="retry-action__text">{failureMessage}</div>
          {description ? (
            <div className="retry-action__description">{description}</div>
          ) : null}
          {retryButton}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={rootClass} role="alert" aria-live="assertive">
        <FailureIcon />
        <div className="retry-action__content">
          <span className="retry-action__text">{failureMessage}</span>
          {description ? (
            <span className="retry-action__description">{description}</span>
          ) : null}
        </div>
        {retryButton}
      </div>
    );
  }

  return (
    <div className={rootClass} role="alert" aria-live="assertive">
      <FailureIcon />
      <p className="retry-action__message">{failureMessage}</p>
      {description ? (
        <p className="retry-action__description">{description}</p>
      ) : null}
      {retryButton}
    </div>
  );
}
