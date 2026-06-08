import type { FormEvent, ReactNode } from 'react';
import { Spinner } from './LoadingState';
import {
  type DraftSaveState,
  useTemporarySave,
  type TemporarySaveOptions,
} from './TemporarySaveHelper';
import './DraftSaveStatus.css';

export type DraftSaveStatusVariant = 'workspace' | 'panel' | 'inline' | 'actions';

export interface DraftSaveStatusProps {
  state: DraftSaveState;
  lastSavedAt?: string | null;
  errorMessage?: string | null;
  hasUnsavedChanges?: boolean;
  variant?: DraftSaveStatusVariant;
  onSaveNow?: () => void;
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
}

function formatSavedAt(savedAt: string): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return savedAt;
  }

  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveStatusMessage(
  state: DraftSaveState,
  hasUnsavedChanges: boolean,
  errorMessage: string | null,
): { message: string; meta?: string } {
  if (state === 'saving') {
    return { message: '임시 저장 중…' };
  }

  if (state === 'saved' && !hasUnsavedChanges) {
    return { message: '임시 저장됨' };
  }

  if (state === 'error') {
    return {
      message: '임시 저장에 실패했습니다',
      meta: errorMessage ?? '브라우저 저장소를 확인한 뒤 다시 시도해 주세요.',
    };
  }

  return {
    message: hasUnsavedChanges ? '작성 중 (저장 대기)' : '작성 중',
    meta: '입력 내용은 자동으로 임시 저장됩니다.',
  };
}

export function DraftSaveStatus({
  state,
  lastSavedAt = null,
  errorMessage = null,
  hasUnsavedChanges = false,
  variant = 'workspace',
  onSaveNow,
  onRetry,
  onClear,
  className = '',
}: DraftSaveStatusProps) {
  const { message, meta } = resolveStatusMessage(state, hasUnsavedChanges, errorMessage);
  const showSaveNow = Boolean(onSaveNow) && (state === 'draft' || hasUnsavedChanges);
  const showRetry = Boolean(onRetry) && state === 'error';
  const showClear = Boolean(onClear) && state !== 'saving';
  const showActions = showSaveNow || showRetry || showClear;

  return (
    <div
      className={`draft-save-status draft-save-status--${variant} draft-save-status--${state}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={state === 'saving' ? true : undefined}
      data-draft-save-state={state}
    >
      <span className="draft-save-status__indicator" aria-hidden="true">
        {state === 'saving' ? (
          <Spinner size="sm" label="임시 저장 중" />
        ) : (
          <span className="draft-save-status__dot" />
        )}
      </span>

      <div className="draft-save-status__body">
        <p className="draft-save-status__message">{message}</p>
        {state === 'saved' && lastSavedAt && !hasUnsavedChanges ? (
          <p className="draft-save-status__meta">마지막 저장: {formatSavedAt(lastSavedAt)}</p>
        ) : meta ? (
          <p className="draft-save-status__meta">{meta}</p>
        ) : null}
      </div>

      {showActions ? (
        <div className="draft-save-status__actions">
          {showSaveNow ? (
            <button type="button" className="draft-save-status__button draft-save-status__button--primary" onClick={onSaveNow}>
              지금 저장
            </button>
          ) : null}
          {showRetry ? (
            <button type="button" className="draft-save-status__button draft-save-status__button--primary" onClick={onRetry}>
              다시 저장
            </button>
          ) : null}
          {showClear ? (
            <button type="button" className="draft-save-status__button" onClick={onClear}>
              초안 삭제
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export interface DraftSaveActionButtonsProps {
  state: DraftSaveState;
  hasUnsavedChanges?: boolean;
  onSaveNow?: () => void;
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
}

/** 상태별 액션 버튼 영역 (저장·재시도·초안 삭제). */
export function DraftSaveActionButtons({
  state,
  hasUnsavedChanges = false,
  onSaveNow,
  onRetry,
  onClear,
  className = '',
}: DraftSaveActionButtonsProps) {
  return (
    <DraftSaveStatus
      state={state}
      hasUnsavedChanges={hasUnsavedChanges}
      variant="actions"
      onSaveNow={onSaveNow}
      onRetry={onRetry}
      onClear={onClear}
      className={className}
    />
  );
}

/** 중앙 작업 공간 상태 메시지 영역용 임시 저장 표시. */
export function WorkspaceDraftSaveStatus(props: Omit<DraftSaveStatusProps, 'variant'>) {
  return <DraftSaveStatus {...props} variant="workspace" />;
}

/** 결과 패널 상태 영역용 임시 저장 표시. */
export function ResultPanelDraftSaveStatus(props: Omit<DraftSaveStatusProps, 'variant'>) {
  return <DraftSaveStatus {...props} variant="panel" />;
}

export interface WorkspaceDraftInputBarProps extends TemporarySaveOptions {
  placeholder?: string;
  submitLabel?: string;
  onSubmit?: (value: string) => void;
  className?: string;
  children?: ReactNode;
}

/**
 * 작업 공간 입력 바와 임시 저장 흐름을 연동합니다.
 * CenterPanel 입력 영역 대체용 컴포넌트입니다.
 */
export function WorkspaceDraftInputBar({
  scope,
  meetingId,
  debounceMs,
  initialValue,
  restoreOnMount = true,
  placeholder = '메시지 또는 지시를 입력하세요…',
  submitLabel = '전송',
  onSubmit,
  className = '',
  children,
}: WorkspaceDraftInputBarProps) {
  const {
    value,
    setValue,
    saveState,
    lastSavedAt,
    errorMessage,
    hasUnsavedChanges,
    saveNow,
    retrySave,
    clearDraft,
  } = useTemporarySave({
    scope,
    meetingId,
    debounceMs,
    initialValue,
    restoreOnMount,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveNow().then((saved) => {
      if (saved) {
        onSubmit?.(value);
      }
    });
  };

  return (
    <div className={`workspace-draft-input${className ? ` ${className}` : ''}`}>
      <div className="workspace-draft-input__status">
        <WorkspaceDraftSaveStatus
          state={saveState}
          lastSavedAt={lastSavedAt}
          errorMessage={errorMessage}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveNow={() => {
            void saveNow();
          }}
          onRetry={() => {
            void retrySave();
          }}
          onClear={clearDraft}
        />
      </div>

      {children}

      <form className="workspace-draft-input__bar" aria-label="입력" onSubmit={handleSubmit}>
        <input
          type="text"
          className="workspace-draft-input__field"
          placeholder={placeholder}
          aria-label="작업 입력"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <DraftSaveActionButtons
          state={saveState}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveNow={() => {
            void saveNow();
          }}
          onRetry={() => {
            void retrySave();
          }}
          onClear={clearDraft}
        />
        <button type="submit" className="workspace-submit-btn">
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
