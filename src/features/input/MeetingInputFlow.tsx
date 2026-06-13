import { useId, useRef } from "react";
import type {
  InputAnalysisOptions,
  MeetingInputFlowAnalysisOptionsProps,
  MeetingInputFlowMeetingFileProps,
  MeetingInputFlowParticipantsProps,
  MeetingInputFlowProps,
  MeetingInputFlowWorkspaceProps,
} from "./MeetingInputFlow.types";

function getMeetingFileMeta(status: MeetingInputFlowMeetingFileProps["status"], sizeLabel?: string) {
  if (status === "validating" && !sizeLabel) {
    return "입력 확인 필요";
  }

  if (sizeLabel) {
    return sizeLabel;
  }

  return "업로드 대기";
}

export function MeetingInputFlowMeetingFile({
  status,
  meetingFile,
  primaryBlocker,
  primaryBlockerMessage,
  onFileSelect,
  onFileClear,
  accept = "audio/*,video/*,.m4a,.mp3,.wav,.mp4,.webm",
  disabled = false,
  className,
}: MeetingInputFlowMeetingFileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isInteractive = !disabled;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = "";
  };

  const rootClass = ["meeting-input-flow-meeting-file", className].filter(Boolean).join(" ");

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

      {primaryBlocker === "no_file" && primaryBlockerMessage ? (
        <p
          className="meeting-input-flow-meeting-file__hint"
          style={{ marginTop: "8px", fontSize: "11px", color: "var(--color-text-muted)" }}
          role="alert"
        >
          {primaryBlockerMessage}
        </p>
      ) : null}
    </div>
  );
}

export function MeetingInputFlowParticipants({
  status,
  participants,
  primaryBlocker,
  primaryBlockerMessage,
  onParticipantAdd,
  onParticipantUpdate,
  onParticipantRemove,
  disabled = false,
  className,
}: MeetingInputFlowParticipantsProps) {
  const rootClass = ["meeting-input-flow-participants", className].filter(Boolean).join(" ");
  const showParticipantBlocker =
    primaryBlocker === "no_participants" || primaryBlocker === "invalid_participant";

  return (
    <div className={rootClass}>
      {participants.length === 0 ? (
        <div className="participant-item">
          <div className="participant-item__avatar" aria-hidden="true">
            +
          </div>
          <div className="participant-item__info">
            <div className="participant-item__name">참여자 추가</div>
            <div className="participant-item__role">분석 전 참여자를 입력합니다</div>
          </div>
        </div>
      ) : (
        participants.map((participant) => (
          <div key={participant.id} className="participant-item">
            <div className="participant-item__avatar" aria-hidden="true">
              {participant.name.trim().charAt(0) || "?"}
            </div>
            <div className="participant-item__info">
              <input
                type="text"
                className="center-panel__input"
                style={{ marginBottom: "4px", minHeight: "28px", padding: "4px 8px" }}
                placeholder="이름"
                value={participant.name}
                disabled={disabled}
                onChange={(event) =>
                  onParticipantUpdate({ ...participant, name: event.target.value })
                }
              />
              <input
                type="text"
                className="center-panel__input"
                style={{ minHeight: "28px", padding: "4px 8px" }}
                placeholder="역할"
                value={participant.role}
                disabled={disabled}
                onChange={(event) =>
                  onParticipantUpdate({ ...participant, role: event.target.value })
                }
              />
            </div>
            {!disabled ? (
              <button
                type="button"
                className="center-panel__send-btn"
                style={{ padding: "6px 10px", fontSize: "11px" }}
                onClick={() => onParticipantRemove(participant.id)}
              >
                제거
              </button>
            ) : null}
          </div>
        ))
      )}

      <button
        type="button"
        className="center-panel__send-btn"
        style={{ marginTop: "8px", width: "100%" }}
        disabled={disabled}
        onClick={onParticipantAdd}
      >
        + 참여자 추가
      </button>

      {showParticipantBlocker && primaryBlockerMessage ? (
        <p
          className="meeting-input-flow-participants__hint"
          style={{ marginTop: "8px", fontSize: "11px", color: "var(--color-text-muted)" }}
          role="alert"
        >
          {primaryBlockerMessage}
        </p>
      ) : null}

      {status === "ready" && participants.length > 0 ? (
        <p
          className="meeting-input-flow-participants__status"
          style={{ marginTop: "8px", fontSize: "11px", color: "var(--color-text-muted)" }}
          role="status"
        >
          참여자 {participants.length}명이 입력되었습니다.
        </p>
      ) : null}
    </div>
  );
}

export function MeetingInputFlowAnalysisOptions({
  options,
  onChange,
  disabled = false,
  className,
}: MeetingInputFlowAnalysisOptionsProps) {
  const rootClass = ["meeting-input-flow-analysis-options", className].filter(Boolean).join(" ");

  const toggleOption = (key: keyof InputAnalysisOptions) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <fieldset className={rootClass} disabled={disabled} style={{ border: "none", padding: 0, margin: 0 }}>
      <legend className="workspace-panel__section-title" style={{ marginBottom: "8px" }}>
        분석 옵션
      </legend>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={options.enableSpeakerSeparation}
          disabled={disabled}
          onChange={() => toggleOption("enableSpeakerSeparation")}
        />
        화자 분리
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={options.generateSummary}
          disabled={disabled}
          onChange={() => toggleOption("generateSummary")}
        />
        요약 생성
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={options.generateDraft}
          disabled={disabled}
          onChange={() => toggleOption("generateDraft")}
        />
        초안 생성
      </label>
    </fieldset>
  );
}

