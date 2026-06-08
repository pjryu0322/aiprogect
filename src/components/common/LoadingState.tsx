import type { ReactNode } from 'react';
import './LoadingState.css';

export type LoadingVariant = 'block' | 'inline' | 'timeline';
export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={`loading-spinner loading-spinner--${size}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}

export interface LoadingStateProps {
  loading: boolean;
  message?: string;
  progressPercent?: number;
  variant?: LoadingVariant;
  spinnerSize?: SpinnerSize;
  className?: string;
  children?: ReactNode;
}

export function LoadingState({
  loading,
  message,
  progressPercent,
  variant = 'block',
  spinnerSize,
  className = '',
  children,
}: LoadingStateProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const resolvedSpinnerSize = spinnerSize ?? (variant === 'inline' ? 'sm' : 'md');
  const statusMessage = message ?? '처리 중입니다…';
  const showProgress =
    typeof progressPercent === 'number' && progressPercent >= 0 && variant === 'block';

  return (
    <div
      className={`loading-state loading-state--${variant}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={statusMessage}
    >
      <Spinner size={resolvedSpinnerSize} />
      <p className="loading-state__message">{statusMessage}</p>
      {showProgress && (
        <div
          className="loading-state__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.max(0, progressPercent))}
          aria-label={`진행률 ${progressPercent}%`}
        >
          <div
            className="loading-state__progress-bar"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}
