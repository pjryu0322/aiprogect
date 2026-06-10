import { useState } from 'react';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import '../styles/workspace.css';

export type ConversionStage =
  | 'uploading'
  | 'stt_processing'
  | 'speaker_waiting'
  | 'draft_pending'
  | 'complete';

const STAGES: { id: ConversionStage; label: string }[] = [
  { id: 'uploading', label: '업로드' },
  { id: 'stt_processing', label: 'STT 변환' },
  { id: 'speaker_waiting', label: '화자 분리' },
  { id: 'draft_pending', label: '초안 생성' },
];

type MobilePanel = 'left' | 'center' | 'right';

const MOBILE_TABS: { id: MobilePanel; label: string }[] = [
  { id: 'left', label: '회의 파일' },
  { id: 'center', label: '작업 공간' },
  { id: 'right', label: '결과' },
];

interface WorkspaceShellProps {
  currentStage?: ConversionStage;
}

export function WorkspaceShell({ currentStage = 'uploading' }: WorkspaceShellProps) {
  const [activeMobilePanel, setActiveMobilePanel] = useState<MobilePanel>('center');

  const stageIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <h1 className="workspace-title">회의 분석 워크스페이스</h1>
        <nav className="stage-chips" aria-label="변환 단계">
          {STAGES.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isComplete = stageIndex > index || currentStage === 'complete';
            return (
              <span
                key={stage.id}
                className={`stage-chip${isActive ? ' stage-chip--active' : ''}${isComplete ? ' stage-chip--complete' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {stage.label}
              </span>
            );
          })}
        </nav>
      </header>

      <nav className="mobile-panel-tabs" aria-label="패널 전환">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`mobile-panel-tab${activeMobilePanel === tab.id ? ' mobile-panel-tab--active' : ''}`}
            onClick={() => setActiveMobilePanel(tab.id)}
            aria-selected={activeMobilePanel === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="workspace-panels">
        <aside
          className={`workspace-panel workspace-panel--left${activeMobilePanel === 'left' ? ' workspace-panel--mobile-active' : ''}`}
          aria-label="회의 파일 및 참여자"
        >
          <LeftPanel />
        </aside>

        <main
          className={`workspace-panel workspace-panel--center${activeMobilePanel === 'center' ? ' workspace-panel--mobile-active' : ''}`}
          aria-label="작업 공간"
        >
          <CenterPanel />
        </main>

        <aside
          className={`workspace-panel workspace-panel--right${activeMobilePanel === 'right' ? ' workspace-panel--mobile-active' : ''}`}
          aria-label="결과 패널"
        >
          <RightPanel />
        </aside>
      </div>
    </div>
  );
}
