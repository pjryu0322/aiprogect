import type { WorkspaceInputBarProps } from "./InputScreen.types";
import "./inputScreen.css";

export function WorkspaceInputBar({
  status,
  workspaceInput,
  canProceedToAnalysis,
  onWorkspaceInputChange,
  onWorkItemAdd,
  onProceedToAnalysisStart,
  disabled = false,
  className,
}: WorkspaceInputBarProps) {
  const isUploading = status === "uploading";
  const isLocked = disabled || isUploading;

  const rootClass = ["input-screen-workspace-input-bar", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} aria-label="업무 입력">
      <div className="input-screen-input-bar">
        <label htmlFor="input-screen-workspace-input" className="sr-only">
          업무 입력
        </label>
        <textarea
          id="input-screen-workspace-input"
          className="center-panel__input"
          placeholder="회의 관련 지시나 메모를 입력하세요..."
          rows={1}
          value={workspaceInput}
          disabled={isLocked}
          onChange={(event) => onWorkspaceInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onWorkItemAdd();
            }
          }}
        />
        <button
          type="button"
          className="input-screen-input-bar__add-btn"
          disabled={isLocked}
          aria-label="업무 추가"
          title="업무 추가"
          onClick={onWorkItemAdd}
        >
          +
        </button>
        <button
          type="button"
          className="center-panel__send-btn"
          disabled={isLocked || !canProceedToAnalysis}
          onClick={onProceedToAnalysisStart}
        >
          {isUploading ? "업로드 중" : "분석 시작"}
        </button>
      </div>
    </div>
  );
}
