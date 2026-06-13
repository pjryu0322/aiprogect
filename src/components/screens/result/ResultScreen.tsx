import { useId } from "react";
import { DraftTimelineBlock } from "./DraftTimelineBlock";
import { ResultReviewActionsBar } from "./ResultReviewActionsBar";
import { ResultTabsBar } from "./ResultTabsBar";
import type { ResultScreenProps } from "./ResultScreen.types";
import { ScriptTabContent } from "./ScriptTabContent";
import { SummaryTabContent } from "./SummaryTabContent";
import "./resultScreen.css";

export function ResultScreen({
  viewModel,
  onTabChange,
  onRetry,
  onReviewAcknowledge,
  onProceedNext,
  onDecisionSelect,
  onActionItemSelect,
  onSegmentSelect,
  mobileActive = false,
  disabled = false,
  retrying = false,
  className,
}: ResultScreenProps) {
  const tabPanelId = useId();
  const rootClass = [
    "result-screen",
    "workspace-panel",
    "workspace-panel--right",
    mobileActive ? "workspace-panel--mobile-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={rootClass} aria-label="결과 패널">
      <header className="workspace-panel__header">
        <h2 className="workspace-panel__title">결과 패널</h2>
        <p className="workspace-panel__subtitle">요약본·스크립트·초안 타임라인</p>
      </header>

      <div className="result-screen__body">
        <ResultTabsBar
          activeTab={viewModel.activeTab}
          onTabChange={(tab) => onTabChange?.(tab)}
          disabled={disabled || viewModel.isLoading}
          tabPanelId={tabPanelId}
        />

        <div
          id={tabPanelId}
          className="result-panel__body"
          role="tabpanel"
          aria-labelledby={`result-screen-tab-${viewModel.activeTab}`}
        >
          {viewModel.activeTab === "summary" ? (
            <SummaryTabContent
              status={viewModel.status}
              summary={viewModel.summary}
              highlights={viewModel.highlights}
              decisions={viewModel.decisions}
              actionItems={viewModel.actionItems}
              errorMessage={viewModel.errorMessage}
              onRetry={onRetry}
              onDecisionSelect={onDecisionSelect}
              onActionItemSelect={onActionItemSelect}
              retrying={retrying}
            />
          ) : (
            <ScriptTabContent
              status={viewModel.status}
              scriptSegments={viewModel.scriptSegments}
              errorMessage={viewModel.errorMessage}
              onRetry={onRetry}
              onSegmentSelect={onSegmentSelect}
              retrying={retrying}
            />
          )}
        </div>

        <DraftTimelineBlock
          status={viewModel.status}
          events={viewModel.timelineEvents}
          errorMessage={viewModel.errorMessage}
          onRetry={onRetry}
          retrying={retrying}
        />

        <ResultReviewActionsBar
          viewModel={viewModel}
          onReviewAcknowledge={onReviewAcknowledge}
          onProceedNext={onProceedNext}
          onRetry={onRetry}
          retrying={retrying}
          disabled={disabled}
        />
      </div>
    </aside>
  );
}

export type {
  DraftTimelineBlockProps,
  ResultReviewActionsBarProps,
  ResultScreenCallbacks,
  ResultScreenContainerProps,
  ResultScreenDecision,
  ResultScreenActionItem,
  ResultScreenProps,
  ResultScreenScriptSegment,
  ResultScreenStatus,
  ResultScreenSummary,
  ResultScreenTabId,
  ResultScreenTimelineEvent,
  ResultScreenViewModel,
  ScriptTabContentProps,
  SummaryTabContentProps,
  ResultTabsBarProps,
} from "./ResultScreen.types";

export {
  ActionItemsCard,
} from "./ActionItemsCard";

export {
  DecisionsCard,
} from "./DecisionsCard";

export {
  DraftTimelineBlock,
};

export {
  HighlightsCard,
} from "./HighlightsCard";

export {
  ResultReviewActionsBar,
};

export {
  ResultTabsBar,
};

export {
  ScriptTabContent,
};

export {
  SummaryOverviewBlock,
} from "./SummaryOverviewBlock";

export {
  SummaryTabContent,
};

export { buildResultScreenViewModel } from "./buildResultScreenViewModel";

export {
  ACTION_ITEM_STATUS_LABELS,
  TIMELINE_STATUS_TIME_LABELS,
  getActionItemStatusLabel,
  getTimelineDisplayTime,
  resolveAssigneeName,
  resolveSpeakerName,
  safeArray,
  safeNumber,
  safeText,
} from "./resultScreen.utils";
