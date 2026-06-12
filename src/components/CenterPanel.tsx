import { sampleTranscriptSegments } from '../data/sampleData';
export function CenterPanel() {
  return (
    <div className="panel-content panel-content--center">
      <section className="workspace-area" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" className="visually-hidden">
          작업 공간
        </h2>
        <div className="workspace-canvas panel-placeholder">
          <div className="jy-preview-transcript" data-jy-preview-sample="v2" style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>{sampleTranscriptSegments.map((seg) => { const ts = String(seg.timestamp ?? seg.time ?? "").trim(); const speaker = String(seg.speakerName ?? seg.speaker ?? "화자").trim(); return (<div key={seg.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span style={{ fontSize: 11, color: "#94a3b8", minWidth: 44, fontVariantNumeric: "tabular-nums" }}>{ts || "00:00"}</span><div style={{ flex: 1, background: "#f1f5f9", borderRadius: 10, padding: "10px 12px" }}><div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: "#334155" }}>{speaker}</div><div style={{ fontSize: 13, lineHeight: 1.5, color: "#1e293b" }}>{seg.text}</div></div></div>); })}</div>
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
