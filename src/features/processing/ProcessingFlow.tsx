import { LoadingState } from "../../components/common/LoadingState";
import { RetryAction } from "../../components/common/RetryAction";
import {
  CONVERSION_STEPS,
  type ConversionStepId,
} from "../../components/WorkspaceShell.types";
import {
  getProcessingFlowStepDisplayStatus,
  type ProcessingFlowActiveStepChipProps,
  type ProcessingFlowConversionStepsProps,
  type ProcessingFlowDraftTimelineProps,
  type ProcessingFlowProps,
  type ProcessingFlowStage,
  type ProcessingFlowWorkspaceProps,
} from "./ProcessingFlow.types";

const ACTIVE_CHIP_MESSAGES: Record<ProcessingFlowStage, string> = {
  uploading: "업로드 중",
  stt_processing: "STT 변환 중",
  speaker_waiting: "화자 분리 중",
  draft_pending: "초안 생성 중",
};

function getConversionStepClassName(
  status: ReturnType<typeof getProcessingFlowStepDisplayStatus>
): string {
  return [
    "conversion-step",
    status === "active" ? " conversion-step--active" : "",
    status === "done" ? " conversion-step--done" : "",
    status === "error" ? " conversion-step--error" : "",
  ].join("");
}

export function ProcessingFlowConversionSteps({
  activeStep,
  isSuccess = false,
  errorStep = null,
  className,
}: ProcessingFlowConversionStepsProps) {
  const rootClass = ["processing-flow-conversion-steps", className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={`conversion-steps ${rootClass}`} aria-label="변환 단계">
      {CONVERSION_STEPS.map((step, index) => {
        const status = getProcessingFlowStepDisplayStatus(step.id, activeStep, {
          isSuccess,
          errorStep,
        });

        return (
          <span key={step.id} style={{ display: "contents" }}>
            {index > 0 ? (
              <span className="conversion-step__connector" aria-hidden="true" />
            ) : null}
            <span
              className={getConversionStepClassName(status)}
              aria-current={status === "active" ? "step" : undefined}
              style={
                status === "error"
                  ? {
                      color: "var(--color-error, #dc2626)",
                      background: "#fef2f2",
                      borderColor: "rgba(220, 38, 38, 0.25)",
                    }
                  : undefined
              }
            >
              <span className="conversion-step__dot" aria-hidden="true" />
              {step.label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export function ProcessingFlowActiveStepChip({
  viewModel,
  className,
}: ProcessingFlowActiveStepChipProps) {
  if (!viewModel.isProcessing || !viewModel.activeStage) {
    return null;
  }

  const message = ACTIVE_CHIP_MESSAGES[viewModel.activeStage];
  const progressSuffix =
    viewModel.progress !== null &&
    viewModel.progress >= 0 &&
    viewModel.progress <= 100
      ? ` (${viewModel.progress}%)`
      : "";

  return (
    <LoadingState
      loading
      message={`${message}${progressSuffix}`}
      label={`${message} 진행 중`}
      variant="chip"
      className={className}
    />
  );
}

export function ProcessingFlowWorkspace({
  viewModel,
  onRetry,
  retrying = false,
  className,
}: ProcessingFlowWorkspaceProps) {
  const rootClass = ["processing-flow-workspace", className].filter(Boolean).join(" ");

  if (viewModel.isError) {
    return (
      <div className={rootClass}>
        <RetryAction
          failed
          message={viewModel.error?.message ?? viewModel.message}
          description={viewModel.subMessage ?? undefined}
          onRetry={onRetry ?? (() => undefined)}
          retrying={retrying}
          variant="panel"
        />
      </div>
    );
  }

  if (viewModel.isSuccess) {
    return (
      <div className={rootClass}>
        <div className="panel-placeholder" role="status" aria-live="polite">
          {viewModel.message}
          {viewModel.subMessage ? (
            <>
              <br />
              {viewModel.subMessage}
            </>
          ) : null}
        </div>
      </div>
    );
  }

  if (viewModel.isProcessing) {
    return (
      <div className={rootClass}>
        <LoadingState
          loading
          message={viewModel.message}
          label={viewModel.message}
          variant="panel"
          size="md"
        />
        {viewModel.subMessage ? (
          <p
            className="processing-flow-workspace__submessage"
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            {viewModel.subMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className="panel-placeholder">{viewModel.message}</div>
    </div>
  );
}

export function ProcessingFlowDraftTimeline({
  items,
  error = null,
  onRetry,
  retrying = false,
  className,
}: ProcessingFlowDraftTimelineProps) {
  const rootClass = ["processing-flow-draft-timeline", className]
    .filter(Boolean)
    .join(" ");

  if (items.length === 0) {
    return (
      <section
        className={`draft-timeline ${rootClass}`}
        aria-labelledby="processing-flow-draft-timeline-heading"
      >
        <h3 id="processing-flow-draft-timeline-heading" className="draft-timeline__title">
          초안 생성 타임라인
        </h3>
        <div className="panel-placeholder" role="status">
          변환 단계가 시작되면
          <br />
          타임라인이 이 영역에 표시됩니다
        </div>
      </section>
    );
  }

  return (
    <section
      className={`draft-timeline ${rootClass}`}
      aria-labelledby="processing-flow-draft-timeline-heading"
    >
      <h3 id="processing-flow-draft-timeline-heading" className="draft-timeline__title">
        초안 생성 타임라인
      </h3>

      {items.map((item) => {
        const isFailedItem = error !== null && item.status === "active";

        if (isFailedItem && onRetry) {
          return (
            <RetryAction
              key={item.id}
              failed
              message={error.message}
              onRetry={onRetry}
              retrying={retrying}
              variant="timeline"
            />
          );
        }

        if (item.status === "active") {
          return (
            <LoadingState
              key={item.id}
              loading
              message={`${item.label} · ${item.time}`}
              label={`${item.label} 진행 중`}
              variant="timeline"
            />
          );
        }

        return (
          <div
            key={item.id}
            className={`timeline-item${
              item.status === "active" ? " timeline-item--active" : ""
            }${item.status === "done" ? " timeline-item--done" : ""}`}
          >
            <div className="timeline-item__dot" aria-hidden="true" />
            <div className="timeline-item__content">
              <div className="timeline-item__label">{item.label}</div>
              <div className="timeline-item__time">
                {item.status === "pending" ? "대기 중" : item.time}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function ProcessingFlow({
  viewModel,
  onRetry,
  retrying = false,
  className,
}: ProcessingFlowProps) {
  const rootClass = ["processing-flow", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <ProcessingFlowConversionSteps
        activeStep={viewModel.activeConversionStep}
        isSuccess={viewModel.isSuccess}
        errorStep={viewModel.error?.stage ?? null}
      />
      <ProcessingFlowActiveStepChip viewModel={viewModel} />
      <ProcessingFlowWorkspace
        viewModel={viewModel}
        onRetry={onRetry}
        retrying={retrying}
      />
      <ProcessingFlowDraftTimeline
        items={viewModel.timelineItems}
        error={viewModel.error}
        onRetry={onRetry}
        retrying={retrying}
      />
    </div>
  );
}

export type { ConversionStepId };
