import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ConversionProgressMessage,
  DraftTimelineLoading,
  StageChipLoading,
} from '../../components/common/LoadingState';
import { WorkspaceRetryAction } from '../../components/common/RetryAction';
import type { ErrorScenario } from '../../components/common/ErrorState';
import { getMeetingDataSync } from '../../data/meetingDataProvider';
import type { ConversionStage, MeetingData, ProcessingStatus, SampleScenario } from '../../data/types';
import {
  PROCESSING_FLOW_STAGES,
  STAGE_PROCESSING_MESSAGES,
  hasActiveTimelineEntry,
  isActiveProcessingStage,
  resolveProcessingPhase,
  resolveStageIndex,
  resolveStageStatus,
  type ProcessingFlowContextValue,
  type ProcessingFlowPhase,
} from './ProcessingFlow.types';
import './ProcessingFlow.css';

const ProcessingFlowContext = createContext<ProcessingFlowContextValue | null>(null);

function useProcessingFlowContext(): ProcessingFlowContextValue {
  const context = useContext(ProcessingFlowContext);
  if (!context) {
    throw new Error('ProcessingFlow components must be used within ProcessingFlowProvider');
  }
  return context;
}

export function useProcessingFlow(): ProcessingFlowContextValue {
  return useProcessingFlowContext();
}

function resolveErrorScenario(stage: ConversionStage): ErrorScenario {
  return stage === 'uploading' ? 'upload' : 'conversion';
}

function applyStageError(data: MeetingData, message?: string): MeetingData {
  const { currentStage } = data.workspaceStatus;
  const errorMessage = message ?? `${STAGE_PROCESSING_MESSAGES[currentStage].replace('…', '')} 실패`;

  return {
    ...data,
    workspaceStatus: {
      ...data.workspaceStatus,
      stageStatus: 'error',
      message: errorMessage,
    },
    draftTimeline: data.draftTimeline.map((entry) =>
      entry.stage === currentStage
        ? { ...entry, status: 'error' as ProcessingStatus, message: errorMessage }
        : entry,
    ),
  };
}

function applyStageRetry(data: MeetingData): MeetingData {
  const { currentStage } = data.workspaceStatus;

  return {
    ...data,
    workspaceStatus: {
      ...data.workspaceStatus,
      stageStatus: 'processing',
      message: STAGE_PROCESSING_MESSAGES[currentStage],
    },
    draftTimeline: data.draftTimeline.map((entry) =>
      entry.stage === currentStage
        ? {
            ...entry,
            status: 'processing' as ProcessingStatus,
            message: STAGE_PROCESSING_MESSAGES[currentStage],
          }
        : entry,
    ),
  };
}

function applyStageComplete(data: MeetingData): MeetingData {
  const { currentStage } = data.workspaceStatus;
  const currentIndex = resolveStageIndex(currentStage);
  const nextStage = PROCESSING_FLOW_STAGES[currentIndex + 1]?.id;

  if (!nextStage) {
    return {
      ...data,
      workspaceStatus: {
        currentStage: 'complete',
        stageStatus: 'success',
        progressPercent: 100,
        message: STAGE_PROCESSING_MESSAGES.complete,
      },
      draftTimeline: data.draftTimeline.map((entry) =>
        entry.stage === currentStage
          ? { ...entry, status: 'success' as ProcessingStatus, message: '완료' }
          : entry,
      ),
    };
  }

  return getMeetingDataSync(
    nextStage as SampleScenario,
  );
}

export interface ProcessingFlowProviderProps {
  children: ReactNode;
  meetingData?: MeetingData;
  initialScenario?: SampleScenario;
  onMeetingDataChange?: (data: MeetingData) => void;
  onPhaseChange?: (phase: ProcessingFlowPhase) => void;
}

