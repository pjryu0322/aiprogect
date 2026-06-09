import type { MeetingData, SampleScenario } from '../types';
import { meetingIdle } from './meetingIdle';
import { meetingSuccess } from './meetingSuccess';

export { meetingIdle } from './meetingIdle';
export { meetingSuccess } from './meetingSuccess';

const SAMPLE_REGISTRY: Record<SampleScenario, MeetingData> = {
  idle: meetingIdle,
  success: meetingSuccess,
  uploading: {
    ...meetingIdle,
    files: [
      {
        id: 'file-uploading-001',
        name: '팀-스탠드업-0608.m4a',
        sizeBytes: 12_456_789,
        durationSeconds: 1800,
        format: 'm4a',
        uploadedAt: '2026-06-08T10:00:00+09:00',
      },
    ],
    workspaceStatus: {
      currentStage: 'uploading',
      stageStatus: 'processing',
      progressPercent: 65,
      message: '녹취 파일을 업로드하는 중입니다…',
    },
    draftTimeline: [
      {
        id: 'tl-upload-01',
        stage: 'uploading',
        status: 'processing',
        timestamp: '2026-06-08T10:00:05+09:00',
        message: '파일 업로드 진행 중 (65%)',
      },
    ],
  },
  stt_processing: {
    ...meetingSuccess,
    participants: [],
    script: [],
    summary: null,
    workspaceStatus: {
      currentStage: 'stt_processing',
      stageStatus: 'processing',
      progressPercent: 40,
      message: '음성을 텍스트로 변환하는 중입니다…',
    },
    draftTimeline: [
      {
        id: 'tl-stt-01',
        stage: 'uploading',
        status: 'success',
        timestamp: '2026-06-08T10:00:12+09:00',
        message: '녹취 파일 업로드 완료',
      },
      {
        id: 'tl-stt-02',
        stage: 'stt_processing',
        status: 'processing',
        timestamp: '2026-06-08T10:01:00+09:00',
        message: 'STT 변환 진행 중 (40%)',
      },
    ],
  },
  speaker_waiting: {
    ...meetingSuccess,
    participants: [
      { id: 'p-01', name: '화자 1', role: '미확인', speakerLabel: '화자 1' },
      { id: 'p-02', name: '화자 2', role: '미확인', speakerLabel: '화자 2' },
      { id: 'p-03', name: '화자 3', role: '미확인', speakerLabel: '화자 3' },
    ],
    script: meetingSuccess.script.map((seg) => ({
      ...seg,
      speakerName:
        meetingSuccess.participants.find((p) => p.id === seg.speakerId)?.speakerLabel ??
        seg.speakerName,
    })),
    summary: null,
    workspaceStatus: {
      currentStage: 'speaker_waiting',
      stageStatus: 'processing',
      progressPercent: 70,
      message: '화자를 분리하고 참여자를 매칭하는 중입니다…',
    },
    draftTimeline: [
      {
        id: 'tl-spk-01',
        stage: 'uploading',
        status: 'success',
        timestamp: '2026-06-08T10:00:12+09:00',
        message: '녹취 파일 업로드 완료',
      },
      {
        id: 'tl-spk-02',
        stage: 'stt_processing',
        status: 'success',
        timestamp: '2026-06-08T10:02:45+09:00',
        message: 'STT 변환 완료',
      },
      {
        id: 'tl-spk-03',
        stage: 'speaker_waiting',
        status: 'processing',
        timestamp: '2026-06-08T10:03:10+09:00',
        message: '화자 분리 진행 중 (70%)',
      },
    ],
  },
  draft_pending: {
    ...meetingSuccess,
    summary: null,
    workspaceStatus: {
      currentStage: 'draft_pending',
      stageStatus: 'processing',
      progressPercent: 85,
      message: '회의록 초안을 생성하는 중입니다…',
    },
    draftTimeline: [
      {
        id: 'tl-dft-01',
        stage: 'uploading',
        status: 'success',
        timestamp: '2026-06-08T10:00:12+09:00',
        message: '녹취 파일 업로드 완료',
      },
      {
        id: 'tl-dft-02',
        stage: 'stt_processing',
        status: 'success',
        timestamp: '2026-06-08T10:02:45+09:00',
        message: 'STT 변환 완료',
      },
      {
        id: 'tl-dft-03',
        stage: 'speaker_waiting',
        status: 'success',
        timestamp: '2026-06-08T10:05:30+09:00',
        message: '화자 분리 완료',
      },
      {
        id: 'tl-dft-04',
        stage: 'draft_pending',
        status: 'processing',
        timestamp: '2026-06-08T10:06:00+09:00',
        message: '회의록 초안 생성 중 (85%)',
      },
    ],
  },
};

export function getSampleMeetingData(scenario: SampleScenario = 'success'): MeetingData {
  return structuredClone(SAMPLE_REGISTRY[scenario]);
}

export function listSampleScenarios(): SampleScenario[] {
  return Object.keys(SAMPLE_REGISTRY) as SampleScenario[];
}
