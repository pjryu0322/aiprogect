interface HighlightsCardProps {
  highlights: string[];
  className?: string;
}

export function HighlightsCard({ highlights, className }: HighlightsCardProps) {
  if (highlights.length === 0) {
    return null;
  }

  const rootClass = ["result-screen-card", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass} aria-labelledby="result-screen-highlights-heading">
      <h3 id="result-screen-highlights-heading" className="result-screen-card__title">
        핵심 안건
      </h3>
      <ul className="result-screen-highlight-list">
        {highlights.map((highlight, index) => (
          <li
            key={`highlight-${index}`}
            className="result-screen-highlight-list__item"
          >
            {highlight}
          </li>
        ))}
      </ul>
    </section>
  );
}