export function MeetingInputFlowWorkspace({
  status,
  primaryBlocker,
  primaryBlockerMessage,
  canProceedToAnalysis,
  workspaceInput,
  workItems,
  onWorkspaceInputChange,
  onWorkItemAdd,
  onWorkItemRemove,
  onWorkItemUpdate,
  onProceedToAnalysisStart,
  disabled = false,
  className,
}: MeetingInputFlowWorkspaceProps) {
  const rootClass = ["meeting-input-flow-workspace", className].filter(Boolean).join(" ");
  const showWorkBlocker =
    primaryBlocker === "no_work_items" || primaryBlocker === "insufficient_work_input";

  return (
    <div className={rootClass}>
      <div className="center-panel__workspace-body">
        {status === "ready" ? (
          <div className="panel-placeholder" role="status">
            입력 정보가 준비되었습니다.
            <br />
            분석 시작으로 다음 단계에 전달할 수 있습니다.
          </div>
        ) : status === "validating" ? (
          <div className="panel-placeholder" role="status">
            입력 정보를 확인해 주세요.
            <br />
            부족하거나 잘못된 항목을 수정한 뒤 다시 시도하세요.
          </div>
        ) : (
          <div className="panel-placeholder">
            회의 파일, 참여자, 업무 입력을 준비하면
            <br />
            이 영역에서 입력 상태를 확인할 수 있습니다
          </div>
        )}

        {workItems.length > 0 ? (
          <ul
            className="meeting-input-flow-workspace__tasks"
            style={{ marginTop: "12px", paddingLeft: "18px", fontSize: "12px" }}
            aria-label="등록된 업무"
          >
            {workItems.map((workItem) => (
              <li key={workItem.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    className="center-panel__input"
                    style={{ flex: 1, minHeight: "28px", padding: "4px 8px" }}
                    value={workItem.text}
                    disabled={disabled}
                    onChange={(event) =>
                      onWorkItemUpdate({ ...workItem, text: event.target.value })
                    }
                  />
                  {!disabled ? (
                    <button
                      type="button"
                      className="center-panel__send-btn"
                      style={{ padding: "6px 10px", fontSize: "11px" }}
                      onClick={() => onWorkItemRemove(workItem.id)}
                    >
                      제거
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {showWorkBlocker && primaryBlockerMessage ? (
          <p
            className="meeting-input-flow-workspace__blocker"
            role="alert"
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "var(--color-text-muted)",
            }}
          >
            {primaryBlockerMessage}
          </p>
        ) : null}
      </div>

      <div className="center-panel__input-bar" aria-label="업무 입력">
        <label htmlFor="meeting-input-flow-workspace-input" className="sr-only">
          업무 입력
        </label>
        <textarea
          id="meeting-input-flow-workspace-input"
          className="center-panel__input"
          placeholder="회의 관련 지시나 메모를 입력하세요..."
          rows={1}
          value={workspaceInput}
          disabled={disabled}
          onChange={(event) => onWorkspaceInputChange(event.target.value)}
        />
        <button
          type="button"
          className="center-panel__send-btn"
          disabled={disabled}
          aria-label="업무 추가"
          onClick={onWorkItemAdd}
        >
          +
        </button>
        <button
          type="button"
          className="center-panel__send-btn"
          disabled={disabled || !canProceedToAnalysis}
          onClick={onProceedToAnalysisStart}
        >
          분석 시작
        </button>
      </div>
    </div>
  );
}

export function MeetingInputFlow({
  viewModel,
  onFileSelect,
  onFileClear,
  onParticipantAdd,
  onParticipantUpdate,
  onParticipantRemove,
  onAnalysisOptionsChange,
  onWorkspaceInputChange,
  onWorkItemAdd,
  onWorkItemRemove,
  onWorkItemUpdate,
  onProceedToAnalysisStart,
  accept,
  disabled = false,
}: MeetingInputFlowProps) {
  return (
    <>
      <MeetingInputFlowMeetingFile
        status={viewModel.status}
        meetingFile={viewModel.meetingFile}
        primaryBlocker={viewModel.primaryBlocker}
        primaryBlockerMessage={viewModel.primaryBlockerMessage}
        onFileSelect={onFileSelect}
        onFileClear={onFileClear}
        accept={accept}
        disabled={disabled}
      />
      <MeetingInputFlowParticipants
        status={viewModel.status}
        participants={viewModel.participants}
        primaryBlocker={viewModel.primaryBlocker}
        primaryBlockerMessage={viewModel.primaryBlockerMessage}
        onParticipantAdd={onParticipantAdd}
        onParticipantUpdate={onParticipantUpdate}
        onParticipantRemove={onParticipantRemove}
        disabled={disabled}
      />
      <MeetingInputFlowAnalysisOptions
        options={viewModel.analysisOptions}
        onChange={onAnalysisOptionsChange}
        disabled={disabled}
      />
      <MeetingInputFlowWorkspace
        status={viewModel.status}
        primaryBlocker={viewModel.primaryBlocker}
        primaryBlockerMessage={viewModel.primaryBlockerMessage}
        canProceedToAnalysis={viewModel.canProceedToAnalysis}
        workspaceInput={viewModel.workspaceInput}
        workItems={viewModel.workItems}
        onWorkspaceInputChange={onWorkspaceInputChange}
        onWorkItemAdd={onWorkItemAdd}
        onWorkItemRemove={onWorkItemRemove}
        onWorkItemUpdate={onWorkItemUpdate}
        onProceedToAnalysisStart={onProceedToAnalysisStart}
        disabled={disabled}
      />
    </>
  );
}
