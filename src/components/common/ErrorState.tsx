import type { ReactNode } from "react";
import {
  ErrorMessage,
  type ErrorMessageVariant,
  type ErrorScenario,
} from "./ErrorMessage";

export type { ErrorMessageVariant as ErrorStateVariant, ErrorScenario };

export interface ErrorStateProps {
  hasError: boolean;
  message?: string;
  description?: string;
  scenario?: ErrorScenario;
  variant?: ErrorMessageVariant;
  retrying?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  retryingLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  hasError,
  message,
  description,
  scenario,
  variant = "panel",
  retrying = false,
  loading = false,
  onRetry,
  retryLabel,
  retryingLabel,
  children,
  className,
}: ErrorStateProps) {
  if (!hasError) {
    return children ? <>{children}</> : null;
  }

  return (
    <ErrorMessage
      message={message}
      description={description}
      scenario={scenario}
      variant={variant}
      retrying={retrying}
      loading={loading}
      onRetry={onRetry}
      retryLabel={retryLabel}
      retryingLabel={retryingLabel}
      className={className}
    />
  );
}
