import type { ResultTab } from '../../../screens/ResultScreen.types';
import { RESULT_TABS } from '../../../screens/ResultScreen.types';

interface ResultTabsProps {
  activeTab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
}

export function ResultTabs({ activeTab, onTabChange }: ResultTabsProps) {
  return (
    <div className="result-tabs" role="tablist" aria-label="결과 보기">
      {RESULT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          className={`result-tab${activeTab === tab.id ? ' result-tab--active' : ''}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`result-tabpanel-${tab.id}`}
          id={`result-tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
