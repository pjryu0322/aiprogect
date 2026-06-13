import type { MeetingInputFlowViewModel } from "../../../features/input/MeetingInputFlow.types";
import type {
  InputScreenFileStatus,
  InputScreenMeetingFile,
  InputScreenParticipant,
  InputScreenStatus,
  InputScreenViewModel,
} from "./InputScreen.types";
import { mapFlowStatusToScreenStatus, resolveParticipantStatus } from "./inputScreen.utils";

export interface BuildInputScreenViewModelOptions {
  isUploading?: boolean;
  uploadProgress?: number;
  durationLabel?: string;
  fileStatus?: InputScreenFileStatus;
}

function mapMeetingFile(
  meetingFile: MeetingInputFlowViewModel["meetingFile"],
  options: BuildInputScreenViewModelOptions
): InputScreenMeetingFile | null {
  if (!meetingFile) {
    return null;
  }

  let status: InputScreenFileStatus = options.fileStatus ?? "uploaded";

  if (options.isUploading) {
    status = "uploading";
  } else if (options.fileStatus) {
    status = options.fileStatus;
  } else if (meetingFile) {
    status = "uploaded";
  }

  return {
    id: meetingFile.id,
    name: meetingFile.name,
    sizeLabel: meetingFile.sizeLabel,
    durationLabel: options.durationLabel,
    status,
  };
}

function mapParticipants(
  participants: MeetingInputFlowViewModel["participants"]
): InputScreenParticipant[] {
  return participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    role: participant.role,
    status: resolveParticipantStatus({
      id: participant.id,
      name: participant.name,
      role: participant.role,
      status: "draft",
    }),
  }));
}

export function buildInputScreenViewModel(
  flowViewModel: MeetingInputFlowViewModel,
  options: BuildInputScreenViewModelOptions = {}
): InputScreenViewModel {
  const screenStatus: InputScreenStatus = mapFlowStatusToScreenStatus(
    flowViewModel.status,
    options.isUploading ?? false
  );

  const meetingFile = mapMeetingFile(flowViewModel.meetingFile, options);

  if (meetingFile && screenStatus === "ready") {
    meetingFile.status = "ready";
  }

  return {
    status: screenStatus,
    screenStatus,
    meetingFile,
    participants: mapParticipants(flowViewModel.participants),
    workItems: flowViewModel.workItems,
    workspaceInput: flowViewModel.workspaceInput,
    analysisOptions: flowViewModel.analysisOptions,
    canProceedToAnalysis: flowViewModel.canProceedToAnalysis && screenStatus === "ready",
    primaryBlocker: flowViewModel.primaryBlocker,
    primaryBlockerMessage: flowViewModel.primaryBlockerMessage,
    uploadProgress: options.uploadProgress,
  };
}
