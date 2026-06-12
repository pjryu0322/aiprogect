interface ResultCardProps {
  title: string;
  items: string[];
  emptyText: string;
}

export function ResultCard({ title, items, emptyText }: ResultCardProps) {
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
