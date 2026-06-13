import type { ReactNode } from "react";

interface LeftPanelProps {
  mobileActive?: boolean;
  children?: ReactNode;
}

export function LeftPanel({ mobileActive = false, children }: LeftPanelProps) {
  return (
    <aside
      className={`workspace-panel workspace-panel--left${
        mobileActive ? " workspace-panel--mobile-active" : ""
      }`}
      aria-label="회의 정보"
    >
      <header className="workspace-panel__header">
        <h2 className="workspace-panel__title">회의 정보</h2>
        <p className="workspace-panel__subtitle">파일 및 참여자</p>
      </header>

      <div className="workspace-panel__content">
        {children ?? (
          <>
            <section className="workspace-panel__section" aria-labelledby="meeting-files-heading">
              <h3 id="meeting-files-heading" className="workspace-panel__section-title">
                회의 파일
              </h3>
              <div className="file-list-item">
                <div className="file-list-item__icon" aria-hidden="true">
                  🎙
                </div>
                <div className="file-list-item__info">
                  <div className="file-list-item__name">회의 녹취 파일</div>
                  <div className="file-list-item__meta">업로드 대기</div>
                </div>
              </div>
              <div className="panel-placeholder">
                녹취 파일을 업로드하면
                <br />
                여기에 표시됩니다
              </div>
            </section>

            <section className="workspace-panel__section" aria-labelledby="participants-heading">
              <h3 id="participants-heading" className="workspace-panel__section-title">
                참여자
              </h3>
              <div className="participant-item">
                <div className="participant-item__avatar" aria-hidden="true">
                  ?
                </div>
                <div className="participant-item__info">
                  <div className="participant-item__name">화자 분리 대기</div>
                  <div className="participant-item__role">STT 변환 후 자동 식별</div>
                </div>
              </div>
              <div className="panel-placeholder">
                화자 분리가 완료되면
                <br />
                참여자 목록이 표시됩니다
              </div>
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
