import './ErrorMessage.css';

export type ErrorVariant = 'block' | 'panel' | 'inline' | 'timeline';

export interface ErrorMessageProps {
  message: string;
  description?: string;
  variant?: ErrorVariant;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorMessage({
  message,
  description,
  variant = 'block',
  onRetry,
  retryLabel = '다시 시도',
  className = '',
}: ErrorMessageProps) {
  const showActions = Boolean(onRetry);

  return (
    <div
      className={`error-message error-message--${variant}${className ? ` ${className}` : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="error-message__icon" aria-hidden="true">
        !
      </span>

      <div className="error-message__body">
        <p className="error-message__title">{message}</p>
        {description ? <p className="error-message__description">{description}</p> : null}
      </div>

      {showActions ? (
        <div className="error-message__actions">
          <button type="button" className="error-message__retry" onClick={onRetry}>
            {retryLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
