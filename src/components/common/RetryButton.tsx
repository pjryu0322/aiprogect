import { Spinner } from "./LoadingState";
import "./RetryButton.css";

export type RetryButtonSize = "sm" | "md";
export type RetryButtonVariant = "primary" | "secondary" | "outline";

export interface RetryButtonProps {
  onRetry: () => void;
  retrying?: boolean;
  loading?: boolean;
  label?: string;
  retryingLabel?: string;
  disabled?: boolean;
  size?: RetryButtonSize;
  variant?: RetryButtonVariant;
  className?: string;
}

export function RetryButton({
  onRetry,
  retrying = false,
  loading = false,
  label = "다시 시도",
  retryingLabel = "재시도 중...",
  disabled = false,
  size = "md",
  variant = "primary",
  className,
}: RetryButtonProps) {
  const isBusy = retrying || loading;

  const rootClass = [
    "retry-button",
    `retry-button--${size}`,
    `retry-button--${variant}`,
    isBusy ? "retry-button--busy" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onRetry}
      disabled={disabled || isBusy}
      aria-busy={isBusy || undefined}
    >
      {isBusy ? (
        <>
          <Spinner size="sm" className="retry-button__spinner" />
          <span className="retry-button__label">{retryingLabel}</span>
        </>
      ) : (
        <span className="retry-button__label">{label}</span>
      )}
    </button>
  );
}
