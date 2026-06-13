import type { ProcessingStatusSummaryProps } from "./AdminScreen.types";
import { getAdminScreenDescription, getAdminScreenHeadline } from "./adminScreen.utils";
import "./adminScreen.css";

const SUMMARY_ITEMS = [
  { key: "total", label: "전체" },
  { key: "processing", label: "처리 중" },
  { key: "completed", label: "완료" },
  { key: "failed", label: "실패" },
  { key: "needsReview", label: "확인 필요" },
] as const;

export function ProcessingStatusSummary({
  summary,
  status,
  className,
}: ProcessingStatusSummaryProps) {
  const rootClass = ["admin-screen-summary", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass} aria-labelledby="admin-screen-summary-heading">
      <header className="admin-screen-summary__header">
        <div>
          <h2 id="admin-screen-summary-heading" className="admin-screen-summary__title">
            분석 작업 관리
          </h2>
          <p className="admin-screen-summary__description">
            {getAdminScreenHeadline(status, summary)}
          </p>
          <p className="admin-screen-summary__meta">{getAdminScreenDescription(summary)}</p>
        </div>
      </header>

      <div className="admin-screen-summary__cards" role="list">
        {SUMMARY_ITEMS.map((item) => (
          <article
            key={item.key}
            className={`admin-screen-summary-card admin-screen-summary-card--${item.key}`}
            role="listitem"
          >
            <span className="admin-screen-summary-card__label">{item.label}</span>
            <strong className="admin-screen-summary-card__value">{summary[item.key]}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
