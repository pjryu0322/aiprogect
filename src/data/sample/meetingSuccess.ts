import type { MeetingData } from '../types';
import {
  sampleDraftTimeline,
  sampleMeetingFiles,
  sampleMeetingSummary,
  sampleParticipants,
  sampleTranscriptSegments,
  sampleWorkspaceStatusSuccess,
} from '../sampleData';

export const meetingSuccess: MeetingData = {
  id: 'meeting-2026-q1-planning',
  title: '2026 Q1 제품 기획 회의',
  files: sampleMeetingFiles,
  participants: sampleParticipants,
  script: sampleTranscriptSegments,
  summary: sampleMeetingSummary,
  workspaceStatus: sampleWorkspaceStatusSuccess,
  draftTimeline: sampleDraftTimeline,
};
