import type { ReactNode } from 'react';
import type { StateAction } from './EmptyState';
import './AccessDenied.css';

export type AccessDeniedVariant = 'block' | 'panel';

export interface DeniedAction extends StateAction {
  href?: string;
  variant?: 'primary' | 'secondary';
}

export interface AccessDeniedProps {
  /** Primary message shown when access is forbidden (403). */
  title: string;
  /** Supporting guidance and alternative actions. */
  description?: string;
  /** Optional primary call-to-action. */
  action?: DeniedAction | ReactNode;
  /** Optional secondary call-to-action. */
  secondaryAction?: DeniedAction | ReactNode;
  variant?: AccessDeniedVariant;
  className?: string;
}

export const ACCESS_DENIED_PRESETS: Record<string, { title: string; description: string }> = {
  workspace: {
    title: '작업 공간에 접근할 수 없습니다',
    description:
      '이 회의 작업 공간을 열 권한이 없습니다. 접근 권한을 요청하거나 다른 회의를 선택해 주세요.',
  },
  result: {
    title: '결과를 확인할 수 없습니다',
    description:
      '회의록 요약 및 스크립트를 볼 권한이 없습니다. 관리자에게 접근 권한을 요청해 주세요.',
  },
};

export type ForbiddenStatus = 'forbidden' | 'allowed';

export function isForbidden(status?: ForbiddenStatus | boolean): boolean {
  if (typeof status === 'boolean') {
    return !status;
  }
  return status === 'forbidden';
}

function isDeniedAction(action: DeniedAction | ReactNode): action is DeniedAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'label' in action &&
    ('onClick' in action || 'href' in action)
  );
}

function renderDeniedAction(action: DeniedAction | ReactNode, fallbackVariant: 'primary' | 'secondary') {
  if (!isDeniedAction(action)) {
    return action;
  }

  const className = `access-denied__action access-denied__action--${action.variant ?? fallbackVariant}`;

  if (action.href) {
    return (
      <a className={className} href={action.href} onClick={action.onClick}>
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function AccessDenied({
  title,
  description,
  action,
  secondaryAction,
  variant = 'block',
  className = '',
}: AccessDeniedProps) {
  const hasActions = Boolean(action || secondaryAction);

  return (
    <div
      className={`access-denied access-denied--${variant}${className ? ` ${className}` : ''}`}
      role="alert"
      aria-live="polite"
      data-state="forbidden"
      aria-label={title}
    >
      <div className="access-denied__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 22V18a8 8 0 1 1 16 0v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="12" y="22" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M24 28v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="access-denied__title">{title}</h3>

      {description ? <p className="access-denied__description">{description}</p> : null}

      {hasActions ? (
        <div className="access-denied__actions">
          {action ? renderDeniedAction(action, 'primary') : null}
          {secondaryAction ? renderDeniedAction(secondaryAction, 'secondary') : null}
        </div>
      ) : null}
    </div>
  );
}

export interface AccessDeniedContainerProps extends AccessDeniedProps {
  allowed: boolean;
  children?: ReactNode;
}

export function AccessDeniedContainer({
  allowed,
  children,
  ...stateProps
}: AccessDeniedContainerProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return <AccessDenied {...stateProps} />;
}

/** 중앙 작업 공간 접근 권한 없음(forbidden) 안내. */
export function WorkspaceAccessDenied({
  allowed,
  title = ACCESS_DENIED_PRESETS.workspace.title,
  description = ACCESS_DENIED_PRESETS.workspace.description,
  ...props
}: Omit<AccessDeniedContainerProps, 'variant'>) {
  return (
    <AccessDeniedContainer
      allowed={allowed}
      title={title}
      description={description}
      variant="block"
      {...props}
    />
  );
}

/** 결과 패널 접근 권한 없음(forbidden) 안내. */
export function ResultPanelAccessDenied({
  allowed,
  title = ACCESS_DENIED_PRESETS.result.title,
  description = ACCESS_DENIED_PRESETS.result.description,
  ...props
}: Omit<AccessDeniedContainerProps, 'variant'>) {
  return (
    <AccessDeniedContainer
      allowed={allowed}
      title={title}
      description={description}
      variant="panel"
      {...props}
    />
  );
}
