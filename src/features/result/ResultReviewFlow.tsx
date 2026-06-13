import type { ReactNode } from "react";
import type {
  MeetingActionItem,
  MeetingDecision,
  Participant,
  TranscriptSegment,
} from "../../types/meeting";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { NoResultState } from "../../components/common/NoResultState";
import type {
  ResultReviewFlowDraftTimelineProps,
  ResultReviewFlowPanelProps,
  ResultReviewFlowProps,
  ResultReviewFlowReviewActionsProps,
  ResultReviewFlowScriptProps,
  ResultReviewFlowStatus,
  ResultReviewFlowSummaryProps,
  ResultReviewFlowTabsProps,
  ResultReviewTabId,
} from "./ResultReviewFlow.types";

const RESULT_TABS: { id: ResultReviewTabId; label: string }[] = [
  { id: "summary", label: "요약본" },
  { id: "script", label: "스크립트" },
];

const ACTION_ITEM_STATUS_LABELS: Record<MeetingActionItem["status"], string> = {
  pending: "대기",
  in_progress: "진행 중",
  done: "완료",
};

function getParticipantDisplayName(
  participantId: string,
  participantById: Record<string, Participant>,
  speakerLabel?: string
): string {
  const participant = participantById[participantId];

  if (participant) {
    return participant.name;
  }

  return speakerLabel ?? "알 수 없는 화자";
}

function renderStatusBoundary(
  status: ResultReviewFlowStatus,
  errorMessage: string | null | undefined,
  onRetry: (() => void) | undefined,
  emptyTitle: string,
  emptyDescription: string,
  loadingMessage: string,
  content: ReactNode
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
        description="요약본과 스크립트 데이터가 아직 준비되지 않았습니다."
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

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="workspace-panel__section result-review-flow-card">
      <h3 className="workspace-panel__section-title">{title}</h3>
      {children}
    </section>
  );
}

export function ResultReviewFlowTabs({
  activeTab,
  onTabChange,
  disabled = false,
  className,
}: ResultReviewFlowTabsProps) {
  const rootClass = ["result-review-flow-tabs", className].filter(Boolean).join(" ");

  return (
    <nav className={`result-tabs ${rootClass}`} aria-label="결과 탭">
      {RESULT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`result-tab${activeTab === tab.id ? " result-tab--active" : ""}`}
          disabled={disabled}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export function ResultReviewFlowSummary({
  status,
  summary,
  decisions,
  actionItems,
  participantById,
  errorMessage,
  onRetry,
  onDecisionSelect,
  onActionItemSelect,
  className,
}: ResultReviewFlowSummaryProps) {
  const rootClass = ["result-review-flow-summary", className].filter(Boolean).join(" ");

  const content =
    summary || decisions.length > 0 || actionItems.length > 0 ? (
      <div className={rootClass}>
        {summary ? (
          <>
            <div
              className="result-review-flow-summary__header"
              style={{ marginBottom: "14px" }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                {summary.meetingTitle}
              </h4>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                {summary.date} · {summary.duration} · 참여 {summary.participantCount}명
              </p>
              <p
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "var(--color-text)",
                }}
              >
                {summary.overview}
              </p>
            </div>

            {summary.highlights.length > 0 ? (
              <SummaryCard title="핵심 안건">
                <ul
                  className="result-review-flow-list"
                  style={{
                    margin: 0,
                    paddingLeft: "18px",
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {summary.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      style={{ fontSize: "12px", lineHeight: 1.55 }}
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </SummaryCard>
            ) : null}
          </>
        ) : null}

        {decisions.length > 0 ? (
          <SummaryCard title="결정사항">
            <div style={{ display: "grid", gap: "8px" }}>
              {decisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onSelect={onDecisionSelect}
                />
              ))}
            </div>
          </SummaryCard>
        ) : null}

        {actionItems.length > 0 ? (
          <SummaryCard title="할 일">
            <div style={{ display: "grid", gap: "8px" }}>
              {actionItems.map((actionItem) => (
                <ActionItemCard
                  key={actionItem.id}
                  actionItem={actionItem}
                  participantById={participantById}
                  onSelect={onActionItemSelect}
                />
              ))}
            </div>
          </SummaryCard>
        ) : null}
      </div>
    ) : null;

  return renderStatusBoundary(
    status,
    errorMessage,
    onRetry,
    "아직 생성된 요약본이 없습니다",
    "회의 녹취 변환과 초안 생성이 완료되면 이 탭에 요약본이 표시됩니다.",
    "요약본을 생성하고 있습니다...",
    content
  );
}

function DecisionCard({
  decision,
  onSelect,
}: {
  decision: MeetingDecision;
  onSelect?: (decision: MeetingDecision) => void;
}) {
  const isInteractive = Boolean(onSelect);

  return (
    <article
      className="result-review-flow-card-item"
      style={{
        padding: "10px 12px",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface)",
      }}
    >
      <button
        type="button"
        className="result-review-flow-card-item__button"
        disabled={!isInteractive}
        onClick={() => onSelect?.(decision)}
        style={{
          width: "100%",
          textAlign: "left",
          cursor: isInteractive ? "pointer" : "default",
        }}
      >
        <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.55 }}>
          {decision.summary}
        </p>
        {decision.rationale ? (
          <p
            style={{
              marginTop: "6px",
              fontSize: "11px",
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
            }}
          >
            {decision.rationale}
          </p>
        ) : null}
      </button>
    </article>
  );
}

