import type { ReactNode } from "react";
import { EmptyState } from "../../common/EmptyState";
import { ErrorState } from "../../common/ErrorState";
import { LoadingState } from "../../common/LoadingState";
import { NoResultState } from "../../common/NoResultState";
import { ActionItemsCard } from "./ActionItemsCard";
import { DecisionsCard } from "./DecisionsCard";
import { HighlightsCard } from "./HighlightsCard";
import type { SummaryTabContentProps } from "./ResultScreen.types";
import { SummaryOverviewBlock } from "./SummaryOverviewBlock";
import "./resultScreen.css";

function renderStatusBoundary(
  status: SummaryTabContentProps["status"],
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
        title="표시할 결과가 없습니다"
        description="요약본 데이터가 아직 준비되지 않았습니다."
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

export function SummaryTabContent({
  status,
  summary,
  highlights,
  decisions,
  actionItems,
  errorMessage,
  onRetry,
  onDecisionSelect,
  onActionItemSelect,
  retrying = false,
  className,
}: SummaryTabContentProps) {
  const hasContent =
    summary !== null ||
    highlights.length > 0 ||
    decisions.length > 0 ||
    actionItems.length > 0;

  const content = hasContent ? (
    <div className={["result-screen-summary", className].filter(Boolean).join(" ")}>
      {summary ? <SummaryOverviewBlock summary={summary} /> : null}
      <HighlightsCard highlights={highlights} />
      <DecisionsCard decisions={decisions} onDecisionSelect={onDecisionSelect} />
      <ActionItemsCard actionItems={actionItems} onActionItemSelect={onActionItemSelect} />
    </div>
  ) : null;

  return renderStatusBoundary(
    status,
    errorMessage,
    onRetry,
    "아직 생성된 요약본이 없습니다",
    "회의 녹취 변환과 초안 생성이 완료되면 이 탭에 요약본이 표시됩니다.",
    "요약본을 생성하고 있습니다...",
    content,
    retrying
  );
}
