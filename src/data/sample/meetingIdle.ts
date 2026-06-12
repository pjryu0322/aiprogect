import type { MeetingData } from '../types';
import { sampleWorkspaceStatusIdle } from '../sampleData';

export const meetingIdle: MeetingData = {
  id: 'meeting-empty',
  title: '새 회의',
  files: [],
  participants: [],
  script: [],
  summary: null,
  workspaceStatus: sampleWorkspaceStatusIdle,
  draftTimeline: [],
};
