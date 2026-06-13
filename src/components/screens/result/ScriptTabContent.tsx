import type { ReactNode } from "react";
import { EmptyState } from "../../common/EmptyState";
import { ErrorState } from "../../common/ErrorState";
import { LoadingState } from "../../common/LoadingState";
import { NoResultState } from "../../common/NoResultState";
import type { ResultScreenScriptSegment, ScriptTabContentProps } from "./ResultScreen.types";
import "./resultScreen.css";

function renderStatusBoundary(
  status: ScriptTabContentProps["status"],
  errorMessage: string | null | undefined,
  onRetry: (() => void) | undefined,
  emptyTitle: string,
  emptyDescription: string,
  loadingMessage: string,
  content: ReactNode,
  retrying = false
) {
  if (status === "loading") {
    return (
      <LoadingState loading message={loadingMessage} variant="panel" size="md" />
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        hasError
        message={errorMessage ?? undefined}
        description="결과를 다시 불러오거나 변환을 재시도해 주세요."
        variant="panel"
        onRetry={onRetry}
        retryLabel="다시 시도"
        retrying={retrying}
      />
    );
  }

  if (status === "empty") {
    return (
      <EmptyState
        isEmpty
        title={emptyTitle}
        description={emptyDescription}
        variant="panel"
      />
    );
  }

  if (!content) {
    return (
      <NoResultState
        hasNoResult
        title="표시할 스크립트가 없습니다"
        description="STT 변환과 화자 분리가 완료되면 이 탭에 스크립트가 표시됩니다."
        variant="panel"
        action={
          onRetry
            ? {
                label: "새로고침",
                onClick: onRetry,
              }
            : undefined
        }
      />
    );
  }

  return content;
}

function ScriptSegmentCard({
  segment,
  onSelect,
}: {
  segment: ResultScreenScriptSegment;
  onSelect?: (segment: ResultScreenScriptSegment) => void;
}) {
  const isInteractive = Boolean(onSelect);

  return (
    <article className="result-screen-item-card result-screen-script-segment">
      <button
        type="button"
        className="result-screen-item-card__button"
        disabled={!isInteractive}
        onClick={() => onSelect?.(segment)}
      >
        <div className="result-screen-script-segment__header">
          <span className="result-screen-script-segment__speaker">{segment.speakerName}</span>
          <span className="result-screen-script-segment__time">
            {segment.startTime} – {segment.endTime}
          </span>
        </div>
        <p className="result-screen-script-segment__text">{segment.text}</p>
      </button>
    </article>
  );
}

export function ScriptTabContent({
  status,
  scriptSegments,
  errorMessage,
  onRetry,
  onSegmentSelect,
  retrying = false,
  className,
}: ScriptTabContentProps) {
  const content =
    scriptSegments.length > 0 ? (
      <div className={["result-screen-script-list", className].filter(Boolean).join(" ")}>
        {scriptSegments.map((segment) => (
          <ScriptSegmentCard
            key={segment.id}
            segment={segment}
            onSelect={onSegmentSelect}
          />
        ))}
      </div>
    ) : null;

  return renderStatusBoundary(
    status,
    errorMessage,
    onRetry,
    "아직 생성된 스크립트가 없습니다",
    "STT 변환과 화자 분리가 완료되면 이 탭에 화자별 스크립트가 표시됩니다.",
    "스크립트를 생성하고 있습니다...",
    content,
    retrying
  );
}
