import { MeetingInputFlowWorkspaceInputBar } from '../../../features/input/MeetingInputFlow';
import type { InputScreenSlotProps } from '../../../screens/InputScreen.types';
import './inputScreen.css';

export interface WorkspaceInputBarProps extends InputScreenSlotProps {
  placeholder?: string;
  submitLabel?: string;
}

export function WorkspaceInputBar({
  className = '',
  placeholder = '메시지 또는 지시를 입력하세요…',
  submitLabel = '전송',
}: WorkspaceInputBarProps) {
  return (
    <footer
      className={`input-screen-input-bar${className ? ` ${className}` : ''}`}
      aria-label="입력"
    >
      <MeetingInputFlowWorkspaceInputBar
        className="input-screen-input-bar-inner"
        placeholder={placeholder}
        submitLabel={submitLabel}
      />
    </footer>
  );
}
