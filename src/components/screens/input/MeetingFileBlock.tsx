import { useId, useRef } from "react";
import type { MeetingFileBlockProps } from "./InputScreen.types";
import { getFileStatusLabel } from "./inputScreen.utils";
import "./inputScreen.css";

function getStatusChipClass(status: NonNullable<MeetingFileBlockProps["meetingFile"]>["status"]): string {
  return `input-screen-status-chip input-screen-status-chip--${status}`;
}

export function MeetingFileBlock({
  status,
  meetingFile,
  uploadProgress,
  primaryBlocker,
  primaryBlockerMessage,
  onFileSelect,
  onFileClear,
  accept = "audio/*,video/*,.m4a,.mp3,.wav,.mp4,.webm",
  disabled = false,
  className,
}: MeetingFileBlockProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isUploading = status === "uploading";
  const isInteractive = !disabled && !isUploading;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = "";
  };

  const rootClass = ["input-screen-meeting-file-block", className].filter(Boolean).join(" ");

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
        <div className="input-screen-file-card">
          <div
            className={`input-screen-file-card__row${
              isUploading ? " input-screen-file-card__row--uploading" : ""
            }`}
          >
            <div className="file-list-item__icon" aria-hidden="true">
              🎙
            </div>
            <div className="input-screen-file-card__details">
              <div className="file-list-item__name">{meetingFile.name}</div>
              <div className="input-screen-file-card__meta-row">
                <span className={getStatusChipClass(meetingFile.status)}>
                  {getFileStatusLabel(meetingFile.status)}
                </span>
                {meetingFile.durationLabel ? (
                  <span className="input-screen-meta-text">재생 {meetingFile.durationLabel}</span>
                ) : null}
                <span className="input-screen-meta-text">{meetingFile.sizeLabel}</span>
              </div>
              {isUploading && typeof uploadProgress === "number" ? (
                <div
                  className="input-screen-upload-progress"
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="업로드 진행률"
                  style={{ marginTop: "10px" }}
                >
                  <div
                    className="input-screen-upload-progress__bar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              ) : null}
            </div>
            {isInteractive && onFileClear ? (
              <button
                type="button"
                className="input-screen-text-btn"
                onClick={onFileClear}
              >
                제거
              </button>
            ) : null}
          </div>

          {isInteractive ? (
            <label htmlFor={inputId} className="input-screen-add-btn" style={{ cursor: "pointer" }}>
              다른 파일 선택
            </label>
          ) : null}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`input-screen-upload-zone${
            isInteractive ? " input-screen-upload-zone--interactive" : ""
          }`}
        >
          <span className="input-screen-upload-zone__icon" aria-hidden="true">
            📁
          </span>
          <span>
            녹취 파일을 선택하거나
            <br />
            이 영역을 눌러 업로드하세요
          </span>
          <span className="input-screen-meta-text">m4a, mp3, wav, mp4, webm 지원</span>
        </label>
      )}

      {primaryBlocker === "no_file" && primaryBlockerMessage ? (
        <p className="input-screen-hint" role="alert">
          {primaryBlockerMessage}
        </p>
      ) : null}
    </div>
  );
}
