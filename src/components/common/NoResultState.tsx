import type { ReactNode } from 'react';
import type { StateAction } from './EmptyState';
import './NoResultState.css';

export type NoResultStateVariant = 'block' | 'panel';

export interface NoResultStateProps {
  /** Primary message shown when a search or filter returns no matches. */
  title: string;
  /** Supporting guidance such as adjusting search terms. */
  description?: string;
  /** Optional call-to-action button or custom action content. */
  action?: StateAction | ReactNode;
  variant?: NoResultStateVariant;
  className?: string;
}

function isStateAction(action: StateAction | ReactNode): action is StateAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'label' in action &&
    'onClick' in action &&
    typeof (action as StateAction).onClick === 'function'
  );
}

function renderAction(action: StateAction | ReactNode) {
  if (isStateAction(action)) {
    return (
      <button type="button" className="no-result-state__action" onClick={action.onClick}>
        {action.label}
      </button>
    );
  }

  return action;
}

export function NoResultState({
  title,
  description,
  action,
  variant = 'block',
  className = '',
}: NoResultStateProps) {
  return (
    <div
      className={`no-result-state no-result-state--${variant}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      data-state="no-result"
      aria-label={title}
    >
      <div className="no-result-state__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="21" cy="21" r="11" stroke="currentColor" strokeWidth="2" />
          <path d="M29 29l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="no-result-state__title">{title}</h3>

      {description ? <p className="no-result-state__description">{description}</p> : null}

      {action ? <div className="no-result-state__actions">{renderAction(action)}</div> : null}
    </div>
  );
}

export interface NoResultStateContainerProps extends NoResultStateProps {
  hasNoResults: boolean;
  children?: ReactNode;
}

export function NoResultStateContainer({
  hasNoResults,
  children,
  ...stateProps
}: NoResultStateContainerProps) {
  if (!hasNoResults) {
    return <>{children}</>;
  }

  return <NoResultState {...stateProps} />;
}

/** 결과 패널 검색·필터 결과가 없을 때 표시합니다. */
export function ResultPanelNoResultState({
  hasNoResults,
  title = '검색 결과가 없습니다',
  description = '다른 검색어를 입력하거나 필터를 초기화해 보세요.',
  ...props
}: Omit<NoResultStateContainerProps, 'variant'>) {
  return (
    <NoResultStateContainer
      hasNoResults={hasNoResults}
      title={title}
      description={description}
      variant="panel"
      {...props}
    />
  );
}
