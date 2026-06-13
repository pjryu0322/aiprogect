import { LoadingState } from "../../components/common/LoadingState";
import { RetryAction } from "../../components/common/RetryAction";
import {
  CONVERSION_STEPS,
  type ConversionStepId,
} from "../../components/WorkspaceShell.types";
import type {
  ProcessingFlowConversionStepsProps,
  ProcessingFlowDraftTimelineProps,
  ProcessingFlowProps,
  ProcessingFlowWorkspaceProps,
} from "./ProcessingFlow.types";

function getConversionStepDisplayStatus(
  stepId: ConversionStepId,
  activeStep: ConversionStepId,
  isSuccess = false
): "done" | "active" | "pending" {
  if (isSuccess) {
    return "done";
  }

  const stepOrder = CONVERSION_STEPS.map((step) => step.id);
  const activeIndex = stepOrder.indexOf(activeStep);
  const stepIndex = stepOrder.indexOf(stepId);

  if (stepIndex < activeIndex) {
    return "done";
  }

  if (stepIndex === activeIndex) {
    return "active";
  }

  return "pending";
}

export function ProcessingFlowConversionSteps({
  activeStep,
  isSuccess = false,
  className,
}: ProcessingFlowConversionStepsProps) {
  const rootClass = ["processing-flow-conversion-steps", className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={`conversion-steps ${rootClass}`} aria-label="변환 단계">
      {CONVERSION_STEPS.map((step, index) => {
        const status = getConversionStepDisplayStatus(step.id, activeStep, isSuccess);

        return (
          <span key={step.id} style={{ display: "contents" }}>
            {index > 0 ? (
              <span className="conversion-step__connector" aria-hidden="true" />
            ) : null}
            <span
              className={`conversion-step${
                status === "active" ? " conversion-step--active" : ""
              }${status === "done" ? " conversion-step--done" : ""}`}
              aria-current={status === "active" ? "step" : undefined}
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
              message={item.label}
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
              <div className="timeline-item__time">{item.time}</div>
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
      />
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
