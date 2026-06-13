import type { ReactNode } from "react";
import {
  ErrorMessage,
  type ErrorMessageVariant,
} from "./ErrorMessage";

export type { ErrorMessageVariant as ErrorStateVariant };

const DEFAULT_ERROR_MESSAGE = "오류가 발생했습니다";

export interface ErrorStateProps {
  hasError: boolean;
  message?: string;
  description?: string;
  variant?: ErrorMessageVariant;
  retrying?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  hasError,
  message,
  description,
  variant = "panel",
  retrying = false,
  onRetry,
  retryLabel,
  children,
  className,
}: ErrorStateProps) {
  if (!hasError) {
    return children ? <>{children}</> : null;
  }

  return (
    <ErrorMessage
      message={message ?? DEFAULT_ERROR_MESSAGE}
      description={description}
      variant={variant}
      retrying={retrying}
      onRetry={onRetry}
      retryLabel={retryLabel}
      className={className}
    />
  );
}
