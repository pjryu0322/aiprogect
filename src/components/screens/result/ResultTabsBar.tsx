import type { ResultScreenTabId, ResultTabsBarProps } from "./ResultScreen.types";

const RESULT_TABS: { id: ResultScreenTabId; label: string }[] = [
  { id: "summary", label: "요약본" },
  { id: "script", label: "스크립트" },
];

export function ResultTabsBar({
  activeTab,
  onTabChange,
  disabled = false,
  tabPanelId,
  className,
}: ResultTabsBarProps) {
  const rootClass = ["result-screen-tabs", className].filter(Boolean).join(" ");

  return (
    <nav className={`result-tabs ${rootClass}`} aria-label="결과 탭">
      {RESULT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`result-screen-tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={tabPanelId}
          className={`result-tab${activeTab === tab.id ? " result-tab--active" : ""}`}
          disabled={disabled}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
