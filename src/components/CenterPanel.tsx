import { sampleTranscriptSegments } from '../data/sampleData';
export function CenterPanel() {
  return (
    <div className="panel-content panel-content--center">
      <section className="workspace-area" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" className="visually-hidden">
          작업 공간
        </h2>
        <div className="workspace-canvas panel-placeholder">
          <ul className="sample-transcript">{sampleTranscriptSegments.map((seg) => (<li key={seg.id}><strong>{seg.speakerName}</strong> [{seg.timestamp}] {seg.text}</li>))}</ul>
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
