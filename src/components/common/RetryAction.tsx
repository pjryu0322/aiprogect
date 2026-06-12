import type { ReactNode } from 'react';
import type { ProcessingStatus } from '../../data/types';
import { type ErrorVariant } from './ErrorMessage';
import { isErrorStatus, type ErrorScenario } from './ErrorState';
import { LoadingState } from './LoadingState';
import { RetryButton } from './RetryButton';
import './ErrorMessage.css';
import './ErrorState.css';
import './RetryAction.css';

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

const DEFAULT_RETRYING_MESSAGE = '다시 시도하는 중입니다…';

function resolveLoadingVariant(variant: ErrorVariant): 'block' | 'inline' | 'timeline' {
  if (variant === 'inline') {
    return 'inline';
  }
  if (variant === 'timeline') {
    return 'timeline';
  }
  return 'block';
}

export interface RetryActionProps {
  message: string;
  description?: string;
  variant?: ErrorVariant;
  onRetry: () => void | Promise<void>;
  retrying?: boolean;
  label?: string;
  retryingLabel?: string;
  retryingMessage?: string;
  className?: string;
}

export function RetryAction({
  message,
  description,
  variant = 'block',
  onRetry,
  retrying = false,
  label,
  retryingLabel,
  retryingMessage = DEFAULT_RETRYING_MESSAGE,
  className = '',
}: RetryActionProps) {
  if (retrying) {
    return (
      <div
        className={`retry-action retry-action--${variant} retry-action--retrying${className ? ` ${className}` : ''}`}
        data-retry-action="retrying"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingState
          loading
          message={retryingMessage}
          variant={resolveLoadingVariant(variant)}
          className="retry-action__loading"
        />
      </div>
    );
  }

  return (
    <div
      className={`retry-action error-message error-message--${variant}${className ? ` ${className}` : ''}`}
      role="alert"
      aria-live="assertive"
      data-retry-action="active"
    >
      <span className="error-message__icon" aria-hidden="true">
        !
      </span>

      <div className="error-message__body">
        <p className="error-message__title">{message}</p>
        {description ? <p className="error-message__description">{description}</p> : null}
      </div>

      <div className="error-message__actions">
        <RetryButton
          onRetry={onRetry}
          retrying={retrying}
          label={label}
          retryingLabel={retryingLabel}
          className="retry-action__button"
        />
      </div>
    </div>
  );
}

export interface RetryFailureStateProps {
  error?: boolean;
  failed?: boolean;
  stageStatus?: ProcessingStatus;
  scenario?: ErrorScenario;
  message?: string;
  description?: string;
  variant?: ErrorVariant;
  onRetry: () => void | Promise<void>;
  retrying?: boolean;
  label?: string;
  retryingLabel?: string;
  retryingMessage?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * ErrorState와 동일한 오류 감지·프리셋을 사용하되 RetryButton 기반 재시도 흐름을 제공합니다.
 */
export function RetryFailureState({
  error,
  failed,
  stageStatus,
  scenario,
  message,
  description,
  variant = 'block',
  onRetry,
  retrying = false,
  label,
  retryingLabel,
  retryingMessage,
  className = '',
  children,
}: RetryFailureStateProps) {
  const hasError = error ?? failed ?? isErrorStatus(stageStatus);

  if (!hasError && !retrying) {
    return <>{children}</>;
  }

  const preset = scenario ? ERROR_PRESETS[scenario] : undefined;
  const resolvedMessage = message ?? preset?.message ?? '오류가 발생했습니다';
  const resolvedDescription = description ?? preset?.description;
  const flowState = retrying ? 'retrying' : 'failed';

  return (
    <div
      className={`error-state error-state--${variant}${className ? ` ${className}` : ''}`}
      data-error-state={retrying ? 'retrying' : 'active'}
      data-retry-state={flowState}
    >
      <RetryAction
        message={resolvedMessage}
        description={resolvedDescription}
        variant={variant}
        onRetry={onRetry}
        retrying={retrying}
        label={label}
        retryingLabel={retryingLabel}
        retryingMessage={retryingMessage}
      />
    </div>
  );
}

/**
 * LoadingState 실패(로딩 중단) 시 재시도 액션을 표시합니다.
 */
export interface LoadingFailureRetryProps {
  failed: boolean;
  message?: string;
  description?: string;
  onRetry: () => void | Promise<void>;
  retrying?: boolean;
  label?: string;
  retryingLabel?: string;
  retryingMessage?: string;
  className?: string;
  children?: ReactNode;
}

export function LoadingFailureRetry({
  failed,
  message = '처리를 완료하지 못했습니다',
  description = '네트워크 또는 서버 오류로 작업이 중단되었습니다.',
  onRetry,
  retrying = false,
  label,
  retryingLabel,
  retryingMessage,
  className = '',
  children,
}: LoadingFailureRetryProps) {
  if (!failed && !retrying) {
    return <>{children}</>;
  }

  return (
    <div
      className={`retry-action-loading-failure${className ? ` ${className}` : ''}`}
      data-loading-failure={retrying ? 'retrying' : 'active'}
      data-retry-state={retrying ? 'retrying' : 'failed'}
    >
      <RetryAction
        message={message}
        description={description}
        variant="block"
        onRetry={onRetry}
        retrying={retrying}
        label={label}
        retryingLabel={retryingLabel}
        retryingMessage={retryingMessage}
      />
    </div>
  );
}

/**
 * 작업 공간(중앙 패널) 재시도 흐름용 래퍼.
 */
export function WorkspaceRetryAction({
  stageStatus,
  scenario = 'conversion',
  message,
  description,
  onRetry,
  retrying,
  label,
  retryingLabel,
  retryingMessage,
  className = '',
  children,
}: Omit<RetryFailureStateProps, 'variant' | 'error' | 'failed'>) {
  return (
    <RetryFailureState
      stageStatus={stageStatus}
      scenario={scenario}
      message={message}
      description={description}
      variant="block"
      onRetry={onRetry}
      retrying={retrying}
      label={label}
      retryingLabel={retryingLabel}
      retryingMessage={retryingMessage}
      className={className}
    >
      {children}
    </RetryFailureState>
  );
}

/**
 * 결과 패널 재시도 흐름용 래퍼.
 */
export function ResultPanelRetryAction({
  error,
  failed,
  scenario = 'fetch',
  message,
  description,
  onRetry,
  retrying,
  label,
  retryingLabel,
  retryingMessage,
  className = '',
  children,
}: Omit<RetryFailureStateProps, 'variant' | 'stageStatus'>) {
  return (
    <RetryFailureState
      error={error}
      failed={failed}
      scenario={scenario}
      message={message}
      description={description}
      variant="panel"
      onRetry={onRetry}
      retrying={retrying}
      label={label}
      retryingLabel={retryingLabel}
      retryingMessage={retryingMessage}
      className={className}
    >
      {children}
    </RetryFailureState>
  );
}
