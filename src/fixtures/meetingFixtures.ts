import { getMeetingDataSync } from '../data/meetingDataProvider';
import {
  sampleActionItems,
  sampleDecisions,
  sampleDraftTimeline,
  sampleMeetingFiles,
  sampleMeetingSummary,
  sampleParticipants,
  sampleTranscriptSegments,
} from '../data/sampleData';
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
export const uploadingMeetingFixture = createMeetingFixture('uploading');
export const sttProcessingMeetingFixture = createMeetingFixture('stt_processing');
export const speakerWaitingMeetingFixture = createMeetingFixture('speaker_waiting');
export const draftPendingMeetingFixture = createMeetingFixture('draft_pending');
export const successMeetingFixture = createMeetingFixture('success');

export function assertAllFixtures(): { scenario: SampleScenario; valid: boolean }[] {
  return FIXTURE_SCENARIOS.map((scenario) => ({
    scenario,
    valid: assertMeetingDataShape(createMeetingFixture(scenario)),
  }));
}

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

export function assertSampleDataExports(): boolean {
  return (
    sampleMeetingFiles.length > 0 &&
    sampleParticipants.length > 0 &&
    sampleTranscriptSegments.length > 0 &&
    sampleMeetingSummary.decisions.length === sampleDecisions.length &&
    sampleMeetingSummary.actionItems.length === sampleActionItems.length &&
    sampleDraftTimeline.length > 0
  );
}

export function assertSuccessFixtureMatchesSampleData(): boolean {
  const success = createMeetingFixture('success');
  return (
    success.files.length === sampleMeetingFiles.length &&
    success.participants.length === sampleParticipants.length &&
    success.script.length === sampleTranscriptSegments.length &&
    success.summary?.title === sampleMeetingSummary.title &&
    success.draftTimeline.length === sampleDraftTimeline.length
  );
}
