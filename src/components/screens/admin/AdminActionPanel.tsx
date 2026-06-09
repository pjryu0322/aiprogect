import type { AdminMeetingRecord, AdminScreenActions, AdminScreenStatus } from './AdminScreen.types';
import { STAGE_LABELS, STATUS_LABELS } from './AdminScreen.types';
import './admin.css';

export interface AdminActionPanelProps extends AdminScreenActions {
  selectedRecord: AdminMeetingRecord | null;
  screenStatus: AdminScreenStatus;
  className?: string;
}

export function AdminActionPanel({
  selectedRecord,
  screenStatus,
  onReprocess,
  onConfirm,
  onStatusChange,
  onRefresh,
  className = '',
}: AdminActionPanelProps) {
  const isLoading = screenStatus === 'loading';
  const hasSelection = selectedRecord !== null;
  const canReprocess =
    hasSelection &&
    (selectedRecord.stageStatus === 'error' ||
      selectedRecord.currentStage === 'complete');
  const canConfirm =
    hasSelection &&
    selectedRecord.currentStage === 'complete' &&
    selectedRecord.stageStatus === 'success' &&
    selectedRecord.hasSummary;
  const canMarkError = hasSelection && selectedRecord.stageStatus !== 'error';

  return (
    <section
      className={`admin-action-panel${className ? ` ${className}` : ''}`}
      aria-labelledby="admin-action-heading"
    >
      <div className="admin-action-panel__header">
        <h2 id="admin-action-heading" className="admin-section-title">
          보조 행동
        </h2>
        <button
          type="button"
          className="admin-action-panel__refresh"
          onClick={() => onRefresh?.()}
          disabled={isLoading}
        >
          {isLoading ? '갱신 중…' : '목록 갱신'}
        </button>
      </div>

      {!hasSelection ? (
        <p className="admin-action-panel__placeholder" role="status">
          목록에서 회의 항목을 선택하면 재처리, 확인, 상태 변경 행동을 연결할 수 있습니다.
        </p>
      ) : (
        <div className="admin-action-panel__body">
          <div className="admin-action-panel__selection">
            <p className="admin-action-panel__selection-title">{selectedRecord.title}</p>
            <p className="admin-action-panel__selection-meta">
              {STAGE_LABELS[selectedRecord.currentStage]} ·{' '}
              {STATUS_LABELS[selectedRecord.stageStatus]}
            </p>
          </div>

          <div className="admin-action-panel__actions" role="group" aria-label="관리 행동">
            <button
              type="button"
              className="admin-action-panel__action admin-action-panel__action--secondary"
              onClick={() => onReprocess?.(selectedRecord.id)}
              disabled={isLoading || !canReprocess || !onReprocess}
              aria-disabled={isLoading || !canReprocess || !onReprocess}
            >
              재처리
            </button>
            <button
              type="button"
              className="admin-action-panel__action admin-action-panel__action--primary"
              onClick={() => onConfirm?.(selectedRecord.id)}
              disabled={isLoading || !canConfirm || !onConfirm}
              aria-disabled={isLoading || !canConfirm || !onConfirm}
            >
              결과 확인
            </button>
            <button
              type="button"
              className="admin-action-panel__action admin-action-panel__action--danger"
              onClick={() => onStatusChange?.(selectedRecord.id, 'error')}
              disabled={isLoading || !canMarkError || !onStatusChange}
              aria-disabled={isLoading || !canMarkError || !onStatusChange}
            >
              오류 상태로 표시
            </button>
          </div>

          <p className="admin-action-panel__hint" role="note">
            보조 행동은 선택된 회의에만 적용되며, 기존 작업 공간·결과 패널 흐름과 독립적으로
            동작합니다.
          </p>
        </div>
      )}
    </section>
  );
}
