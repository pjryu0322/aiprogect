import type { MeetingData, SampleScenario } from '../types';
import { getSampleMeetingData, listSampleScenarios } from '../sample';

export type MockScenario = SampleScenario;

const MOCK_PATH_MAP: Record<MockScenario, string> = {
  idle: '/mock-data/meeting-idle.json',
  uploading: '/mock-data/meeting-uploading.json',
  stt_processing: '/mock-data/meeting-stt-processing.json',
  speaker_waiting: '/mock-data/meeting-speaker-waiting.json',
  draft_pending: '/mock-data/meeting-draft-pending.json',
  success: '/mock-data/meeting-success.json',
};

export function getMockDataPath(scenario: MockScenario = 'success'): string {
  return MOCK_PATH_MAP[scenario];
}

export async function fetchMockMeetingData(
  scenario: MockScenario = 'success',
): Promise<MeetingData> {
  const response = await fetch(getMockDataPath(scenario));
  if (!response.ok) {
    throw new Error(`Failed to load mock data: ${scenario} (${response.status})`);
  }
  return response.json() as Promise<MeetingData>;
}

export function getMockMeetingDataSync(scenario: MockScenario = 'success'): MeetingData {
  return getSampleMeetingData(scenario);
}

export function listMockScenarios(): MockScenario[] {
  return listSampleScenarios();
}