function ActionItemCard({
  actionItem,
  participantById,
  onSelect,
}: {
  actionItem: MeetingActionItem;
  participantById: Record<string, Participant>;
  onSelect?: (actionItem: MeetingActionItem) => void;
}) {
  const assignee = participantById[actionItem.assigneeId];
  const isInteractive = Boolean(onSelect);

  return (
    <article
      className="result-review-flow-card-item"
      style={{
        padding: "10px 12px",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface)",
      }}
    >
      <button
        type="button"
        className="result-review-flow-card-item__button"
        disabled={!isInteractive}
        onClick={() => onSelect?.(actionItem)}
        style={{
          width: "100%",
          textAlign: "left",
          cursor: isInteractive ? "pointer" : "default",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.55 }}>
            {actionItem.task}
          </p>
          <span
            className={`result-review-flow-chip result-review-flow-chip--${actionItem.status}`}
            style={{
              flexShrink: 0,
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "999px",
              background: "var(--color-surface-muted)",
              color: "var(--color-text-muted)",
            }}
          >
            {ACTION_ITEM_STATUS_LABELS[actionItem.status]}
          </span>
        </div>
        <p
          style={{
            marginTop: "6px",
            fontSize: "11px",
            color: "var(--color-text-muted)",
          }}
        >
          담당 {assignee?.name ?? "미지정"} · 마감 {actionItem.dueDate}
        </p>
      </button>
    </article>
  );
}

