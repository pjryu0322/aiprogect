import type {
  DraftTimelineEvent,
  MeetingActionItem,
  MeetingDecision,
  MeetingFile,
  MeetingSummary,
  Participant,
  TranscriptSegment,
} from "../types/meeting";

export const sampleMeetingFiles: MeetingFile[] = [
  {
    id: "file-001",
    name: "2026-06-10_제품기획_주간회의.m4a",
    sizeLabel: "48.2 MB",
    durationLabel: "52:18",
    uploadedAt: "2026-06-10T09:02:00+09:00",
    status: "ready",
  },
  {
    id: "file-002",
    name: "2026-06-03_회의록자동정리_데모리뷰.wav",
    sizeLabel: "31.7 MB",
    durationLabel: "38:45",
    uploadedAt: "2026-06-03T14:18:00+09:00",
    status: "ready",
  },
];

export const sampleParticipants: Participant[] = [
  {
    id: "participant-001",
    name: "김민지",
    role: "프로덕트 매니저",
    speakerLabel: "SPEAKER_01",
    avatarInitial: "김",
  },
  {
    id: "participant-002",
    name: "이준호",
    role: "백엔드 엔지니어",
    speakerLabel: "SPEAKER_02",
    avatarInitial: "이",
  },
  {
    id: "participant-003",
    name: "박서연",
    role: "UX 디자이너",
    speakerLabel: "SPEAKER_03",
    avatarInitial: "박",
  },
  {
    id: "participant-004",
    name: "최현우",
    role: "QA 리드",
    speakerLabel: "SPEAKER_04",
    avatarInitial: "최",
  },
];

export const sampleTranscriptSegments: TranscriptSegment[] = [
  {
    id: "segment-001",
    participantId: "participant-001",
    speakerLabel: "SPEAKER_01",
    startTime: "00:00:12",
    endTime: "00:00:38",
    text: "오늘은 회의록 자동정리 워크스페이스의 샘플 데이터와 화면 흐름을 검증하는 것이 목표입니다. 업로드부터 요약·스크립트 확인까지 한 화면에서 상태를 추적할 수 있어야 합니다.",
  },
  {
    id: "segment-002",
    participantId: "participant-002",
    speakerLabel: "SPEAKER_02",
    startTime: "00:00:40",
    endTime: "00:01:05",
    text: "STT 변환과 화자 분리는 비동기로 처리되고, 각 단계별 진행 상태를 결과 패널 타임라인에 반영하는 구조로 가면 됩니다. API 연동 시 동일한 타입을 그대로 사용할 수 있게 설계하겠습니다.",
  },
  {
    id: "segment-003",
    participantId: "participant-003",
    speakerLabel: "SPEAKER_03",
    startTime: "00:01:08",
    endTime: "00:01:34",
    text: "좌측 패널에는 회의 파일과 참여자, 중앙에는 처리 상태와 업무 입력, 우측에는 요약본·스크립트·초안 타임라인을 배치하는 현재 3열 구조를 유지하면 됩니다.",
  },
  {
    id: "segment-004",
    participantId: "participant-004",
    speakerLabel: "SPEAKER_04",
    startTime: "00:01:36",
    endTime: "00:02:02",
    text: "검증 시나리오는 idle과 success 두 상태를 우선 확인하면 됩니다. success 상태에서는 요약, 결정 사항, 액션 아이템, 스크립트 세그먼트가 모두 채워져 있어야 합니다.",
  },
  {
    id: "segment-005",
    participantId: "participant-001",
    speakerLabel: "SPEAKER_01",
    startTime: "00:02:05",
    endTime: "00:02:28",
    text: "좋습니다. 이번 스프린트에서는 샘플 데이터 기반으로 UI 흐름을 먼저 검증하고, Integration 단계에서 패널 연결과 실제 API 교체를 진행합시다.",
  },
  {
    id: "segment-006",
    participantId: "participant-002",
    speakerLabel: "SPEAKER_02",
    startTime: "00:02:30",
    endTime: "00:02:55",
    text: "처리 상태는 uploading, stt_processing, speaker_waiting, draft_pending 순서로 표시하고, 완료 후 success로 전환되도록 상태 모델을 맞추겠습니다.",
  },
];

export const sampleMeetingSummary: MeetingSummary = {
  meetingTitle: "회의록 자동정리 워크스페이스 — 샘플 데이터 검증 회의",
  date: "2026-06-10",
  duration: "52분 18초",
  participantCount: 4,
  overview:
    "회의록 자동정리 서비스의 3열 워크스페이스에서 업로드·STT·화자 분리·초안 생성 흐름을 샘플 데이터로 검증하기 위한 기획·개발·QA 협의가 진행되었습니다. idle/success 상태 기준으로 좌·중·우 패널 데이터 연결 범위와 Integration 단계 일정이 확정되었습니다.",
  highlights: [
    "샘플 데이터는 API 교체 가능한 타입 구조로 유지",
    "결과 패널에 요약본·스크립트·초안 타임라인 동시 제공",
    "처리 단계별 상태는 conversion step과 draft timeline에 일관되게 반영",
    "Integration 단계에서 LeftPanel·CenterPanel·RightPanel 연결 예정",
  ],
};

export const sampleDecisions: MeetingDecision[] = [
  {
    id: "decision-001",
    summary: "샘플 데이터는 src/data/sampleData.ts 단일 소스로 관리한다.",
    rationale: "패널별 mock 중복을 방지하고 Integration 시 교체 지점을 명확히 하기 위함.",
    relatedSegmentIds: ["segment-002", "segment-005"],
  },
  {
    id: "decision-002",
    summary: "1차 검증 상태는 idle과 success 두 가지로 제한한다.",
    rationale: "처리 중 상태 UI는 후속 Task에서 conversion step 연동 시 확장.",
    relatedSegmentIds: ["segment-004"],
  },
  {
    id: "decision-003",
    summary: "App Shell 3열 레이아웃과 conversion step 헤더는 변경하지 않는다.",
    rationale: "foundation group 산출물을 보존하고 data group은 데이터 계층만 추가.",
    relatedSegmentIds: ["segment-003"],
  },
];

export const sampleActionItems: MeetingActionItem[] = [
  {
    id: "action-001",
    task: "sampleData.ts 타입·샘플 데이터 export 완료 및 data branch push",
    assigneeId: "participant-002",
    dueDate: "2026-06-13",
    status: "done",
  },
  {
    id: "action-002",
    task: "LeftPanel·RightPanel에 sampleData 연결 (Integration Action)",
    assigneeId: "participant-003",
    dueDate: "2026-06-17",
    status: "pending",
  },
  {
    id: "action-003",
    task: "success 상태 E2E 시나리오 — 요약·스크립트·타임라인 표시 QA",
    assigneeId: "participant-004",
    dueDate: "2026-06-18",
    status: "pending",
  },
  {
    id: "action-004",
    task: "실제 STT·화자 분리 API 스펙 초안 작성",
    assigneeId: "participant-002",
    dueDate: "2026-06-20",
    status: "in_progress",
  },
];

export const sampleDraftTimeline: DraftTimelineEvent[] = [
  {
    id: "upload",
    label: "파일 업로드",
    time: "09:02",
    status: "done",
  },
  {
    id: "stt",
    label: "STT 변환",
    time: "09:05",
    status: "done",
  },
  {
    id: "speaker",
    label: "화자 분리",
    time: "09:08",
    status: "done",
  },
  {
    id: "draft",
    label: "초안 생성",
    time: "09:12",
    status: "done",
  },
];
