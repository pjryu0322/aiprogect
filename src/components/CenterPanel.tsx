export function CenterPanel() {
  return (
    <div className="panel-content panel-content--center">
      <section className="workspace-area" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" className="visually-hidden">
          작업 공간
        </h2>
        <div className="workspace-canvas panel-placeholder">
          <p className="panel-placeholder-text">
            업로드, 변환, 화자 분리, 초안 생성 진행 상태와 작업 내용이 여기에 표시됩니다.
          </p>
        </div>
      </section>

      <footer className="workspace-input-bar" aria-label="입력">
        <input
          type="text"
          className="workspace-input"
          placeholder="메시지 또는 지시를 입력하세요…"
          aria-label="작업 입력"
        />
        <button type="button" className="workspace-submit-btn">
          전송
        </button>
      </footer>
    </div>
  );
}