export function ResultReviewFlowScript({
  status,
  transcriptSegments,
  participantById,
  errorMessage,
  onRetry,
  onSegmentSelect,
  className,
}: ResultReviewFlowScriptProps) {
  const rootClass = ["result-review-flow-script", className].filter(Boolean).join(" ");

  const content =
    transcriptSegments.length > 0 ? (
      <div className={rootClass} style={{ display: "grid", gap: "10px" }}>
        {transcriptSegments.map((segment) => (
          <ScriptSegmentCard
            key={segment.id}
            segment={segment}
            speakerName={getParticipantDisplayName(
              segment.participantId,
              participantById,
              segment.speakerLabel
            )}
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
    content
  );
}

function ScriptSegmentCard({
  segment,
  speakerName,
  onSelect,
}: {
  segment: TranscriptSegment;
  speakerName: string;
  onSelect?: (segment: TranscriptSegment) => void;
}) {
  const isInteractive = Boolean(onSelect);

  return (
    <article
      className="result-review-flow-script-segment"
      style={{
        padding: "10px 12px",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface)",
      }}
    >
      <button
        type="button"
        disabled={!isInteractive}
        onClick={() => onSelect?.(segment)}
        style={{
          width: "100%",
          textAlign: "left",
          cursor: isInteractive ? "pointer" : "default",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600 }}>{speakerName}</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {segment.startTime} – {segment.endTime}
          </span>
        </div>
        <p style={{ fontSize: "12px", lineHeight: 1.6 }}>{segment.text}</p>
      </button>
    </article>
  );
}

export function ResultReviewFlowDraftTimeline({
  status,
  events,
  className,
}: ResultReviewFlowDraftTimelineProps) {
  const rootClass = ["result-review-flow-timeline", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={`draft-timeline ${rootClass}`}
      aria-labelledby="result-review-flow-timeline-heading"
    >
      <h3 id="result-review-flow-timeline-heading" className="draft-timeline__title">
        초안 생성 타임라인
      </h3>

      {status === "loading" ? (
        <LoadingState
          loading
          message="초안 생성 단계를 업데이트하고 있습니다..."
          variant="timeline"
        />
      ) : events.length > 0 ? (
        events.map((event) => (
          <div
            key={event.id}
            className={`timeline-item${
              event.status === "active" ? " timeline-item--active" : ""
            }${event.status === "done" ? " timeline-item--done" : ""}`}
          >
            <div className="timeline-item__dot" aria-hidden="true" />
            <div className="timeline-item__content">
              <div className="timeline-item__label">{event.label}</div>
              <div className="timeline-item__time">
                {event.status === "pending" ? "대기 중" : event.time}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="panel-placeholder" role="status">
          변환 단계가 시작되면
          <br />
          타임라인이 이 영역에 표시됩니다
        </div>
      )}
    </section>
  );
}

export function ResultReviewFlowReviewActions({
  viewModel,
  onReviewAcknowledge,
  onProceedNext,
  disabled = false,
  className,
}: ResultReviewFlowReviewActionsProps) {
  if (!viewModel.canReview && !viewModel.hasError) {
    return null;
  }

  const rootClass = ["result-review-flow-actions", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        padding: "12px 16px",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      {viewModel.canReview && onReviewAcknowledge ? (
        <button
          type="button"
          className="center-panel__send-btn"
          style={{ padding: "8px 14px", fontSize: "12px" }}
          disabled={disabled}
          onClick={onReviewAcknowledge}
        >
          결과 검토 완료
        </button>
      ) : null}
      {viewModel.canProceed && onProceedNext ? (
        <button
          type="button"
          className="center-panel__send-btn"
          style={{
            padding: "8px 14px",
            fontSize: "12px",
            background: "var(--color-surface-muted)",
            color: "var(--color-text)",
          }}
          disabled={disabled}
          onClick={onProceedNext}
        >
          다음 작업 진행
        </button>
      ) : null}
    </div>
  );
}

export function ResultReviewFlowPanel({
  mobileActive = false,
  className,
  children,
}: ResultReviewFlowPanelProps) {
  const rootClass = ["result-review-flow-panel", className].filter(Boolean).join(" ");

  return (
    <aside
      className={`workspace-panel workspace-panel--right ${rootClass}${
        mobileActive ? " workspace-panel--mobile-active" : ""
      }`}
      aria-label="결과 패널"
    >
      <header className="workspace-panel__header">
        <h2 className="workspace-panel__title">결과 패널</h2>
        <p className="workspace-panel__subtitle">요약본·스크립트·초안 타임라인</p>
      </header>
      {children}
    </aside>
  );
}

export function ResultReviewFlow({
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
}: ResultReviewFlowProps) {
  const rootClass = [
    "result-review-flow",
    mobileActive ? "result-review-flow--mobile-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ResultReviewFlowPanel mobileActive={mobileActive} className={rootClass}>
      <ResultReviewFlowTabs
        activeTab={viewModel.activeTab}
        onTabChange={onTabChange}
        disabled={disabled || viewModel.isLoading}
      />

      <div className="result-panel__body" role="tabpanel">
        {viewModel.activeTab === "summary" ? (
          <ResultReviewFlowSummary
            status={viewModel.status}
            summary={viewModel.summary}
            decisions={viewModel.decisions}
            actionItems={viewModel.actionItems}
            participantById={viewModel.participantById}
            errorMessage={viewModel.errorMessage}
            onRetry={onRetry}
            onDecisionSelect={onDecisionSelect}
            onActionItemSelect={onActionItemSelect}
          />
        ) : (
          <ResultReviewFlowScript
            status={viewModel.status}
            transcriptSegments={viewModel.transcriptSegments}
            participantById={viewModel.participantById}
            errorMessage={viewModel.errorMessage}
            onRetry={onRetry}
            onSegmentSelect={onSegmentSelect}
          />
        )}
      </div>

      <ResultReviewFlowDraftTimeline
        status={viewModel.status}
        events={viewModel.draftTimeline}
      />

      <ResultReviewFlowReviewActions
        viewModel={viewModel}
        onReviewAcknowledge={onReviewAcknowledge}
        onProceedNext={onProceedNext}
        disabled={disabled}
      />
    </ResultReviewFlowPanel>
  );
}
