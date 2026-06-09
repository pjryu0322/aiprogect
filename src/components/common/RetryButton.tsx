import { useCallback, useRef, useState } from 'react';
import { Spinner } from './LoadingState';
import './RetryButton.css';

export interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  retrying?: boolean;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  retryingLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function RetryButton({
  onRetry,
  retrying: retryingProp,
  loading,
  disabled = false,
  label = '다시 시도',
  retryingLabel = '재시도 중…',
  className = '',
  size = 'md',
}: RetryButtonProps) {
  const [internalRetrying, setInternalRetrying] = useState(false);
  const retryInFlightRef = useRef(false);
  const isControlled = retryingProp !== undefined || loading !== undefined;
  const retrying = retryingProp ?? loading ?? internalRetrying;
  const isDisabled = disabled || retrying;

  const handleClick = useCallback(async () => {
    if (disabled || retryInFlightRef.current) {
      return;
    }

    if (!isControlled) {
      retryInFlightRef.current = true;
      setInternalRetrying(true);
    }

    try {
      await onRetry();
    } finally {
      if (!isControlled) {
        retryInFlightRef.current = false;
        setInternalRetrying(false);
      }
    }
  }, [onRetry, disabled, isControlled]);

  return (
    <button
      type="button"
      className={`retry-button retry-button--${size}${retrying ? ' retry-button--retrying' : ''}${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={retrying}
      aria-label={retrying ? retryingLabel : label}
    >
      {retrying ? (
        <>
          <Spinner size="sm" className="retry-button__spinner" />
          <span>{retryingLabel}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
