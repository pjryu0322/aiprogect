import type { ReactNode } from "react";
import {
  ErrorMessage,
  type ErrorMessageVariant,
} from "./ErrorMessage";

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

  if (!message) {
    return null;
  }

  return (
    <ErrorMessage
      message={message}
      description={description}
      variant={variant}
      retrying={retrying}
      onRetry={onRetry}
      retryLabel={retryLabel}
      className={className}
    />
  );
}
