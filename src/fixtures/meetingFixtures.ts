import { getMeetingDataSync } from '../data/meetingDataProvider';
import type { MeetingData, SampleScenario } from '../data/types';

export const FIXTURE_SCENARIOS: SampleScenario[] = [
  'idle',
  'uploading',
  'stt_processing',
  'speaker_waiting',
  'draft_pending',
  'success',
];

export function createMeetingFixture(scenario: SampleScenario): MeetingData {
  return getMeetingDataSync(scenario);
}

export const idleMeetingFixture = createMeetingFixture('idle');
export const successMeetingFixture = createMeetingFixture('success');

export function assertMeetingDataShape(data: MeetingData): boolean {
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    Array.isArray(data.files) &&
    Array.isArray(data.participants) &&
    Array.isArray(data.script) &&
    (data.summary === null || typeof data.summary === 'object') &&
    typeof data.workspaceStatus === 'object' &&
    Array.isArray(data.draftTimeline)
  );
}
