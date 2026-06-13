import type { ResultScreenSummary } from "./ResultScreen.types";

interface SummaryOverviewBlockProps {
  summary: ResultScreenSummary;
  className?: string;
}

export function SummaryOverviewBlock({ summary, className }: SummaryOverviewBlockProps) {
  const rootClass = ["result-screen-summary__header", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      <h4 className="result-screen-summary__title">{summary.meetingTitle}</h4>
      <p className="result-screen-summary__meta">
        {summary.date} · {summary.duration} · 참여 {summary.participantCount}명
      </p>
      <p className="result-screen-summary__overview">{summary.overview}</p>
    </header>
  );
}
