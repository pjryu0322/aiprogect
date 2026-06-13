import { MeetingFileBlock } from "./MeetingFileBlock";
import { ParticipantListBlock } from "./ParticipantListBlock";
import type { InputScreenProps } from "./InputScreen.types";
import { WorkspaceInputBar } from "./WorkspaceInputBar";
import { WorkspaceWorkItems } from "./WorkspaceWorkItems";
import "./inputScreen.css";

export function InputScreenMeetingFilesSection({
  viewModel,
  onFileSelect,
  onFileClear,
  accept,
  disabled,
}: Pick<
  InputScreenProps,
  "viewModel" | "onFileSelect" | "onFileClear" | "accept" | "disabled"
>) {
  return (
    <section className="input-screen-section" aria-labelledby="input-screen-meeting-files-heading">
      <h3 id="input-screen-meeting-files-heading" className="input-screen-section__title">
        회의 파일
      </h3>
      <MeetingFileBlock
        status={viewModel.screenStatus}
        meetingFile={viewModel.meetingFile}
        uploadProgress={viewModel.uploadProgress}
        primaryBlocker={viewModel.primaryBlocker}
        primaryBlockerMessage={viewModel.primaryBlockerMessage}
        onFileSelect={onFileSelect}
        onFileClear={onFileClear}
        accept={accept}
        disabled={disabled}
      />
    </section>
  );
}

export function InputScreenParticipantsSection({
  viewModel,
  onParticipantAdd,
  onParticipantUpdate,
  onParticipantRemove,
  disabled,
}: Pick<
  InputScreenProps,
  "viewModel" | "onParticipantAdd" | "onParticipantUpdate" | "onParticipantRemove" | "disabled"
>) {
  return (
    <section className="input-screen-section" aria-labelledby="input-screen-participants-heading">
      <h3 id="input-screen-participants-heading" className="input-screen-section__title">
        참여자
      </h3>
      <ParticipantListBlock
        status={viewModel.screenStatus}
        participants={viewModel.participants}
        primaryBlocker={viewModel.primaryBlocker}
        primaryBlockerMessage={viewModel.primaryBlockerMessage}
        onParticipantAdd={onParticipantAdd}
        onParticipantUpdate={onParticipantUpdate}
        onParticipantRemove={onParticipantRemove}
        disabled={disabled}
      />
    </section>
  );
}

export function InputScreenWorkspaceSection({
  viewModel,
  onWorkspaceInputChange,
  onWorkItemAdd,
  onWorkItemRemove,
  onWorkItemUpdate,
  onProceedToAnalysisStart,
  disabled,
}: Pick<
  InputScreenProps,
  | "viewModel"
  | "onWorkspaceInputChange"
  | "onWorkItemAdd"
  | "onWorkItemRemove"
  | "onWorkItemUpdate"
  | "onProceedToAnalysisStart"
  | "disabled"
>) {
  return (
    <>
      <WorkspaceWorkItems
        status={viewModel.screenStatus}
        meetingFile={viewModel.meetingFile}
        participants={viewModel.participants}
        workItems={viewModel.workItems}
        primaryBlocker={viewModel.primaryBlocker}
        primaryBlockerMessage={viewModel.primaryBlockerMessage}
        onWorkItemUpdate={onWorkItemUpdate}
        onWorkItemRemove={onWorkItemRemove}
        disabled={disabled}
      />
      <WorkspaceInputBar
        status={viewModel.screenStatus}
        workspaceInput={viewModel.workspaceInput}
        canProceedToAnalysis={viewModel.canProceedToAnalysis}
        onWorkspaceInputChange={onWorkspaceInputChange}
        onWorkItemAdd={onWorkItemAdd}
        onProceedToAnalysisStart={onProceedToAnalysisStart}
        disabled={disabled}
      />
    </>
  );
}

export function InputScreen({
  viewModel,
  onFileSelect,
  onFileClear,
  onParticipantAdd,
  onParticipantUpdate,
  onParticipantRemove,
  onWorkspaceInputChange,
  onWorkItemAdd,
  onWorkItemRemove,
  onWorkItemUpdate,
  onProceedToAnalysisStart,
  accept,
  disabled = false,
  className,
}: InputScreenProps) {
  const rootClass = ["input-screen", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="input-screen-layout">
        <aside className="input-screen-layout__left" aria-label="회의 정보">
          <InputScreenMeetingFilesSection
            viewModel={viewModel}
            onFileSelect={onFileSelect}
            onFileClear={onFileClear}
            accept={accept}
            disabled={disabled}
          />
          <InputScreenParticipantsSection
            viewModel={viewModel}
            onParticipantAdd={onParticipantAdd}
            onParticipantUpdate={onParticipantUpdate}
            onParticipantRemove={onParticipantRemove}
            disabled={disabled}
          />
        </aside>

        <section className="input-screen-layout__center" aria-label="작업 공간">
          <header className="input-screen-layout__center-header">
            <h2 className="workspace-panel__title">작업 공간</h2>
            <p className="workspace-panel__subtitle">
              업로드·변환·화자 분리·초안 생성 진행을 확인합니다
            </p>
          </header>
          <div className="input-screen-layout__center-body">
            <WorkspaceWorkItems
              status={viewModel.screenStatus}
              meetingFile={viewModel.meetingFile}
              participants={viewModel.participants}
              workItems={viewModel.workItems}
              primaryBlocker={viewModel.primaryBlocker}
              primaryBlockerMessage={viewModel.primaryBlockerMessage}
              onWorkItemUpdate={onWorkItemUpdate}
              onWorkItemRemove={onWorkItemRemove}
              disabled={disabled}
            />
          </div>
          <div className="input-screen-layout__center-footer">
            <WorkspaceInputBar
              status={viewModel.screenStatus}
              workspaceInput={viewModel.workspaceInput}
              canProceedToAnalysis={viewModel.canProceedToAnalysis}
              onWorkspaceInputChange={onWorkspaceInputChange}
              onWorkItemAdd={onWorkItemAdd}
              onProceedToAnalysisStart={onProceedToAnalysisStart}
              disabled={disabled}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export type {
  InputScreenAnalysisOptions,
  InputScreenBlocker,
  InputScreenCallbacks,
  InputScreenContainerProps,
  InputScreenFileStatus,
  InputScreenMeetingFile,
  InputScreenParticipant,
  InputScreenParticipantStatus,
  InputScreenProps,
  InputScreenStatus,
  InputScreenViewModel,
  InputScreenWorkItem,
  MeetingFileBlockProps,
  ParticipantListBlockProps,
  WorkspaceInputBarProps,
  WorkspaceWorkItemsProps,
} from "./InputScreen.types";

export {
  MeetingFileBlock,
  ParticipantListBlock,
  WorkspaceInputBar,
  WorkspaceWorkItems,
};

export {
  formatDurationLabel,
  formatFileSize,
  getFileStatusLabel,
  getParticipantStatusLabel,
  getWorkspaceStatusDescription,
  getWorkspaceStatusHeadline,
  mapFlowStatusToScreenStatus,
  readMediaDurationLabel,
  resolveParticipantStatus,
} from "./inputScreen.utils";

export { buildInputScreenViewModel } from "./buildInputScreenViewModel";
