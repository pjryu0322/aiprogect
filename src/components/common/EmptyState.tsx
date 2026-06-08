import type { ReactNode } from 'react';
import './EmptyState.css';

export interface StateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  /** Primary message shown when data has not been created yet. */
  title: string;
  /** Supporting guidance for the user's next step. */
  description?: string;
  /** Optional call-to-action button or custom action content. */
  action?: StateAction | ReactNode;
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
      <button type="button" className="empty-state__action" onClick={action.onClick}>
        {action.label}
      </button>
    );
  }

  return action;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" data-state="empty" aria-label={title}>
      <div className="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="12" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M16 20h16M16 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="34" cy="34" r="8" fill="currentColor" fillOpacity="0.12" />
          <path d="M34 31v6M31 34h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="empty-state__title">{title}</h3>

      {description ? <p className="empty-state__description">{description}</p> : null}

      {action ? <div className="empty-state__actions">{renderAction(action)}</div> : null}
    </div>
  );
}
