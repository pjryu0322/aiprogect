import { useState } from "react";

interface CenterPanelProps {
  mobileActive?: boolean;
}

export function CenterPanel({ mobileActive = false }: CenterPanelProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <main
      className={`center-panel workspace-panel workspace-panel--center${
        mobileActive ? " workspace-panel--mobile-active" : ""
      }`}
      aria-label="작업 공간"
    >
      <div className="center-panel__workspace">
        <header className="center-panel__workspace-header">
          <h2 className="workspace-panel__title">작업 공간</h2>
          <p className="workspace-panel__subtitle">
            업로드·변환·화자 분리·초안 생성 진행을 확인합니다
          </p>
        </header>

        <div className="center-panel__workspace-body">
          <div className="panel-placeholder">
            회의 녹취를 업로드하고 변환을 시작하면
            <br />
            처리 상태와 중간 결과가 이 영역에 표시됩니다
          </div>
        </div>
      </div>

      <footer className="center-panel__input-bar" aria-label="업무 입력">
        <label htmlFor="workspace-input" className="sr-only">
          업무 입력
        </label>
        <textarea
          id="workspace-input"
          className="center-panel__input"
          placeholder="회의 관련 지시나 메모를 입력하세요..."
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="button" className="center-panel__send-btn">
          전송
        </button>
      </footer>
    </main>
  );
}
