import type { ReactNode } from 'react';
import type { ProcessingStatus } from '../../data/types';
import { ErrorMessage, type ErrorVariant } from './ErrorMessage';
import './ErrorState.css';

export type ErrorScenario = 'upload' | 'conversion' | 'fetch';

const ERROR_PRESETS: Record<ErrorScenario, { message: string; description: string }> = {
  upload: {
    message: '파일 업로드에 실패했습니다',
    description: '네트워크 연결을 확인한 뒤 다시 업로드해 주세요.',
  },
  conversion: {
    message: '변환 처리에 실패했습니다',
    description: '파일 형식이 지원되지 않거나 서버 오류가 발생했습니다.',
  },
  fetch: {
    message: '데이터를 불러오지 못했습니다',
    description: '회의 데이터 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  },
};

export function isErrorStatus(status?: ProcessingStatus): boolean {
  return status === 'error';
}

export interface ErrorStateProps {
  error?: boolean;
  failed?: boolean;
  stageStatus?: ProcessingStatus;
  scenario?: ErrorScenario;
  message?: string;
  description?: string;
  variant?: ErrorVariant;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  children?: ReactNode;
}

export function ErrorState({
  error,
  failed,
  stageStatus,
  scenario,
  message,
  description,
  variant = 'block',
  onRetry,
  retryLabel,
  className = '',
  children,
}: ErrorStateProps) {
  const hasError = error ?? failed ?? isErrorStatus(stageStatus);

  if (!hasError) {
    return <>{children}</>;
  }

  const preset = scenario ? ERROR_PRESETS[scenario] : undefined;
  const resolvedMessage = message ?? preset?.message ?? '오류가 발생했습니다';
  const resolvedDescription = description ?? preset?.description;

  return (
    <div
      className={`error-state error-state--${variant}${className ? ` ${className}` : ''}`}
      data-error-state="active"
    >
      <ErrorMessage
        message={resolvedMessage}
        description={resolvedDescription}
        variant={variant}
        onRetry={onRetry}
        retryLabel={retryLabel}
      />
    </div>
  );
}

/**
 * 작업 공간(중앙 패널) 오류 표시용 래퍼.
 * workspaceStatus.stageStatus === 'error' 일 때 메시지를 표시하고, 정상 시 children을 렌더합니다.
 */
export function WorkspaceErrorState({
  stageStatus,
  scenario = 'conversion',
  message,
  description,
  onRetry,
  retryLabel,
  className = '',
  children,
}: Omit<ErrorStateProps, 'variant' | 'error' | 'failed'>) {
  return (
    <ErrorState
      stageStatus={stageStatus}
      scenario={scenario}
      message={message}
      description={description}
      variant="block"
      onRetry={onRetry}
      retryLabel={retryLabel}
      className={className}
    >
      {children}
    </ErrorState>
  );
}

/**
 * 결과 패널 오류 표시용 래퍼.
 * 데이터 조회 실패 등 결과 영역 오류에 사용합니다.
 */
export function ResultPanelErrorState({
  error,
  failed,
  scenario = 'fetch',
  message,
  description,
  onRetry,
  retryLabel,
  className = '',
  children,
}: Omit<ErrorStateProps, 'variant' | 'stageStatus'>) {
  return (
    <ErrorState
      error={error}
      failed={failed}
      scenario={scenario}
      message={message}
      description={description}
      variant="panel"
      onRetry={onRetry}
      retryLabel={retryLabel}
      className={className}
    >
      {children}
    </ErrorState>
  );
}
