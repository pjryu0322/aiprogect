import type { AdminScreenStatus, AdminStatusSummary } from './AdminScreen.types';
import './admin.css';

export interface AdminStatusOverviewProps {
  summary: AdminStatusSummary;
  screenStatus: AdminScreenStatus;
  className?: string;
}

const OVERVIEW_ITEMS: {
  key: keyof AdminStatusSummary;
  label: string;
  tone: 'neutral' | 'processing' | 'success' | 'warning';
}[] = [
  { key: 'total', label: '전체 회의', tone: 'neutral' },
  { key: 'processing', label: '처리 중', tone: 'processing' },
  { key: 'complete', label: '완료', tone: 'success' },
  { key: 'idleOrError', label: '대기·오류', tone: 'warning' },
];

export function AdminStatusOverview({
  summary,
  screenStatus,
  className = '',
}: AdminStatusOverviewProps) {
  const isLoading = screenStatus === 'loading';

  return (
    <section
      className={`admin-status-overview${className ? ` ${className}` : ''}`}
      aria-labelledby="admin-status-heading"
      aria-busy={isLoading}
    >
      <div className="admin-status-overview__header">
        <h2 id="admin-status-heading" className="admin-section-title">
          처리 상태 요약
        </h2>
        {isLoading ? (
          <span className="admin-status-overview__loading" role="status" aria-live="polite">
            상태 갱신 중…
          </span>
        ) : null}
      </div>

      <div className="admin-status-overview__grid" role="list" aria-label="처리 상태 요약 카드">
        {OVERVIEW_ITEMS.map((item) => (
          <article
            key={item.key}
            className={`admin-status-card admin-status-card--${item.tone}`}
            role="listitem"
          >
            <p className="admin-status-card__label">{item.label}</p>
            <p className="admin-status-card__value">{summary[item.key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
