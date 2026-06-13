import { RetryButton } from "./RetryButton";
import "./ErrorMessage.css";

export type ErrorMessageVariant = "panel" | "inline" | "chip" | "timeline";

export const ERROR_SCENARIOS = {
  upload_failed: {
    message: "파일 업로드에 실패했습니다",
    description: "네트워크 연결을 확인한 뒤 다시 업로드해 주세요.",
  },
  conversion_failed: {
    message: "변환에 실패했습니다",
    description: "파일 형식이나 용량을 확인한 뒤 다시 시도해 주세요.",
  },
  data_fetch_failed: {
    message: "데이터를 불러오지 못했습니다",
    description: "잠시 후 다시 시도하거나 페이지를 새로고침해 주세요.",
  },
} as const;

export type ErrorScenario = keyof typeof ERROR_SCENARIOS;

const DEFAULT_ERROR_MESSAGE = "오류가 발생했습니다";

export interface ErrorMessageProps {
  message?: string;
  description?: string;
  scenario?: ErrorScenario;
  variant?: ErrorMessageVariant;
  retrying?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  retryingLabel?: string;
  className?: string;
}

function resolveErrorContent(
  scenario?: ErrorScenario,
  message?: string,
  description?: string,
): { message: string; description?: string } {
  if (message) {
    return { message, description };
  }

  if (scenario) {
    const preset = ERROR_SCENARIOS[scenario];
    return {
      message: preset.message,
      description: description ?? preset.description,
    };
  }

  return { message: DEFAULT_ERROR_MESSAGE, description };
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
  scenario,
  variant = "panel",
  retrying = false,
  loading = false,
  onRetry,
  retryLabel = "다시 시도",
  retryingLabel = "재시도 중...",
  className,
}: ErrorMessageProps) {
  const resolved = resolveErrorContent(scenario, message, description);

  const rootClass = [
    "error-message",
    `error-message--${variant}`,
    retrying || loading ? "error-message--retrying" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showRetry = Boolean(onRetry);

  const retryButton = showRetry ? (
    <RetryButton
      onRetry={onRetry!}
      retrying={retrying}
      loading={loading}
      label={retryLabel}
      retryingLabel={retryingLabel}
      size={variant === "chip" ? "sm" : "md"}
      className="error-message__retry-btn"
    />
  ) : null;

  if (variant === "chip") {
    return (
      <span className={rootClass} role="alert" aria-live="assertive">
        <ErrorIcon />
        <span className="error-message__text">{resolved.message}</span>
        {retryButton}
      </span>
    );
  }

  if (variant === "timeline") {
    return (
      <div className={rootClass} role="alert" aria-live="assertive">
        <span className="error-message__timeline-dot" aria-hidden="true" />
        <div className="error-message__timeline-content">
          <div className="error-message__text">{resolved.message}</div>
          {resolved.description ? (
            <div className="error-message__description">{resolved.description}</div>
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
          <span className="error-message__text">{resolved.message}</span>
          {resolved.description ? (
            <span className="error-message__description">{resolved.description}</span>
          ) : null}
        </div>
        {retryButton}
      </div>
    );
  }

  return (
    <div className={rootClass} role="alert" aria-live="assertive">
      <ErrorIcon />
      <p className="error-message__message">{resolved.message}</p>
      {resolved.description ? (
        <p className="error-message__description">{resolved.description}</p>
      ) : null}
      {retryButton}
    </div>
  );
}
