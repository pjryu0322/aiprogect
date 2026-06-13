import type { ReactNode } from "react";
import {
  AccessDenied,
  type AccessDeniedAction,
  type AccessDeniedReason,
  type AccessDeniedVariant,
} from "./AccessDenied";

export type {
  AccessDeniedAction as PermissionDeniedAction,
  AccessDeniedReason as PermissionDeniedReason,
  AccessDeniedVariant as PermissionDeniedVariant,
};

const DEFAULT_MESSAGES: Record<
  AccessDeniedReason,
  { message: string; description: string }
> = {
  forbidden: {
    message: "접근 권한이 없습니다",
    description:
      "이 기능을 사용할 권한이 없습니다. 관리자에게 문의하거나 다른 작업을 진행해 주세요.",
  },
  unauthorized: {
    message: "로그인이 필요합니다",
    description: "이 기능을 사용하려면 로그인이 필요합니다.",
  },
};

export interface PermissionDeniedProps {
  isDenied: boolean;
  reason?: AccessDeniedReason;
  message?: string;
  description?: string;
  action?: AccessDeniedAction;
  variant?: AccessDeniedVariant;
  children?: ReactNode;
  className?: string;
}

export function PermissionDenied({
  isDenied,
  reason = "forbidden",
  message,
  description,
  action,
  variant = "panel",
  children,
  className,
}: PermissionDeniedProps) {
  if (!isDenied) {
    return children ? <>{children}</> : null;
  }

  const defaults = DEFAULT_MESSAGES[reason];

  return (
    <AccessDenied
      message={message ?? defaults.message}
      description={description ?? defaults.description}
      reason={reason}
      action={action}
      variant={variant}
      className={className}
    />
  );
}
