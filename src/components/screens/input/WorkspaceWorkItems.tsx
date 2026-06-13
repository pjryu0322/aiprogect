import type { WorkspaceWorkItemsProps } from "./InputScreen.types";
import {
  getWorkspaceStatusDescription,
  getWorkspaceStatusHeadline,
} from "./inputScreen.utils";
import "./inputScreen.css";

export function WorkspaceWorkItems({
  status,
  meetingFile,
  participants,
  workItems,
  primaryBlocker,
  primaryBlockerMessage,
  onWorkItemUpdate,
  onWorkItemRemove,
  disabled = false,
  className,
}: WorkspaceWorkItemsProps) {
  const isLocked = disabled || status === "uploading";
  const hasFile = meetingFile !== null;
  const readyParticipantCount = participants.filter(
    (participant) => participant.name.trim().length > 0
  ).length;
  const showWorkBlocker =
    primaryBlocker === "no_work_items" || primaryBlocker === "insufficient_work_input";

  const summaryClass = [
    "input-screen-workspace-summary",
    status === "ready" ? " input-screen-workspace-summary--ready" : "",
    status === "uploading" ? " input-screen-workspace-summary--uploading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rootClass = ["input-screen-workspace-work-items", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className={summaryClass} role="status" aria-live="polite">
        <h3 className="input-screen-workspace-summary__title">
          {getWorkspaceStatusHeadline(status)}
        </h3>
        <p className="input-screen-workspace-summary__description">
          {getWorkspaceStatusDescription(
            status,
            hasFile,
            readyParticipantCount,
            workItems.length
          )}
        </p>

        <ul className="input-screen-checklist" aria-label="입력 준비 상태">
          <li
            className={`input-screen-checklist__item${
              hasFile ? " input-screen-checklist__item--done" : ""
            }`}
          >
            <span className="input-screen-checklist__dot" aria-hidden="true" />
            회의 파일 {hasFile ? "선택됨" : "미선택"}
          </li>
          <li
            className={`input-screen-checklist__item${
              readyParticipantCount > 0 ? " input-screen-checklist__item--done" : ""
            }`}
          >
            <span className="input-screen-checklist__dot" aria-hidden="true" />
            참여자 {readyParticipantCount}명 입력
          </li>
          <li
            className={`input-screen-checklist__item${
              workItems.length > 0 ? " input-screen-checklist__item--done" : ""
            }`}
          >
            <span className="input-screen-checklist__dot" aria-hidden="true" />
            업무 {workItems.length}건 등록
          </li>
        </ul>
      </div>

      {workItems.length > 0 ? (
        <ul className="input-screen-work-items" aria-label="등록된 업무">
          {workItems.map((workItem, index) => (
            <li key={workItem.id} className="input-screen-work-item">
              <span className="input-screen-work-item__index" aria-hidden="true">
                {index + 1}
              </span>
              <input
                type="text"
                className="input-screen-inline-input input-screen-work-item__input"
                value={workItem.text}
                disabled={isLocked}
                aria-label={`업무 ${index + 1}`}
                onChange={(event) =>
                  onWorkItemUpdate({ ...workItem, text: event.target.value })
                }
              />
              {!isLocked ? (
                <button
                  type="button"
                  className="input-screen-text-btn"
                  aria-label={`업무 ${index + 1} 제거`}
                  onClick={() => onWorkItemRemove(workItem.id)}
                >
                  제거
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {showWorkBlocker && primaryBlockerMessage ? (
        <p className="input-screen-hint" role="alert" style={{ marginTop: "12px" }}>
          {primaryBlockerMessage}
        </p>
      ) : null}
    </div>
  );
}
