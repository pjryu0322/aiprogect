import { sampleMeetingSummary, sampleDecisions, sampleActionItems } from '../data/sampleData';
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
          <div className="sample-summary"><h4>{sampleMeetingSummary.title}</h4><p>{sampleMeetingSummary.overview}</p><ul>{sampleMeetingSummary.keyPoints.map((point, i) => (<li key={i}>{point}</li>))}</ul><h5>결정</h5><ul>{sampleDecisions.map((d) => (<li key={d.id}>{d.text}</li>))}</ul><h5>할 일</h5><ul>{sampleActionItems.map((a) => (<li key={a.id}>{a.task}</li>))}</ul></div>
        </div>
      </section>

      <section className="draft-timeline" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="panel-section-title">
          초안 생성 타임라인
        </h2>
        <div className="timeline-body panel-placeholder">
          <div className="sample-summary"><h4>{sampleMeetingSummary.title}</h4><p>{sampleMeetingSummary.overview}</p><ul>{sampleMeetingSummary.keyPoints.map((point, i) => (<li key={i}>{point}</li>))}</ul><h5>결정</h5><ul>{sampleDecisions.map((d) => (<li key={d.id}>{d.text}</li>))}</ul><h5>할 일</h5><ul>{sampleActionItems.map((a) => (<li key={a.id}>{a.task}</li>))}</ul></div>
        </div>
      </section>
    </div>
  );
}
