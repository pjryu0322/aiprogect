import type { ActionItem, MeetingSummary } from '../../../data/types';
import './resultScreen.css';

function ResultCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <article className="result-screen-card" aria-labelledby={`result-card-${title}`}>
      <h3 id={`result-card-${title}`} className="result-screen-card__title">
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="result-screen-card__list">
          {items.map((item) => (
            <li key={item} className="result-screen-card__item">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="result-screen-card__empty">{emptyText}</p>
      )}
    </article>
  );
}

function ActionItemsCard({ actionItems }: { actionItems: ActionItem[] }) {
  return (
    <article className="result-screen-card" aria-labelledby="result-card-action-items">
      <h3 id="result-card-action-items" className="result-screen-card__title">
        할 일
      </h3>
      {actionItems.length > 0 ? (
        <ul className="result-screen-card__list result-screen-card__list--actions">
          {actionItems.map((item) => (
            <li key={item.id} className="result-screen-card__action-item">
              <span className="result-screen-card__action-task">{item.task}</span>
              <span className="result-screen-card__action-meta">
                담당: {item.assignee}
                {item.dueDate ? ` · 마감: ${item.dueDate}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="result-screen-card__empty">할 일이 없습니다.</p>
      )}
    </article>
  );
}

export function SummaryCards({ summary }: { summary: MeetingSummary }) {
  return (
    <div className="result-screen-summary">
      <p className="result-screen-summary__overview">{summary.overview}</p>

      <div className="result-screen-cards">
        <ResultCard title="핵심 안건" items={summary.keyPoints} emptyText="핵심 안건이 없습니다." />
        <ResultCard title="결정사항" items={summary.decisions} emptyText="결정사항이 없습니다." />
        <ActionItemsCard actionItems={summary.actionItems} />
      </div>
    </div>
  );
}
