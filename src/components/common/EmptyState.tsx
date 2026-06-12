import type { ReactNode } from 'react';
import './EmptyState.css';

export interface StateAction {
  label: string;
  onClick: () => void;
}

export type EmptyStateVariant = 'block' | 'panel';

export interface EmptyStateProps {
  /** Primary message shown when data has not been created yet. */
  title: string;
  /** Supporting guidance for the user's next step. */
  description?: string;
  /** Optional call-to-action button or custom action content. */
  action?: StateAction | ReactNode;
  variant?: EmptyStateVariant;
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
      <button type="button" className="empty-state__action" onClick={action.onClick}>
        {action.label}
      </button>
    );
  }

  return action;
}

export function EmptyState({
  title,
  description,
  action,
  variant = 'block',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`empty-state empty-state--${variant}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      data-state="empty"
      aria-label={title}
    >
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

export interface EmptyStateContainerProps extends EmptyStateProps {
  isEmpty: boolean;
  children?: ReactNode;
}

export function EmptyStateContainer({
  isEmpty,
  children,
  ...stateProps
}: EmptyStateContainerProps) {
  if (!isEmpty) {
    return <>{children}</>;
  }

  return <EmptyState {...stateProps} />;
}

/** 중앙 작업 공간에 데이터가 없을 때 표시합니다. */
export function WorkspaceEmptyState({
  isEmpty,
  title = '아직 작업 내용이 없습니다',
  description = '회의 녹취를 업로드하면 변환·화자 분리·초안 생성 진행 상태가 여기에 표시됩니다.',
  ...props
}: Omit<EmptyStateContainerProps, 'variant'>) {
  return (
    <EmptyStateContainer
      isEmpty={isEmpty}
      title={title}
      description={description}
      variant="block"
      {...props}
    />
  );
}

/** 결과 패널에 요약·스크립트 데이터가 없을 때 표시합니다. */
export function ResultPanelEmptyState({
  isEmpty,
  title = '아직 결과가 없습니다',
  description = '변환이 완료되면 요약본과 스크립트가 이 영역에 표시됩니다.',
  ...props
}: Omit<EmptyStateContainerProps, 'variant'>) {
  return (
    <EmptyStateContainer
      isEmpty={isEmpty}
      title={title}
      description={description}
      variant="panel"
      {...props}
    />
  );
}

/** 좌측 회의 파일 목록이 비어 있을 때 표시합니다. */
export function FileListEmptyState({
  isEmpty,
  title = '업로드된 파일이 없습니다',
  description = '회의 녹취 파일을 업로드하면 목록에 표시됩니다.',
  ...props
}: Omit<EmptyStateContainerProps, 'variant'>) {
  return (
    <EmptyStateContainer
      isEmpty={isEmpty}
      title={title}
      description={description}
      variant="panel"
      {...props}
    />
  );
}
