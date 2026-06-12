import { sampleMeetingFiles } from '../data/sampleData';
export function LeftPanel() {
  return (
    <div className="panel-content">
      <section className="panel-section" aria-labelledby="meeting-files-heading">
        <h2 id="meeting-files-heading" className="panel-section-title">
          회의 파일
        </h2>
        <div className="panel-section-body panel-placeholder">
          <ul className="sample-meeting-files">{sampleMeetingFiles.map((file) => (<li key={file.id}>{file.name} · {file.duration}</li>))}</ul>
        </div>
      </section>

      <section className="panel-section" aria-labelledby="participants-heading">
        <h2 id="participants-heading" className="panel-section-title">
          참여자
        </h2>
        <div className="panel-section-body panel-placeholder">
          <ul className="sample-meeting-files">{sampleMeetingFiles.map((file) => (<li key={file.id}>{file.name} · {file.duration}</li>))}</ul>
        </div>
      </section>
    </div>
  );
}
