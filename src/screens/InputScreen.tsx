import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMeetingInputFlow } from "../../features/input/MeetingInputFlow";
import type { MeetingInputPayload } from "../../features/input/MeetingInputFlow.types";
import {
  InputScreen,
  InputScreenMeetingFilesSection,
  InputScreenParticipantsSection,
  InputScreenWorkspaceSection,
  buildInputScreenViewModel,
  readMediaDurationLabel,
} from "../components/screens/input/InputScreen";
import type { InputScreenContainerProps } from "../components/screens/input/InputScreen.types";

const UPLOAD_SIMULATION_MS = 900;

export function InputScreenContainer({
  onProceedToAnalysis,
  simulateUpload = true,
  disabled = false,
  className,
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
}: InputScreenContainerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [durationLabel, setDurationLabel] = useState<string | undefined>();
  const uploadTimerRef = useRef<number | null>(null);

  const clearUploadTimer = useCallback(() => {
    if (uploadTimerRef.current !== null) {
      window.clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearUploadTimer, [clearUploadTimer]);

  const flow = useMeetingInputFlow({
    onProceedToAnalysisStart: (payload: MeetingInputPayload) => {
      onProceedToAnalysisStart?.();
      onProceedToAnalysis?.(payload);
    },
    onFileSelect: (file, meetingFile) => {
      onFileSelect?.(file);

      void readMediaDurationLabel(file).then(setDurationLabel);

      if (!simulateUpload) {
        return;
      }

      clearUploadTimer();
      setIsUploading(true);
      setUploadProgress(12);

      uploadTimerRef.current = window.setInterval(() => {
        setUploadProgress((current) => {
          if (current >= 96) {
            return current;
          }
          return current + 14;
        });
      }, 120);

      window.setTimeout(() => {
        clearUploadTimer();
        setUploadProgress(100);
        setIsUploading(false);
      }, UPLOAD_SIMULATION_MS);
    },
    onFileClear: () => {
      clearUploadTimer();
      setIsUploading(false);
      setUploadProgress(0);
      setDurationLabel(undefined);
      onFileClear?.();
    },
    onParticipantAdd: () => onParticipantAdd?.(),
    onParticipantUpdate: (participant) =>
      onParticipantUpdate?.({
        id: participant.id,
        name: participant.name,
        role: participant.role,
        status: participant.name.trim() && participant.role.trim() ? "ready" : "draft",
      }),
    onParticipantRemove: (participantId) => onParticipantRemove?.(participantId),
    onWorkspaceInputChange: (value) => onWorkspaceInputChange?.(value),
    onWorkItemAdd: () => onWorkItemAdd?.(),
    onWorkItemRemove: (workItemId) => onWorkItemRemove?.(workItemId),
    onWorkItemUpdate: (workItem) => onWorkItemUpdate?.(workItem),
  });

  const viewModel = useMemo(
    () =>
      buildInputScreenViewModel(flow.viewModel, {
        isUploading,
        uploadProgress: isUploading ? uploadProgress : undefined,
        durationLabel,
      }),
    [flow.viewModel, isUploading, uploadProgress, durationLabel]
  );

  return (
    <InputScreen
      viewModel={viewModel}
      onFileSelect={flow.selectFile}
      onFileClear={flow.clearFile}
      onParticipantAdd={() => {
        flow.addParticipant();
      }}
      onParticipantUpdate={(participant) => {
        flow.updateParticipant({
          id: participant.id,
          name: participant.name,
          role: participant.role,
        });
      }}
      onParticipantRemove={flow.removeParticipant}
      onWorkspaceInputChange={flow.setWorkspaceInput}
      onWorkItemAdd={flow.addWorkItemFromInput}
      onWorkItemRemove={flow.removeWorkItem}
      onWorkItemUpdate={flow.updateWorkItem}
      onProceedToAnalysisStart={flow.proceedToAnalysisStart}
      disabled={disabled}
      className={className}
    />
  );
}

export type { InputScreenContainerProps } from "../components/screens/input/InputScreen.types";

export {
  InputScreen,
  InputScreenMeetingFilesSection,
  InputScreenParticipantsSection,
  InputScreenWorkspaceSection,
  MeetingFileBlock,
  ParticipantListBlock,
  WorkspaceInputBar,
  WorkspaceWorkItems,
  buildInputScreenViewModel,
} from "../components/screens/input/InputScreen";

export type {
  InputScreenAnalysisOptions,
  InputScreenBlocker,
  InputScreenCallbacks,
  InputScreenFileStatus,
  InputScreenMeetingFile,
  InputScreenParticipant,
  InputScreenParticipantStatus,
  InputScreenProps,
  InputScreenStatus,
  InputScreenViewModel,
  InputScreenWorkItem,
} from "../components/screens/input/InputScreen.types";
