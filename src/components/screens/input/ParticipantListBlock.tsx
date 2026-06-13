import type { InputScreenParticipant, ParticipantListBlockProps } from "./InputScreen.types";
import {
  getParticipantAvatarInitial,
  getParticipantStatusLabel,
  resolveParticipantStatus,
} from "./inputScreen.utils";
import "./inputScreen.css";

function getStatusChipClass(status: InputScreenParticipant["status"]): string {
  return `input-screen-status-chip input-screen-status-chip--${status}`;
}

export function ParticipantListBlock({
  status,
  participants,
  primaryBlocker,
  primaryBlockerMessage,
  onParticipantAdd,
  onParticipantUpdate,
  onParticipantRemove,
  disabled = false,
  className,
}: ParticipantListBlockProps) {
  const isLocked = disabled || status === "uploading";
  const showParticipantBlocker =
    primaryBlocker === "no_participants" || primaryBlocker === "invalid_participant";

  const rootClass = ["input-screen-participant-list-block", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="input-screen-participant-list">
        {participants.length === 0 ? (
          <div className="input-screen-participant-row">
            <div className="participant-item__avatar" aria-hidden="true">
              +
            </div>
            <div className="input-screen-participant-row__fields">
              <div className="input-screen-participant-row__header">
                <span className="input-screen-participant-row__name-preview">참여자 추가</span>
                <span className={getStatusChipClass("draft")}>
                  {getParticipantStatusLabel("draft")}
                </span>
              </div>
              <p className="input-screen-meta-text">
                분석 전 회의 참여자의 이름과 역할을 입력합니다.
              </p>
            </div>
          </div>
        ) : (
          participants.map((participant) => {
            const participantStatus = resolveParticipantStatus(participant);

            return (
              <div key={participant.id} className="input-screen-participant-row">
                <div className="participant-item__avatar" aria-hidden="true">
                  {getParticipantAvatarInitial(participant)}
                </div>
                <div className="input-screen-participant-row__fields">
                  <div className="input-screen-participant-row__header">
                    <span className="input-screen-participant-row__name-preview">
                      {participant.name.trim() || "이름 미입력"}
                    </span>
                    <span className={getStatusChipClass(participantStatus)}>
                      {getParticipantStatusLabel(participantStatus)}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="input-screen-inline-input"
                    placeholder="이름"
                    value={participant.name}
                    disabled={isLocked}
                    aria-label="참여자 이름"
                    onChange={(event) =>
                      onParticipantUpdate({ ...participant, name: event.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="input-screen-inline-input"
                    placeholder="역할 (예: 프로덕트 매니저)"
                    value={participant.role}
                    disabled={isLocked}
                    aria-label="참여자 역할"
                    onChange={(event) =>
                      onParticipantUpdate({ ...participant, role: event.target.value })
                    }
                  />
                </div>
                {!isLocked ? (
                  <button
                    type="button"
                    className="input-screen-text-btn"
                    aria-label={`${participant.name || "참여자"} 제거`}
                    onClick={() => onParticipantRemove(participant.id)}
                  >
                    제거
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        className="input-screen-add-btn"
        style={{ marginTop: "8px" }}
        disabled={isLocked}
        onClick={onParticipantAdd}
      >
        + 참여자 추가
      </button>

      {showParticipantBlocker && primaryBlockerMessage ? (
        <p className="input-screen-hint" role="alert">
          {primaryBlockerMessage}
        </p>
      ) : null}

      {status === "ready" && participants.length > 0 ? (
        <p className="input-screen-hint" role="status">
          참여자 {participants.length}명이 입력되었습니다.
        </p>
      ) : null}
    </div>
  );
}
