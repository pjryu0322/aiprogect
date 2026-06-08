import type { MeetingSummary } from '../../../data/types';
import { ActionItemsCard } from './ActionItemsCard';
import { ResultCard } from './ResultCard';

interface SummaryCardsProps {
  summary: MeetingSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
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
