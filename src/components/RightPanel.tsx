import { useState, type ReactNode } from "react";
import type { ResultTabId } from "./WorkspaceShell.types";

const RESULT_TABS: { id: ResultTabId; label: string }[] = [
  { id: "summary", label: "요약본" },
  { id: "script", label: "스크립트" },
];

type TimelineStatus = "pending" | "active" | "done";

const TIMELINE_ITEMS: {
  id: string;
  label: string;
  time: string;
  status: TimelineStatus;
}[] = [
  { id: "upload", label: "파일 업로드", time: "대기 중", status: "pending" },
  { id: "stt", label: "STT 변환", time: "—", status: "pending" },
  { id: "speaker", label: "화자 분리", time: "—", status: "pending" },
  { id: "draft", label: "초안 생성", time: "—", status: "pending" },
];

interface RightPanelProps {
  mobileActive?: boolean;
  resultContent?: Partial<Record<ResultTabId, ReactNode>>;
}

export function RightPanel({ mobileActive = false, resultContent }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<ResultTabId>("summary");

  return (
    <aside
      className={`workspace-panel workspace-panel--right${
        mobileActive ? " workspace-panel--mobile-active" : ""
      }`}
      aria-label="결과 패널"
    >
      <header className="workspace-panel__header">
        <h2 className="workspace-panel__title">결과 패널</h2>
        <p className="workspace-panel__subtitle">요약본·스크립트·초안 타임라인</p>
      </header>

      <nav className="result-tabs" aria-label="결과 탭">
        {RESULT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`result-tab${activeTab === tab.id ? " result-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="result-panel__body" role="tabpanel">
        {resultContent?.[activeTab] ?? (
          activeTab === "summary" ? (
            <div className="panel-placeholder">
              회의록 요약이 생성되면
              <br />
              이 탭에 표시됩니다
            </div>
          ) : (
            <div className="panel-placeholder">
              STT 스크립트가 준비되면
              <br />
              이 탭에 표시됩니다
            </div>
          )
        )}
      </div>

      <section className="draft-timeline" aria-labelledby="draft-timeline-heading">
        <h3 id="draft-timeline-heading" className="draft-timeline__title">
          초안 생성 타임라인
        </h3>
        {TIMELINE_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`timeline-item${
              item.status === "active" ? " timeline-item--active" : ""
            }${item.status === "done" ? " timeline-item--done" : ""}`}
          >
            <div className="timeline-item__dot" aria-hidden="true" />
            <div className="timeline-item__content">
              <div className="timeline-item__label">{item.label}</div>
              <div className="timeline-item__time">{item.time}</div>
            </div>
          </div>
        ))}
      </section>
    </aside>
  );
}
