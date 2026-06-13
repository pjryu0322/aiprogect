import { LoadingState } from "../../common/LoadingState";
import { RetryAction } from "../../common/RetryAction";
import type { DraftTimelineBlockProps } from "./ResultScreen.types";
import "./resultScreen.css";

export function DraftTimelineBlock({
  status,
  events,
  errorMessage,
  onRetry,
  retrying = false,
  className,
}: DraftTimelineBlockProps) {
  const rootClass = ["draft-timeline", "result-screen-timeline", className]
    .filter(Boolean)
    .join(" ");
  const hasTimelineError = status === "error";

  return (
    <section className={rootClass} aria-labelledby="result-screen-timeline-heading">
      <h3 id="result-screen-timeline-heading" className="draft-timeline__title">
        초안 생성 타임라인
      </h3>

      {status === "loading" && events.length === 0 ? (
        <LoadingState
          loading
          message="초안 생성 단계를 업데이트하고 있습니다..."
          variant="timeline"
        />
      ) : events.length > 0 ? (
        events.map((event) => {
          const isFailedItem = hasTimelineError && event.status === "active";

          if (isFailedItem && onRetry) {
            return (
              <RetryAction
                key={event.id}
                failed
                message={errorMessage ?? "초안 생성 중 오류가 발생했습니다"}
                onRetry={onRetry}
                retrying={retrying}
                variant="timeline"
              />
            );
          }

          if (event.status === "active") {
            return (
              <LoadingState
                key={event.id}
                loading
                message={event.label}
                label={`${event.label} 진행 중`}
                variant="timeline"
              />
            );
          }

          return (
            <div
              key={event.id}
              className={`timeline-item${
                event.status === "active" ? " timeline-item--active" : ""
              }${event.status === "done" ? " timeline-item--done" : ""}`}
            >
              <div className="timeline-item__dot" aria-hidden="true" />
              <div className="timeline-item__content">
                <div className="timeline-item__label">{event.label}</div>
                <div className="timeline-item__time">{event.displayTime}</div>
              </div>
            </div>
          );
        })
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
