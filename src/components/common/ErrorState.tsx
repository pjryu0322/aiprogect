import type { ReactNode } from 'react';
import type { ProcessingStatus } from '../../data/types';
import { LoadingState } from './LoadingState';
import { ErrorMessage, type ErrorVariant } from './ErrorMessage';
import './ErrorState.css';

export type ErrorScenario = 'upload' | 'conversion' | 'fetch';
export type ErrorFlowStatus = 'idle' | 'error' | 'retrying';

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
  status?: ErrorFlowStatus;
  retrying?: boolean;
  scenario?: ErrorScenario;
  message?: string;
  description?: string;
  variant?: ErrorVariant;
  onRetry?: () => void;
  retryLabel?: string;
  retryingMessage?: string;
  className?: string;
  children?: ReactNode;
}

function resolveFlowStatus(
  status: ErrorFlowStatus | undefined,
  retrying: boolean,
  hasError: boolean,
): ErrorFlowStatus {
  if (status) {
    return status;
  }
  if (retrying) {
    return 'retrying';
  }
  return hasError ? 'error' : 'idle';
}

function resolveLoadingVariant(variant: ErrorVariant): 'block' | 'inline' | 'timeline' {
  if (variant === 'inline') {
    return 'inline';
  }
  if (variant === 'timeline') {
    return 'timeline';
  }
  return 'block';
}

export function ErrorState({
  error,
  failed,
  stageStatus,
  status,
  retrying = false,
  scenario,
  message,
  description,
  variant = 'block',
  onRetry,
  retryLabel,
  retryingMessage = '다시 시도하는 중입니다…',
  className = '',
  children,
}: ErrorStateProps) {
  const hasError = error ?? failed ?? isErrorStatus(stageStatus);
  const flowStatus = resolveFlowStatus(status, retrying, hasError);

  if (flowStatus === 'idle') {
    return <>{children}</>;
  }

  if (flowStatus === 'retrying') {
    return (
      <div
        className={`error-state error-state--${variant}${className ? ` ${className}` : ''}`}
        data-error-state="retrying"
      >
        <LoadingState
          loading
          message={retryingMessage}
          variant={resolveLoadingVariant(variant)}
          className="error-state__retrying"
        />
      </div>
    );
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
  status,
  retrying,
  scenario = 'conversion',
  message,
  description,
  onRetry,
  retryLabel,
  retryingMessage,
  className = '',
  children,
}: Omit<ErrorStateProps, 'variant' | 'error' | 'failed'>) {
  return (
    <ErrorState
      stageStatus={stageStatus}
      status={status}
      retrying={retrying}
      scenario={scenario}
      message={message}
      description={description}
      variant="block"
      onRetry={onRetry}
      retryLabel={retryLabel}
      retryingMessage={retryingMessage}
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
  status,
  retrying,
  scenario = 'fetch',
  message,
  description,
  onRetry,
  retryLabel,
  retryingMessage,
  className = '',
  children,
}: Omit<ErrorStateProps, 'variant' | 'stageStatus'>) {
  return (
    <ErrorState
      error={error}
      failed={failed}
      status={status}
      retrying={retrying}
      scenario={scenario}
      message={message}
      description={description}
      variant="panel"
      onRetry={onRetry}
      retryLabel={retryLabel}
      retryingMessage={retryingMessage}
      className={className}
    >
      {children}
    </ErrorState>
  );
}
