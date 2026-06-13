import type { ReactNode } from "react";
import "./EmptyState.css";

export type EmptyStateVariant = "panel" | "inline";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  isEmpty: boolean;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  variant?: EmptyStateVariant;
  children?: ReactNode;
  className?: string;
}

function EmptyIcon() {
  return (
    <span className="empty-state__icon" aria-hidden="true">
      <svg
        className="empty-state__icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="5"
          width="16"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 9h8M8 13h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function EmptyState({
  isEmpty,
  title,
  description,
  action,
  variant = "panel",
  children,
  className,
}: EmptyStateProps) {
  if (!isEmpty) {
    return children ? <>{children}</> : null;
  }

  const rootClass = ["empty-state", `empty-state--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const actionButton = action ? (
    <button
      type="button"
      className="empty-state__action-btn"
      onClick={action.onClick}
    >
      {action.label}
    </button>
  ) : null;

  if (variant === "inline") {
    return (
      <div className={rootClass} role="status" aria-live="polite">
        <EmptyIcon />
        <div className="empty-state__content">
          <p className="empty-state__title">{title}</p>
          {description ? (
            <p className="empty-state__description">{description}</p>
          ) : null}
          {actionButton}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <EmptyIcon />
      <div className="empty-state__content">
        <p className="empty-state__title">{title}</p>
        {description ? (
          <p className="empty-state__description">{description}</p>
        ) : null}
      </div>
      {actionButton}
    </div>
  );
}
