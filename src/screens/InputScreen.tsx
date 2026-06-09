import { useEffect, useMemo, type ReactNode } from 'react';
import {
  MeetingInputFlow,
  useMeetingInputFlow,
} from '../features/input/MeetingInputFlow';
import type { MeetingInputPayload } from '../features/input/MeetingInputFlow.types';
import {
  MeetingFilesBlock,
  WorkspaceInputBar,
  WorkspacePanel,
} from '../components/screens/input';
import { useFileDurations } from '../components/screens/input/useFileDurations';
import {
  mapFlowStatusToInputScreenStatus,
  type InputScreenProps,
  type InputScreenSlotProps,
} from './InputScreen.types';
import './InputScreen.css';

function InputScreenStatusBridge({
  onStatusChange,
  children,
}: {
  onStatusChange?: InputScreenProps['onStatusChange'];
  children: ReactNode;
}) {
  const { status, files } = useMeetingInputFlow();
  const { isReadingMetadata } = useFileDurations(files);
  const screenStatus = useMemo(
    () => mapFlowStatusToInputScreenStatus(status, isReadingMetadata),
    [isReadingMetadata, status],
  );

  useEffect(() => {
    onStatusChange?.(screenStatus);
  }, [onStatusChange, screenStatus]);

  return <>{children}</>;
}

function InputScreenDefaultLayout() {
  const { status, files } = useMeetingInputFlow();
  const { isReadingMetadata } = useFileDurations(files);
  const screenStatus = mapFlowStatusToInputScreenStatus(status, isReadingMetadata);

  return (
    <div className="input-screen-layout input-screen-layout--preview">
      <aside className="input-screen-layout__left" aria-label="회의 파일">
        <MeetingFilesBlock screenStatus={screenStatus} />
      </aside>

      <div className="input-screen-layout__center">
        <div className="input-screen-layout__workspace">
          <WorkspacePanel />
        </div>
        <WorkspaceInputBar />
      </div>
    </div>
  );
}

export function InputScreenMeetingFiles({
  showHeading = false,
  ...props
}: InputScreenSlotProps & { showHeading?: boolean }) {
  const { status, files } = useMeetingInputFlow();
  const { isReadingMetadata } = useFileDurations(files);
  const screenStatus = mapFlowStatusToInputScreenStatus(status, isReadingMetadata);

  return <MeetingFilesBlock {...props} screenStatus={screenStatus} showHeading={showHeading} />;
}

export function InputScreenWorkspace(props: InputScreenSlotProps) {
  return <WorkspacePanel {...props} />;
}

export function InputScreenWorkspaceInputBar(
  props: InputScreenSlotProps & {
    placeholder?: string;
    submitLabel?: string;
  },
) {
  return <WorkspaceInputBar {...props} />;
}

export function InputScreen({
  className = '',
  onStatusChange,
  onReady,
  children,
}: InputScreenProps & { children?: ReactNode }) {
  return (
    <MeetingInputFlow
      className={`input-screen${className ? ` ${className}` : ''}`}
      onReady={onReady}
    >
      <InputScreenStatusBridge onStatusChange={onStatusChange}>
        {children ?? <InputScreenDefaultLayout />}
      </InputScreenStatusBridge>
    </MeetingInputFlow>
  );
}

export type { InputScreenProps, InputScreenSlotProps, InputScreenStatus } from './InputScreen.types';
export type { MeetingInputPayload };
