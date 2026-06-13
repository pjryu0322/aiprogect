import "./AccessDenied.css";

export type AccessDeniedVariant = "panel" | "inline";

export type AccessDeniedReason = "forbidden" | "unauthorized";

export interface AccessDeniedAction {
  label: string;
  onClick: () => void;
}

export interface AccessDeniedProps {
  message: string;
  description?: string;
  reason?: AccessDeniedReason;
  action?: AccessDeniedAction;
  variant?: AccessDeniedVariant;
  className?: string;
}

function AccessDeniedIcon() {
  return (
    <span className="access-denied__icon" aria-hidden="true">
      <svg
        className="access-denied__icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="11"
          width="14"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 11V8a4 4 0 118 0v3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.25" fill="currentColor" />
      </svg>
    </span>
  );
}

export function AccessDenied({
  message,
  description,
  reason,
  action,
  variant = "panel",
  className,
}: AccessDeniedProps) {
  const rootClass = [
    "access-denied",
    `access-denied--${variant}`,
    reason ? `access-denied--${reason}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const actionButton = action ? (
    <button
      type="button"
      className="access-denied__action-btn"
      onClick={action.onClick}
    >
      {action.label}
    </button>
  ) : null;

  if (variant === "inline") {
    return (
      <div
        className={rootClass}
        role="alert"
        aria-live="polite"
        data-access-reason={reason}
      >
        <AccessDeniedIcon />
        <div className="access-denied__content">
          <p className="access-denied__message">{message}</p>
          {description ? (
            <p className="access-denied__description">{description}</p>
          ) : null}
          {actionButton}
        </div>
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      role="alert"
      aria-live="polite"
      data-access-reason={reason}
    >
      <AccessDeniedIcon />
      <div className="access-denied__content">
        <p className="access-denied__message">{message}</p>
        {description ? (
          <p className="access-denied__description">{description}</p>
        ) : null}
      </div>
      {actionButton}
    </div>
  );
}
