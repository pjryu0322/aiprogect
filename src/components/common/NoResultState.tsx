import type { ReactNode } from "react";
import "./NoResultState.css";

export type NoResultStateVariant = "panel" | "inline";

export interface NoResultStateAction {
  label: string;
  onClick: () => void;
}

export interface NoResultStateProps {
  hasNoResult: boolean;
  title: string;
  description?: string;
  action?: NoResultStateAction;
  variant?: NoResultStateVariant;
  children?: ReactNode;
  className?: string;
}

function NoResultIcon() {
  return (
    <span className="no-result-state__icon" aria-hidden="true">
      <svg
        className="no-result-state__icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 16l4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function NoResultState({
  hasNoResult,
  title,
  description,
  action,
  variant = "panel",
  children,
  className,
}: NoResultStateProps) {
  if (!hasNoResult) {
    return children ? <>{children}</> : null;
  }

  const rootClass = ["no-result-state", `no-result-state--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const actionButton = action ? (
    <button
      type="button"
      className="no-result-state__action-btn"
      onClick={action.onClick}
    >
      {action.label}
    </button>
  ) : null;

  if (variant === "inline") {
    return (
      <div className={rootClass} role="status" aria-live="polite">
        <NoResultIcon />
        <div className="no-result-state__content">
          <p className="no-result-state__title">{title}</p>
          {description ? (
            <p className="no-result-state__description">{description}</p>
          ) : null}
          {actionButton}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <NoResultIcon />
      <div className="no-result-state__content">
        <p className="no-result-state__title">{title}</p>
        {description ? (
          <p className="no-result-state__description">{description}</p>
        ) : null}
      </div>
      {actionButton}
    </div>
  );
}
