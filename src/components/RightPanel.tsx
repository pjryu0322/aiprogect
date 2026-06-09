import { useState } from 'react';

type ResultTab = 'summary' | 'script';

const TABS: { id: ResultTab; label: string }[] = [
  { id: 'summary', label: '요약본' },
  { id: 'script', label: '스크립트' },
];

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<ResultTab>('summary');

  return (
    <div className="panel-content panel-content--right">
      <section className="panel-section panel-section--flex" aria-labelledby="results-heading">
        <h2 id="results-heading" className="panel-section-title">
          결과 패널
        </h2>

        <div className="result-tabs" role="tablist" aria-label="결과 보기">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`result-tab${activeTab === tab.id ? ' result-tab--active' : ''}`}
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="result-tab-panel panel-placeholder" role="tabpanel">
          <p className="panel-placeholder-text">
            {activeTab === 'summary'
              ? '회의록 요약이 여기에 표시됩니다.'
              : '전체 스크립트가 여기에 표시됩니다.'}
          </p>
        </div>
      </section>

      <section className="draft-timeline" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="panel-section-title">
          초안 생성 타임라인
        </h2>
        <div className="timeline-body panel-placeholder">
          <p className="panel-placeholder-text">초안 생성 단계별 진행 이력이 여기에 표시됩니다.</p>
        </div>
      </section>
    </div>
  );
}
