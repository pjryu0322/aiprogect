import "./ErrorMessage.css";

export type ErrorMessageVariant = "panel" | "inline" | "chip" | "timeline";

export interface ErrorMessageProps {
  message: string;
  description?: string;
  variant?: ErrorMessageVariant;
  retrying?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

function ErrorIcon() {
  return (
    <span className="error-message__icon" aria-hidden="true">
      <svg
        className="error-message__icon-svg"
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

export function ErrorMessage({
  message,
  description,
  variant = "panel",
  retrying = false,
  onRetry,
  retryLabel = "다시 시도",
  className,
}: ErrorMessageProps) {
  const rootClass = [
    "error-message",
    `error-message--${variant}`,
    retrying ? "error-message--retrying" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showRetry = Boolean(onRetry);

  const retryButton = showRetry ? (
    <button
      type="button"
      className="error-message__retry-btn"
      onClick={onRetry}
      disabled={retrying}
      aria-busy={retrying || undefined}
    >
      {retrying ? "재시도 중..." : retryLabel}
    </button>
  ) : null;

  if (variant === "chip") {
    return (
      <span className={rootClass} role="alert" aria-live="assertive">
        <ErrorIcon />
        <span className="error-message__text">{message}</span>
        {retryButton}
      </span>
    );
  }

  if (variant === "timeline") {
    return (
      <div className={rootClass} role="alert" aria-live="assertive">
        <span className="error-message__timeline-dot" aria-hidden="true" />
        <div className="error-message__timeline-content">
          <div className="error-message__text">{message}</div>
          {description ? (
            <div className="error-message__description">{description}</div>
          ) : null}
          {retryButton}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={rootClass} role="alert" aria-live="assertive">
        <ErrorIcon />
        <div className="error-message__content">
          <span className="error-message__text">{message}</span>
          {description ? (
            <span className="error-message__description">{description}</span>
          ) : null}
        </div>
        {retryButton}
      </div>
    );
  }

  return (
    <div className={rootClass} role="alert" aria-live="assertive">
      <ErrorIcon />
      <p className="error-message__message">{message}</p>
      {description ? (
        <p className="error-message__description">{description}</p>
      ) : null}
      {retryButton}
    </div>
  );
}
