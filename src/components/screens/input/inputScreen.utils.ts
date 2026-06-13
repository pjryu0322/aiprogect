import type {
  InputScreenFileStatus,
  InputScreenParticipant,
  InputScreenParticipantStatus,
  InputScreenStatus,
} from "./InputScreen.types";

const FILE_STATUS_LABELS: Record<InputScreenFileStatus, string> = {
  waiting: "업로드 대기",
  uploading: "업로드 중",
  uploaded: "업로드 완료",
  processing: "변환 준비",
  ready: "분석 준비",
  error: "업로드 실패",
};

const PARTICIPANT_STATUS_LABELS: Record<InputScreenParticipantStatus, string> = {
  draft: "입력 중",
  ready: "준비됨",
};

export function getFileStatusLabel(status: InputScreenFileStatus): string {
  return FILE_STATUS_LABELS[status];
}

export function getParticipantStatusLabel(status: InputScreenParticipantStatus): string {
  return PARTICIPANT_STATUS_LABELS[status];
}

export function getParticipantAvatarInitial(participant: InputScreenParticipant): string {
  if (participant.avatarInitial) {
    return participant.avatarInitial;
  }

  const trimmedName = participant.name.trim();
  return trimmedName.charAt(0) || "?";
}

export function resolveParticipantStatus(participant: InputScreenParticipant): InputScreenParticipantStatus {
  if (participant.name.trim().length > 0 && participant.role.trim().length > 0) {
    return "ready";
  }

  return "draft";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDurationLabel(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "—";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function readMediaDurationLabel(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio");

    const cleanup = () => {
      URL.revokeObjectURL(url);
      media.removeAttribute("src");
      media.load();
    };

    media.preload = "metadata";
    media.onloadedmetadata = () => {
      const label = formatDurationLabel(media.duration);
      cleanup();
      resolve(label);
    };
    media.onerror = () => {
      cleanup();
      resolve("—");
    };

    media.src = url;
  });
}

export function mapFlowStatusToScreenStatus(
  flowStatus: "idle" | "validating" | "ready",
  isUploading: boolean
): InputScreenStatus {
  if (isUploading) {
    return "uploading";
  }

  if (flowStatus === "ready") {
    return "ready";
  }

  return "idle";
}

export function getWorkspaceStatusHeadline(status: InputScreenStatus): string {
  switch (status) {
    case "uploading":
      return "회의 파일을 업로드하고 있습니다";
    case "ready":
      return "입력 정보가 준비되었습니다";
    default:
      return "분석에 필요한 정보를 입력하세요";
  }
}

export function getWorkspaceStatusDescription(
  status: InputScreenStatus,
  hasFile: boolean,
  participantCount: number,
  workItemCount: number
): string {
  if (status === "uploading") {
    return "업로드가 완료되면 참여자와 업무 입력을 확인한 뒤 분석을 시작할 수 있습니다.";
  }

  if (status === "ready") {
    return `회의 파일 1개, 참여자 ${participantCount}명, 업무 ${workItemCount}건이 등록되었습니다. 분석 시작으로 다음 단계로 진행하세요.`;
  }

  if (!hasFile) {
    return "좌측 회의 파일 영역에서 녹취 파일을 선택한 뒤, 참여자와 업무를 추가하세요.";
  }

  return "참여자와 업무 입력을 채우면 분석 시작 버튼이 활성화됩니다.";
}
