import type { ActionItem } from '../../../data/types';

interface ActionItemsCardProps {
  actionItems: ActionItem[];
}

export function ActionItemsCard({ actionItems }: ActionItemsCardProps) {
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
