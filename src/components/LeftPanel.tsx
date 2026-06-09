export function LeftPanel() {
  return (
    <div className="panel-content">
      <section className="panel-section" aria-labelledby="meeting-files-heading">
        <h2 id="meeting-files-heading" className="panel-section-title">
          회의 파일
        </h2>
        <div className="panel-section-body panel-placeholder">
          <p className="panel-placeholder-text">업로드된 회의 녹취 파일이 여기에 표시됩니다.</p>
        </div>
      </section>

      <section className="panel-section" aria-labelledby="participants-heading">
        <h2 id="participants-heading" className="panel-section-title">
          참여자
        </h2>
        <div className="panel-section-body panel-placeholder">
          <p className="panel-placeholder-text">회의 참여자 목록이 여기에 표시됩니다.</p>
        </div>
      </section>
    </div>
  );
}
