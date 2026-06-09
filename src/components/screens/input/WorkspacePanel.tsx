import {
  MeetingInputFlowWorkspace,
  useMeetingInputFlow,
} from '../../../features/input/MeetingInputFlow';
import type { InputScreenSlotProps } from '../../../screens/InputScreen.types';
import './inputScreen.css';

export function WorkspacePanel({ className = '' }: InputScreenSlotProps) {
  const { status } = useMeetingInputFlow();

  return (
    <section
      className={`input-screen-workspace${className ? ` ${className}` : ''}`}
      aria-labelledby="input-screen-workspace-heading"
      data-input-status={status}
    >
      <h2 id="input-screen-workspace-heading" className="visually-hidden">
        작업 공간
      </h2>
      <div className="input-screen-workspace-canvas">
        <MeetingInputFlowWorkspace />
      </div>
    </section>
  );
}
