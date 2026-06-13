import { useEffect, useRef, type ReactNode } from "react";
import "./LoadingState.css";

export type LoadingStateSize = "sm" | "md" | "lg";

export type LoadingStateVariant = "panel" | "inline" | "chip" | "timeline";

export const LOADING_PHASE_MESSAGES = {
  uploading: "파일 업로드 중...",
  stt_processing: "STT 변환 중...",
  speaker_waiting: "화자 분리 중...",
  draft_pending: "초안 생성 중...",
} as const;

export type LoadingPhase = keyof typeof LOADING_PHASE_MESSAGES;

export interface SpinnerProps {
  size?: LoadingStateSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <span
      className={`loading-spinner loading-spinner--${size}${
        className ? ` ${className}` : ""
      }`}
      role="status"
      aria-label={label ?? "로딩 중"}
    >
      <span className="loading-spinner__ring" aria-hidden="true" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export interface LoadingStateProps {
  loading: boolean;
  message?: string;
  subMessage?: string;
  time?: string;
  label?: string;
  variant?: LoadingStateVariant;
  size?: LoadingStateSize;
  children?: ReactNode;
  className?: string;
  onComplete?: () => void;
}

export function LoadingState({
  loading,
  message,
  subMessage,
  time,
  label,
  variant = "panel",
  size = "md",
  children,
  className,
  onComplete,
}: LoadingStateProps) {
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (wasLoading.current && !loading) {
      onComplete?.();
    }
    wasLoading.current = loading;
  }, [loading, onComplete]);

  if (!loading) {
    return children ? <>{children}</> : null;
  }

  const statusLabel = label ?? message ?? "처리 중";
  const rootClass = ["loading-state", `loading-state--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  if (variant === "chip") {
    return (
      <span
        className={rootClass}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size="sm" label={statusLabel} />
        {message ? <span className="loading-state__text">{message}</span> : null}
      </span>
    );
  }

  if (variant === "timeline") {
    const timelineSubtext = subMessage ?? time ?? "진행 중...";

    return (
      <div
        className={rootClass}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="loading-state__timeline-dot" aria-hidden="true" />
        <div className="loading-state__timeline-content">
          {message ? <div className="loading-state__text">{message}</div> : null}
          <div className="loading-state__subtext">{timelineSubtext}</div>
        </div>
        <span className="sr-only">{statusLabel}</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={rootClass}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size={size} label={statusLabel} />
        {message ? <span className="loading-state__text">{message}</span> : null}
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size={size} label={statusLabel} />
      {message ? <p className="loading-state__message">{message}</p> : null}
    </div>
  );
}
