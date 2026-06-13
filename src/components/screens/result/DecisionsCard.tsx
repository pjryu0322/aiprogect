import type { ResultScreenDecision } from "./ResultScreen.types";

interface DecisionsCardProps {
  decisions: ResultScreenDecision[];
  onDecisionSelect?: (decision: ResultScreenDecision) => void;
  className?: string;
}

export function DecisionsCard({
  decisions,
  onDecisionSelect,
  className,
}: DecisionsCardProps) {
  if (decisions.length === 0) {
    return null;
  }

  const rootClass = ["result-screen-card", className].filter(Boolean).join(" ");
  const isInteractive = Boolean(onDecisionSelect);

  return (
    <section className={rootClass} aria-labelledby="result-screen-decisions-heading">
      <h3 id="result-screen-decisions-heading" className="result-screen-card__title">
        결정사항
      </h3>
      <div className="result-screen-card__body">
        {decisions.map((decision) => (
          <article key={decision.id} className="result-screen-item-card">
            <button
              type="button"
              className="result-screen-item-card__button"
              disabled={!isInteractive}
              onClick={() => onDecisionSelect?.(decision)}
            >
              <p className="result-screen-item-card__title">{decision.summary}</p>
              {decision.rationale ? (
                <p className="result-screen-item-card__description">{decision.rationale}</p>
              ) : null}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
