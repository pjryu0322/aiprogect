import type { ActionItemStatus, DraftTimelineStatus } from "../../../types/meeting";
import type { Participant } from "../../../types/meeting";

export const ACTION_ITEM_STATUS_LABELS: Record<ActionItemStatus, string> = {
  pending: "대기",
  in_progress: "진행 중",
  done: "완료",
};

export const TIMELINE_STATUS_TIME_LABELS: Record<DraftTimelineStatus, string> = {
  pending: "대기 중",
  active: "진행 중",
  done: "",
};

export function safeText(value: string | null | undefined, fallback = ""): string {
  if (value == null) {
    return fallback;
  }

  const trimmed = String(value).trim();
  return trimmed || fallback;
}

export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function safeNumber(value: number | null | undefined, fallback = 0): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return value;
}

export function getActionItemStatusLabel(status: ActionItemStatus | null | undefined): string {
  if (!status) {
    return ACTION_ITEM_STATUS_LABELS.pending;
  }

  return ACTION_ITEM_STATUS_LABELS[status] ?? ACTION_ITEM_STATUS_LABELS.pending;
}

export function getTimelineDisplayTime(
  status: DraftTimelineStatus,
  time: string | null | undefined
): string {
  if (status === "pending") {
    return TIMELINE_STATUS_TIME_LABELS.pending;
  }

  const safeTime = safeText(time);
  if (status === "active" && !safeTime) {
    return TIMELINE_STATUS_TIME_LABELS.active;
  }

  return safeTime || "—";
}

export function resolveSpeakerName(
  participantId: string | null | undefined,
  participantById: Record<string, Participant>,
  speakerLabel?: string | null
): string {
  const safeParticipantId = safeText(participantId);
  if (safeParticipantId) {
    const participant = participantById[safeParticipantId];
    if (participant?.name) {
      return safeText(participant.name, "알 수 없는 화자");
    }
  }

  return safeText(speakerLabel, "알 수 없는 화자");
}

export function resolveAssigneeName(
  assigneeId: string | null | undefined,
  participantById: Record<string, Participant>
): string {
  const safeAssigneeId = safeText(assigneeId);
  if (!safeAssigneeId) {
    return "미지정";
  }

  const participant = participantById[safeAssigneeId];
  return safeText(participant?.name, "미지정");
}
