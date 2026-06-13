import type { ResultScreenActionItem } from "./ResultScreen.types";

interface ActionItemsCardProps {
  actionItems: ResultScreenActionItem[];
  onActionItemSelect?: (actionItem: ResultScreenActionItem) => void;
  className?: string;
}

export function ActionItemsCard({
  actionItems,
  onActionItemSelect,
  className,
}: ActionItemsCardProps) {
  if (actionItems.length === 0) {
    return null;
  }

  const rootClass = ["result-screen-card", className].filter(Boolean).join(" ");
  const isInteractive = Boolean(onActionItemSelect);

  return (
    <section className={rootClass} aria-labelledby="result-screen-action-items-heading">
      <h3 id="result-screen-action-items-heading" className="result-screen-card__title">
        할 일
      </h3>
      <div className="result-screen-card__body">
        {actionItems.map((actionItem) => (
          <article key={actionItem.id} className="result-screen-item-card">
            <button
              type="button"
              className="result-screen-item-card__button"
              disabled={!isInteractive}
              onClick={() => onActionItemSelect?.(actionItem)}
            >
              <div className="result-screen-item-card__row">
                <p className="result-screen-item-card__title">{actionItem.task}</p>
                <span
                  className={`result-screen-status-chip result-screen-status-chip--${actionItem.status}`}
                >
                  {actionItem.statusLabel}
                </span>
              </div>
              <p className="result-screen-item-card__meta">
                담당 {actionItem.assigneeName} · 마감 {actionItem.dueDate}
              </p>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
