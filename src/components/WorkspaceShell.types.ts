export type ConversionStepId =
  | "uploading"
  | "stt_processing"
  | "speaker_waiting"
  | "draft_pending";

export interface ConversionStep {
  id: ConversionStepId;
  label: string;
}

export const CONVERSION_STEPS: ConversionStep[] = [
  { id: "uploading", label: "업로드" },
  { id: "stt_processing", label: "STT 변환" },
  { id: "speaker_waiting", label: "화자 분리" },
  { id: "draft_pending", label: "초안 생성" },
];

export type MobilePanelId = "left" | "center" | "right";

export const MOBILE_PANELS: { id: MobilePanelId; label: string }[] = [
  { id: "left", label: "회의 정보" },
  { id: "center", label: "작업 공간" },
  { id: "right", label: "결과" },
];

export type ResultTabId = "summary" | "script";
