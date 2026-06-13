import { useId, useRef } from "react";
import {
  CONVERSION_STEPS,
  type ConversionStepId,
} from "../../components/WorkspaceShell.types";
import type {
  StartFlowConversionStepsProps,
  StartFlowMeetingFileProps,
  StartFlowProps,
  StartFlowWorkspaceProps,
} from "./StartFlow.types";

function getStepStatus(
  stepId: ConversionStepId,
  activeStep: ConversionStepId
): "done" | "active" | "pending" {
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

function getMeetingFileMeta(
  status: StartFlowMeetingFileProps["status"],
  sizeLabel?: string
): string {
  if (status === "uploading") {
    return "업로드 중";
  }

  if (sizeLabel) {
    return sizeLabel;
  }

  return "업로드 대기";
}

export function StartFlowMeetingFile({
  status,
  meetingFile,
  blocker,
  onFileSelect,
  onFileClear,
  accept = "audio/*,video/*,.m4a,.mp3,.wav,.mp4,.webm",
  disabled = false,
  className,
}: StartFlowMeetingFileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isInteractive = !disabled && status !== "uploading";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = "";
  };

  const rootClass = ["start-flow-meeting-file", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept}
        disabled={!isInteractive}
        onChange={handleFileChange}
      />

      {meetingFile ? (
        <div className="file-list-item">
          <div className="file-list-item__icon" aria-hidden="true">
            🎙
          </div>
          <div className="file-list-item__info">
            <div className="file-list-item__name">{meetingFile.name}</div>
            <div className="file-list-item__meta">
              {getMeetingFileMeta(status, meetingFile.sizeLabel)}
            </div>
          </div>
          {isInteractive && onFileClear ? (
            <button
              type="button"
              className="center-panel__send-btn"
              style={{ padding: "6px 10px", fontSize: "11px" }}
              onClick={onFileClear}
            >
              제거
            </button>
          ) : null}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="panel-placeholder"
          style={{
            cursor: isInteractive ? "pointer" : "default",
            display: "block",
          }}
        >
          녹취 파일을 선택하거나
          <br />
          이 영역을 눌러 업로드하세요
        </label>
      )}

      {blocker === "no_file" ? (
        <p
          className="start-flow-meeting-file__hint"
          style={{ marginTop: "8px", fontSize: "11px", color: "var(--color-text-muted)" }}
          role="status"
        >
          회의 파일을 선택하면 분석을 준비할 수 있습니다.
        </p>
      ) : null}
    </div>
  );
}

export function StartFlowWorkspace({
  status,
  blocker,
  blockerMessage,
  canStartAnalysis,
  inputValue,
  onInputChange,
  onStartAnalysis,
  requireInput = false,
  disabled = false,
  className,
}: StartFlowWorkspaceProps) {
  const isUploading = status === "uploading";
  const isActionDisabled = disabled || isUploading;

  const rootClass = ["start-flow-workspace", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="center-panel__workspace-body">
        {isUploading ? (
          <div className="panel-placeholder" role="status" aria-live="polite">
            회의 파일을 업로드하고 있습니다.
            <br />
            완료되면 STT 변환 단계로 이어집니다.
          </div>
        ) : status === "ready" ? (
          <div className="panel-placeholder">
            회의 파일이 준비되었습니다.
            <br />
            {requireInput
              ? "업무 입력을 확인한 뒤 분석을 시작하세요."
              : "분석 시작을 눌러 변환을 진행하세요."}
          </div>
        ) : (
          <div className="panel-placeholder">
            회의 녹취를 업로드하고 변환을 시작하면
            <br />
            처리 상태와 중간 결과가 이 영역에 표시됩니다
          </div>
        )}

        {blocker && blockerMessage ? (
          <p
            className="start-flow-workspace__blocker"
            role="alert"
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "var(--color-text-muted)",
            }}
          >
            {blockerMessage}
          </p>
        ) : null}
      </div>

      <div className="center-panel__input-bar" aria-label="업무 입력">
        <label htmlFor="start-flow-workspace-input" className="sr-only">
          업무 입력
        </label>
        <textarea
          id="start-flow-workspace-input"
          className="center-panel__input"
          placeholder="회의 관련 지시나 메모를 입력하세요..."
          rows={1}
          value={inputValue}
          disabled={disabled || isUploading}
          onChange={(event) => onInputChange(event.target.value)}
        />
        <button
          type="button"
          className="center-panel__send-btn"
          disabled={isActionDisabled}
          onClick={onStartAnalysis}
        >
          {isUploading ? "업로드 중" : "분석 시작"}
        </button>
      </div>
    </div>
  );
}

export function StartFlowConversionSteps({
  activeStep,
  className,
}: StartFlowConversionStepsProps) {
  const rootClass = ["start-flow-conversion-steps", className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={`conversion-steps ${rootClass}`} aria-label="변환 단계">
      {CONVERSION_STEPS.map((step, index) => {
        const status = getStepStatus(step.id, activeStep);

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

export function StartFlow({
  viewModel,
  onFileSelect,
  onFileClear,
  onInputChange,
  onStartAnalysis,
  requireInput = false,
  accept,
  disabled = false,
}: StartFlowProps) {
  return (
    <>
      <StartFlowConversionSteps activeStep={viewModel.activeConversionStep} />
      <StartFlowMeetingFile
        status={viewModel.status}
        meetingFile={viewModel.meetingFile}
        blocker={viewModel.blocker}
        onFileSelect={onFileSelect}
        onFileClear={onFileClear}
        accept={accept}
        disabled={disabled}
      />
      <StartFlowWorkspace
        status={viewModel.status}
        blocker={viewModel.blocker}
        blockerMessage={viewModel.blockerMessage}
        canStartAnalysis={viewModel.canStartAnalysis}
        inputValue={viewModel.inputValue}
        onInputChange={onInputChange}
        onStartAnalysis={onStartAnalysis}
        requireInput={requireInput}
        disabled={disabled}
      />
    </>
  );
}
