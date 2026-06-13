import type { ResultReviewActionsBarProps } from "./ResultScreen.types";
import "./resultScreen.css";

export function ResultReviewActionsBar({
  viewModel,
  onReviewAcknowledge,
  onProceedNext,
  onRetry,
  retrying = false,
  disabled = false,
  className,
}: ResultReviewActionsBarProps) {
  const showReview = viewModel.canReview && Boolean(onReviewAcknowledge);
  const showProceed = viewModel.canProceed && Boolean(onProceedNext);
  const showRetry = viewModel.hasError && Boolean(onRetry);

  if (!showReview && !showProceed && !showRetry) {
    return null;
  }

  const rootClass = ["result-screen-actions", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {showRetry ? (
        <button
          type="button"
          className="result-screen-actions__button result-screen-actions__button--primary"
          disabled={disabled || retrying}
          onClick={onRetry}
        >
          {retrying ? "다시 시도 중..." : "다시 시도"}
        </button>
      ) : null}
      {showReview ? (
        <button
          type="button"
          className="result-screen-actions__button result-screen-actions__button--primary"
          disabled={disabled}
          onClick={onReviewAcknowledge}
        >
          결과 검토 완료
        </button>
      ) : null}
      {showProceed ? (
        <button
          type="button"
          className="result-screen-actions__button result-screen-actions__button--secondary"
          disabled={disabled}
          onClick={onProceedNext}
        >
          다음 작업 진행
        </button>
      ) : null}
    </div>
  );
}