export function ProcessingFlowProvider({
  children,
  meetingData: controlledMeetingData,
  initialScenario = 'uploading',
  onMeetingDataChange,
  onPhaseChange,
}: ProcessingFlowProviderProps) {
  const [internalMeetingData, setInternalMeetingData] = useState<MeetingData>(() =>
    getMeetingDataSync(initialScenario),
  );
  const [retrying, setRetrying] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meetingData = controlledMeetingData ?? internalMeetingData;
  const phase = resolveProcessingPhase(meetingData);

  const updateMeetingData = useCallback(
    (updater: MeetingData | ((previous: MeetingData) => MeetingData)) => {
      const nextData =
        typeof updater === 'function'
          ? updater(controlledMeetingData ?? internalMeetingData)
          : updater;

      if (!controlledMeetingData) {
        setInternalMeetingData(nextData);
      }
      onMeetingDataChange?.(nextData);
    },
    [controlledMeetingData, internalMeetingData, onMeetingDataChange],
  );

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [onPhaseChange, phase]);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  const setMeetingData = useCallback(
    (data: MeetingData) => {
      updateMeetingData(data);
    },
    [updateMeetingData],
  );

  const loadScenario = useCallback(
    (scenario: SampleScenario) => {
      updateMeetingData(getMeetingDataSync(scenario));
    },
    [updateMeetingData],
  );

  const markStageError = useCallback(
    (message?: string) => {
      updateMeetingData((previous) => applyStageError(previous, message));
    },
    [updateMeetingData],
  );

  const markStageComplete = useCallback(() => {
    updateMeetingData((previous) => applyStageComplete(previous));
  }, [updateMeetingData]);

  const retryCurrentStage = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
    }

    setRetrying(true);
    retryTimerRef.current = setTimeout(() => {
      updateMeetingData((previous) => applyStageRetry(previous));
      setRetrying(false);
      retryTimerRef.current = null;
    }, 500);
  }, [updateMeetingData]);

  const reset = useCallback(() => {
    setRetrying(false);
    updateMeetingData(getMeetingDataSync('idle'));
  }, [updateMeetingData]);

  const value = useMemo<ProcessingFlowContextValue>(
    () => ({
      meetingData,
      retrying,
      phase,
      setMeetingData,
      loadScenario,
      markStageError,
      markStageComplete,
      retryCurrentStage,
      reset,
    }),
    [
      loadScenario,
      markStageComplete,
      markStageError,
      meetingData,
      phase,
      reset,
      retryCurrentStage,
      retrying,
      setMeetingData,
    ],
  );

  return (
    <ProcessingFlowContext.Provider value={value}>{children}</ProcessingFlowContext.Provider>
  );
}

export interface ProcessingFlowWorkspaceProps {
  className?: string;
  children?: ReactNode;
}

export function ProcessingFlowWorkspace({ className = '', children }: ProcessingFlowWorkspaceProps) {
  const { meetingData, retrying, phase, retryCurrentStage } = useProcessingFlowContext();
  const { workspaceStatus } = meetingData;
  const isProcessing = isActiveProcessingStage(meetingData);
  const isError = phase === 'error';
  const isComplete = phase === 'complete';

  return (
    <div className={`processing-flow-workspace${className ? ` ${className}` : ''}`}>
      <div className="processing-flow-workspace-body">
        <WorkspaceRetryAction
          stageStatus={workspaceStatus.stageStatus}
          scenario={resolveErrorScenario(workspaceStatus.currentStage)}
          message={workspaceStatus.message}
          onRetry={retryCurrentStage}
          retrying={retrying}
        >
          <ConversionProgressMessage
            loading={isProcessing}
            message={workspaceStatus.message}
            progressPercent={workspaceStatus.progressPercent}
          >
            {isComplete ? (
              <div className="processing-flow-complete" role="status" aria-live="polite">
                <p className="processing-flow-complete__title">변환 완료</p>
                <p className="processing-flow-complete__message">{workspaceStatus.message}</p>
              </div>
            ) : isError ? null : (
              children
            )}
          </ConversionProgressMessage>
        </WorkspaceRetryAction>
      </div>
    </div>
  );
}

export interface ProcessingFlowStageChipsProps {
  className?: string;
}

