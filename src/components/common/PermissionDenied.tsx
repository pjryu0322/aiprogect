import type { ReactNode } from 'react';
import {
  AccessDenied,
  type AccessDeniedContainerProps,
  type AccessDeniedProps,
  type DeniedAction,
  type ForbiddenStatus,
  isForbidden,
} from './AccessDenied';
import './PermissionDenied.css';

export type { DeniedAction, ForbiddenStatus };
export { isForbidden };

export type UnauthorizedStatus = 'unauthorized' | 'authorized';

export function isUnauthorized(status?: UnauthorizedStatus | boolean): boolean {
  if (typeof status === 'boolean') {
    return !status;
  }
  return status === 'unauthorized';
}

export interface PermissionDeniedProps extends Omit<AccessDeniedProps, 'title'> {
  title?: string;
}

const DEFAULT_TITLE = '로그인이 필요합니다';
const DEFAULT_DESCRIPTION =
  '이 기능을 사용하려면 먼저 로그인해 주세요. 계정이 없다면 관리자에게 접근 권한을 요청할 수 있습니다.';

export const PERMISSION_DENIED_PRESETS: Record<string, { title: string; description: string }> = {
  workspace: {
    title: '작업 공간을 사용할 수 없습니다',
    description: '로그인 후 회의 업로드, 변환, 초안 생성 기능을 이용할 수 있습니다.',
  },
  result: {
    title: '결과를 볼 수 없습니다',
    description: '로그인하면 회의록 요약과 스크립트를 확인할 수 있습니다.',
  },
};

export function PermissionDenied({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  className = '',
  ...rest
}: PermissionDeniedProps) {
  return (
    <div
      className={`permission-denied${className ? ` ${className}` : ''}`}
      data-state="unauthorized"
    >
      <AccessDenied title={title} description={description} {...rest} />
    </div>
  );
}

export interface PermissionDeniedContainerProps extends Omit<AccessDeniedContainerProps, 'title'> {
  title?: string;
}

export function PermissionDeniedContainer({
  allowed,
  children,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ...rest
}: PermissionDeniedContainerProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return <PermissionDenied title={title} description={description} {...rest} />;
}

/** 중앙 작업 공간 인증 필요(unauthorized) 안내. */
export function WorkspacePermissionDenied({
  allowed,
  title = PERMISSION_DENIED_PRESETS.workspace.title,
  description = PERMISSION_DENIED_PRESETS.workspace.description,
  ...props
}: Omit<PermissionDeniedContainerProps, 'variant'>) {
  return (
    <PermissionDeniedContainer
      allowed={allowed}
      title={title}
      description={description}
      variant="block"
      {...props}
    />
  );
}

/** 결과 패널 인증 필요(unauthorized) 안내. */
export function ResultPanelPermissionDenied({
  allowed,
  title = PERMISSION_DENIED_PRESETS.result.title,
  description = PERMISSION_DENIED_PRESETS.result.description,
  ...props
}: Omit<PermissionDeniedContainerProps, 'variant'>) {
  return (
    <PermissionDeniedContainer
      allowed={allowed}
      title={title}
      description={description}
      variant="panel"
      {...props}
    />
  );
}
