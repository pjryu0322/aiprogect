import type { ReactNode } from 'react';
import type { DraftTimelineEntry, ProcessingStatus } from '../../data/types';
import { SkeletonTimeline } from './Skeleton';
import './LoadingState.css';

export type LoadingVariant = 'block' | 'inline' | 'timeline';
export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = 'md', label = '로딩 중', className = '' }: SpinnerProps) {
  return (
    <span
      className={`loading-spinner loading-spinner--${size}${className ? ` ${className}` : ''}`}
      role="status"
      aria-label={label}
    />
  );
}

export interface LoadingStateProps {
  loading: boolean;
  message?: string;
  progressPercent?: number;
  variant?: LoadingVariant;
  spinnerSize?: SpinnerSize;
  entries?: DraftTimelineEntry[];
  className?: string;
  children?: ReactNode;
}

export function LoadingState({
  loading,
  message,
  progressPercent,
  variant = 'block',
  spinnerSize,
  entries,
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

  if (variant === 'timeline' && entries && entries.length > 0) {
    const hasActiveEntry = entries.some((entry) => entry.status === 'processing');

    return (
      <div
        className={`loading-state loading-state--${variant}${className ? ` ${className}` : ''}`}
        role="status"
        aria-live="polite"
        aria-busy={hasActiveEntry ? true : undefined}
        aria-label={statusMessage}
      >
        <div className="loading-state__entries">
          {entries.map((entry) => (
            <TimelineEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div
        className={`loading-state loading-state--${variant}${className ? ` ${className}` : ''}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={statusMessage}
      >
        <div className="loading-state__header">
          <Spinner size="sm" label={statusMessage} />
          <p className="loading-state__message">{statusMessage}</p>
        </div>
        <SkeletonTimeline itemCount={2} />
      </div>
    );
  }

  return (
    <div
      className={`loading-state loading-state--${variant}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={statusMessage}
    >
      <Spinner size={resolvedSpinnerSize} label={statusMessage} />
      <p className="loading-state__message">{statusMessage}</p>
      {showProgress ? (
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
      ) : null}
    </div>
  );
}

export interface ConversionProgressMessageProps {
  loading: boolean;
  message: string;
  progressPercent?: number;
  children?: ReactNode;
}

export function ConversionProgressMessage({
  loading,
  message,
  progressPercent,
  children,
}: ConversionProgressMessageProps) {
  return (
    <LoadingState
      loading={loading}
      message={message}
      progressPercent={progressPercent}
      variant="block"
      spinnerSize="lg"
    >
      {children}
    </LoadingState>
  );
}

export interface StageChipLoadingProps {
  loading: boolean;
  label?: string;
}

export function StageChipLoading({ loading, label = '단계 처리 중' }: StageChipLoadingProps) {
  if (!loading) {
    return null;
  }

  return (
    <span
      className="stage-chip-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <Spinner size="sm" label={label} />
    </span>
  );
}

function TimelineEntryIndicator({ status }: { status: ProcessingStatus }) {
  if (status === 'processing') {
    return <Spinner size="sm" label="처리 중" />;
  }

  if (status === 'error') {
    return <span className="loading-state__entry-dot loading-state__entry-dot--error" />;
  }

  if (status === 'success') {
    return <span className="loading-state__entry-dot loading-state__entry-dot--success" />;
  }

  return <span className="loading-state__entry-dot loading-state__entry-dot--idle" />;
}

function TimelineEntryRow({ entry }: { entry: DraftTimelineEntry }) {
  const isProcessing = entry.status === 'processing';

  return (
    <div
      className={`loading-state__entry${isProcessing ? ' loading-state__entry--processing' : ''}`}
    >
      <div className="loading-state__entry-indicator" aria-hidden="true">
        <TimelineEntryIndicator status={entry.status} />
      </div>
      <div className="loading-state__entry-content">
        <p
          className={`loading-state__entry-text${isProcessing ? '' : ' loading-state__entry-text--muted'}`}
        >
          {entry.message}
        </p>
        <p className="loading-state__entry-timestamp">{entry.timestamp}</p>
      </div>
    </div>
  );
}

export interface DraftTimelineLoadingProps {
  loading: boolean;
  entries?: DraftTimelineEntry[];
  message?: string;
  children?: ReactNode;
}

export function DraftTimelineLoading({
  loading,
  entries,
  message = '초안 생성 단계를 처리하는 중입니다…',
  children,
}: DraftTimelineLoadingProps) {
  return (
    <LoadingState loading={loading} message={message} variant="timeline" entries={entries}>
      {children}
    </LoadingState>
  );
}