export function ProcessingFlowStageChips({ className = '' }: ProcessingFlowStageChipsProps) {
  const { meetingData } = useProcessingFlowContext();
  const { currentStage } = meetingData.workspaceStatus;
  const isFlowComplete = currentStage === 'complete';
  const currentIndex = isFlowComplete
    ? PROCESSING_FLOW_STAGES.length
    : resolveStageIndex(currentStage);

  return (
    <nav
      className={`processing-flow-stage-chips${className ? ` ${className}` : ''}`}
      aria-label="변환 단계"
    >
      {PROCESSING_FLOW_STAGES.map((stage, index) => {
        const stageStatus = resolveStageStatus(stage.id, meetingData);
        const isActive = !isFlowComplete && stage.id === currentStage;
        const isProcessing = isActive && stageStatus === 'processing';
        const isComplete = isFlowComplete || currentIndex > index || stageStatus === 'success';
        const chipClassName = [
          'processing-flow-stage-chip',
          stageStatus === 'error'
            ? 'processing-flow-stage-chip--error'
            : isComplete
              ? 'processing-flow-stage-chip--complete'
              : isActive
                ? 'processing-flow-stage-chip--active'
                : 'processing-flow-stage-chip--idle',
        ].join(' ');

        return (
          <span
            key={stage.id}
            className={chipClassName}
            aria-current={isActive ? 'step' : undefined}
            data-stage-status={stageStatus}
          >
            {stage.label}
            {isProcessing ? <StageChipLoading loading label={`${stage.label} 처리 중`} /> : null}
          </span>
        );
      })}
    </nav>
  );
}

export interface ProcessingFlowDraftTimelineProps {
  className?: string;
  emptyMessage?: string;
}

export function ProcessingFlowDraftTimeline({
  className = '',
  emptyMessage = '초안 생성 단계별 진행 이력이 여기에 표시됩니다.',
}: ProcessingFlowDraftTimelineProps) {
  const { meetingData, phase, retrying, retryCurrentStage } = useProcessingFlowContext();
  const { draftTimeline, workspaceStatus } = meetingData;
  const hasEntries = draftTimeline.length > 0;
  const hasActiveEntry = hasActiveTimelineEntry(meetingData);
  const isError = phase === 'error';

  return (
    <div className={`processing-flow-draft-timeline${className ? ` ${className}` : ''}`}>
      <WorkspaceRetryAction
        stageStatus={isError ? 'error' : 'idle'}
        scenario={resolveErrorScenario(workspaceStatus.currentStage)}
        variant="timeline"
        message={workspaceStatus.message}
        onRetry={retryCurrentStage}
        retrying={retrying}
      >
        <DraftTimelineLoading
          loading={hasEntries}
          entries={draftTimeline}
          message={
            hasActiveEntry
              ? workspaceStatus.message
              : '초안 생성 단계별 진행 이력입니다.'
          }
        >
          <p className="processing-flow-draft-timeline__placeholder">{emptyMessage}</p>
        </DraftTimelineLoading>
      </WorkspaceRetryAction>
    </div>
  );
}

export interface ProcessingFlowProps extends ProcessingFlowProviderProps {
  className?: string;
}

export function ProcessingFlow({ children, className = '', ...providerProps }: ProcessingFlowProps) {
  return (
    <ProcessingFlowProvider {...providerProps}>
      <div className={className}>{children}</div>
    </ProcessingFlowProvider>
  );
}

export type {
  ProcessingFlowActions,
  ProcessingFlowContextValue,
  ProcessingFlowPhase,
  ProcessingFlowStageDefinition,
  ProcessingFlowState,
} from './ProcessingFlow.types';

export {
  PROCESSING_FLOW_STAGES,
  STAGE_PROCESSING_MESSAGES,
  hasActiveTimelineEntry,
  isActiveProcessingStage,
  resolveProcessingPhase,
  resolveStageIndex,
  resolveStageStatus,
} from './ProcessingFlow.types';
