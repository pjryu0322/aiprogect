import { fetchMockMeetingData, getMockMeetingDataSync } from './mock';
import { getSampleMeetingData, listSampleScenarios } from './sample';
import type {
  DataSource,
  MeetingData,
  MeetingDataProviderOptions,
  SampleScenario,
} from './types';

export type { MeetingData, MeetingDataProviderOptions, SampleScenario } from './types';
export { listSampleScenarios } from './sample';

const DEFAULT_OPTIONS: Required<MeetingDataProviderOptions> = {
  source: 'sample',
  apiBaseUrl: '/api',
};

let providerOptions: Required<MeetingDataProviderOptions> = { ...DEFAULT_OPTIONS };

export function configureMeetingDataProvider(
  options: MeetingDataProviderOptions,
): void {
  providerOptions = { ...providerOptions, ...options };
}

export function getMeetingDataProviderConfig(): Required<MeetingDataProviderOptions> {
  return { ...providerOptions };
}

async function fetchApiMeetingData(
  scenario: SampleScenario,
  apiBaseUrl: string,
): Promise<MeetingData> {
  const response = await fetch(`${apiBaseUrl}/meetings/${scenario}`);
  if (!response.ok) {
    throw new Error(`API meeting data unavailable: ${scenario} (${response.status})`);
  }
  return response.json() as Promise<MeetingData>;
}

export function getMeetingDataSync(scenario: SampleScenario = 'success'): MeetingData {
  const { source } = providerOptions;

  switch (source) {
    case 'mock':
      return getMockMeetingDataSync(scenario);
    case 'api':
      throw new Error('Use getMeetingData() for API source');
    case 'sample':
    default:
      return getSampleMeetingData(scenario);
  }
}

export async function getMeetingData(
  scenario: SampleScenario = 'success',
): Promise<MeetingData> {
  const { source, apiBaseUrl } = providerOptions;

  switch (source) {
    case 'mock':
      return fetchMockMeetingData(scenario);
    case 'api':
      return fetchApiMeetingData(scenario, apiBaseUrl);
    case 'sample':
    default:
      return getSampleMeetingData(scenario);
  }
}

export function resolveConversionStage(data: MeetingData): MeetingData['workspaceStatus']['currentStage'] {
  return data.workspaceStatus.currentStage;
}

export function isProcessingComplete(data: MeetingData): boolean {
  return data.workspaceStatus.stageStatus === 'success' && data.workspaceStatus.currentStage === 'complete';
}

export function isIdleState(data: MeetingData): boolean {
  return data.workspaceStatus.stageStatus === 'idle';
}

export function getDataSource(): DataSource {
  return providerOptions.source;
}
