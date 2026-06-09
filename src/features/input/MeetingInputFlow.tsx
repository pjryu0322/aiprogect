import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { FileListEmptyState } from '../../components/common/EmptyState';
import { WorkspaceEmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import type { MeetingFile, Participant } from '../../data/types';
import {
  ACCEPTED_AUDIO_EXTENSIONS,
  ANALYSIS_LANGUAGE_OPTIONS,
  DEFAULT_ANALYSIS_OPTIONS,
  type AnalysisOptions,
  type MeetingInputFieldErrors,
  type MeetingInputFile,
  type MeetingInputFlowContextValue,
  type MeetingInputFlowStatus,
  type MeetingInputParticipant,
  type MeetingInputPayload,
  type WorkspaceTask,
} from './MeetingInputFlow.types';
import './MeetingInputFlow.css';

const INITIAL_STATUS_MESSAGE =
  '회의 녹취 파일, 참여자, 분석 옵션을 입력하면 작업 공간에서 분석을 시작할 수 있습니다.';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractFormat(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return 'unknown';
  }
  return fileName.slice(dotIndex + 1).toLowerCase();
}

function isAcceptedAudioFile(file: File): boolean {
  const extension = `.${extractFormat(file.name)}`;
  return ACCEPTED_AUDIO_EXTENSIONS.includes(extension);
}

function createMeetingInputFile(file: File): MeetingInputFile {
  return {
    id: `file-${crypto.randomUUID()}`,
    name: file.name,
    sizeBytes: file.size,
    format: extractFormat(file.name),
    file,
  };
}

function createParticipant(
  overrides?: Partial<MeetingInputParticipant>,
): MeetingInputParticipant {
  return {
    id: `participant-${crypto.randomUUID()}`,
    name: overrides?.name ?? '',
    role: overrides?.role ?? '',
  };
}

function createWorkspaceTask(text: string): WorkspaceTask {
  return {
    id: `task-${crypto.randomUUID()}`,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
}

function toMeetingFile(inputFile: MeetingInputFile): MeetingFile {
  return {
    id: inputFile.id,
    name: inputFile.name,
    sizeBytes: inputFile.sizeBytes,
    durationSeconds: 0,
    format: inputFile.format,
    uploadedAt: new Date().toISOString(),
  };
}

function toParticipant(inputParticipant: MeetingInputParticipant): Participant {
  return {
    id: inputParticipant.id,
    name: inputParticipant.name.trim(),
    role: inputParticipant.role.trim() || '참여자',
  };
}

function validateParticipants(participants: MeetingInputParticipant[]): string | undefined {
  if (participants.length === 0) {
    return '최소 1명의 참여자를 추가해 주세요.';
  }

  const emptyNames = participants.filter((participant) => !participant.name.trim());
  if (emptyNames.length > 0) {
    return '참여자 이름을 모두 입력해 주세요.';
  }

  return undefined;
}

function resolveReadyStatus(
  files: MeetingInputFile[],
  participants: MeetingInputParticipant[],
): MeetingInputFlowStatus {
  const hasFiles = files.length > 0;
  const hasValidParticipants =
    participants.length > 0 && participants.every((participant) => participant.name.trim());

  return hasFiles && hasValidParticipants ? 'ready' : 'idle';
}

function resolveStatusMessage(
  status: MeetingInputFlowStatus,
  files: MeetingInputFile[],
  participants: MeetingInputParticipant[],
  fieldErrors: MeetingInputFieldErrors,
): string {
  if (fieldErrors.general) {
    return fieldErrors.general;
  }

  if (status === 'validating') {
    return '입력 내용을 확인하는 중입니다…';
  }

  if (status === 'ready') {
    const fileLabel = files.length === 1 ? `「${files[0].name}」` : `${files.length}개 파일`;
    return `${fileLabel} · 참여자 ${participants.length}명 · 분석 시작 준비 완료`;
  }

  if (files.length === 0) {
    return '회의 녹취 파일을 업로드해 주세요.';
  }

  if (participants.length === 0) {
    return '참여자를 추가해 주세요.';
  }

  return INITIAL_STATUS_MESSAGE;
}

const MeetingInputFlowContext = createContext<MeetingInputFlowContextValue | null>(null);

function useMeetingInputFlowContext(): MeetingInputFlowContextValue {
  const context = useContext(MeetingInputFlowContext);
  if (!context) {
    throw new Error('MeetingInputFlow components must be used within MeetingInputFlowProvider');
  }
  return context;
}

export function useMeetingInputFlow(): MeetingInputFlowContextValue {
  return useMeetingInputFlowContext();
}

export interface MeetingInputFlowProviderProps {
  children: ReactNode;
  onStatusChange?: (status: MeetingInputFlowStatus) => void;
  onReady?: (payload: MeetingInputPayload) => void;
}

export function MeetingInputFlowProvider({
  children,
  onStatusChange,
  onReady,
}: MeetingInputFlowProviderProps) {
  const [status, setStatus] = useState<MeetingInputFlowStatus>('idle');
  const [files, setFiles] = useState<MeetingInputFile[]>([]);
  const [participants, setParticipants] = useState<MeetingInputParticipant[]>([
    createParticipant(),
  ]);
  const [analysisOptions, setAnalysisOptions] =
    useState<AnalysisOptions>(DEFAULT_ANALYSIS_OPTIONS);
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);
  const [fieldErrors, setFieldErrors] = useState<MeetingInputFieldErrors>({});

  const updateStatus = useCallback(
    (nextStatus: MeetingInputFlowStatus) => {
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
    },
    [onStatusChange],
  );

  const syncStatus = useCallback(
    (
      nextFiles: MeetingInputFile[],
      nextParticipants: MeetingInputParticipant[],
      nextErrors: MeetingInputFieldErrors,
    ) => {
      if (Object.keys(nextErrors).length > 0) {
        updateStatus('validating');
        return;
      }

      updateStatus(resolveReadyStatus(nextFiles, nextParticipants));
    },
    [updateStatus],
  );

  const addFile = useCallback(
    (file: File) => {
      if (!isAcceptedAudioFile(file)) {
        const nextErrors: MeetingInputFieldErrors = {
          files: `지원하지 않는 파일 형식입니다. ${ACCEPTED_AUDIO_EXTENSIONS.join(', ')} 형식만 업로드할 수 있습니다.`,
        };
        setFieldErrors(nextErrors);
        syncStatus(files, participants, nextErrors);
        return;
      }

      const nextFile = createMeetingInputFile(file);
      const nextFiles = [...files, nextFile];
      const nextErrors: MeetingInputFieldErrors = {};

      setFiles(nextFiles);
      setFieldErrors(nextErrors);
      syncStatus(nextFiles, participants, nextErrors);
    },
    [files, participants, syncStatus],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      const nextFiles = files.filter((file) => file.id !== fileId);
      const nextErrors: MeetingInputFieldErrors = { ...fieldErrors };
      delete nextErrors.files;

      setFiles(nextFiles);
      setFieldErrors(nextErrors);
      syncStatus(nextFiles, participants, nextErrors);
    },
    [fieldErrors, files, participants, syncStatus],
  );

  const addParticipant = useCallback(
    (participant?: Partial<MeetingInputParticipant>) => {
      const nextParticipants = [...participants, createParticipant(participant)];
      const nextErrors: MeetingInputFieldErrors = { ...fieldErrors };
      delete nextErrors.participants;

      setParticipants(nextParticipants);
      setFieldErrors(nextErrors);
      syncStatus(files, nextParticipants, nextErrors);
    },
    [fieldErrors, files, participants, syncStatus],
  );

  const updateParticipant = useCallback(
    (
      participantId: string,
      updates: Partial<Pick<MeetingInputParticipant, 'name' | 'role'>>,
    ) => {
      const nextParticipants = participants.map((participant) =>
        participant.id === participantId ? { ...participant, ...updates } : participant,
      );
      const nextErrors: MeetingInputFieldErrors = { ...fieldErrors };
      delete nextErrors.participants;

      setParticipants(nextParticipants);
      setFieldErrors(nextErrors);
      syncStatus(files, nextParticipants, nextErrors);
    },
    [fieldErrors, files, participants, syncStatus],
  );

  const removeParticipant = useCallback(
    (participantId: string) => {
      const nextParticipants = participants.filter(
        (participant) => participant.id !== participantId,
      );
      const nextErrors: MeetingInputFieldErrors = { ...fieldErrors };
      delete nextErrors.participants;

      setParticipants(nextParticipants);
      setFieldErrors(nextErrors);
      syncStatus(files, nextParticipants, nextErrors);
    },
    [fieldErrors, files, participants, syncStatus],
  );

  const updateAnalysisOptions = useCallback((updates: Partial<AnalysisOptions>) => {
    setAnalysisOptions((current) => ({ ...current, ...updates }));
  }, []);

  const addWorkspaceTask = useCallback(
    (text: string): boolean => {
      const trimmed = text.trim();
      if (!trimmed) {
        const nextErrors: MeetingInputFieldErrors = {
          ...fieldErrors,
          tasks: '작업 내용을 입력해 주세요.',
        };
        setFieldErrors(nextErrors);
        return false;
      }

      const nextTasks = [...workspaceTasks, createWorkspaceTask(trimmed)];
      const nextErrors: MeetingInputFieldErrors = { ...fieldErrors };
      delete nextErrors.tasks;

      setWorkspaceTasks(nextTasks);
      setFieldErrors(nextErrors);
      return true;
    },
    [fieldErrors, workspaceTasks],
  );

  const removeWorkspaceTask = useCallback((taskId: string) => {
    setWorkspaceTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const buildPayload = useCallback((): MeetingInputPayload | null => {
    if (files.length === 0) {
      return null;
    }

    const participantError = validateParticipants(participants);
    if (participantError) {
      return null;
    }

    return {
      files: files.map(toMeetingFile),
      participants: participants.map(toParticipant),
      analysisOptions,
      workspaceTasks,
    };
  }, [analysisOptions, files, participants, workspaceTasks]);

  const validate = useCallback((): boolean => {
    const nextErrors: MeetingInputFieldErrors = {};

    if (files.length === 0) {
      nextErrors.files = '분석을 시작하려면 회의 녹취 파일을 먼저 업로드해 주세요.';
    }

    const participantError = validateParticipants(participants);
    if (participantError) {
      nextErrors.participants = participantError;
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      updateStatus('validating');
      return false;
    }

    const payload = buildPayload();
    if (!payload) {
      updateStatus('validating');
      return false;
    }

    updateStatus('ready');
    onReady?.(payload);
    return true;
  }, [buildPayload, files.length, onReady, participants, updateStatus]);

  const reset = useCallback(() => {
    setFiles([]);
    setParticipants([createParticipant()]);
    setAnalysisOptions(DEFAULT_ANALYSIS_OPTIONS);
    setWorkspaceTasks([]);
    setFieldErrors({});
    updateStatus('idle');
  }, [updateStatus]);

  const statusMessage = useMemo(
    () => resolveStatusMessage(status, files, participants, fieldErrors),
    [fieldErrors, files, participants, status],
  );

  const value = useMemo<MeetingInputFlowContextValue>(
    () => ({
      status,
      files,
      participants,
      analysisOptions,
      workspaceTasks,
      fieldErrors,
      statusMessage,
      addFile,
      removeFile,
      addParticipant,
      updateParticipant,
      removeParticipant,
      updateAnalysisOptions,
      addWorkspaceTask,
      removeWorkspaceTask,
      validate,
      buildPayload,
      reset,
    }),
    [
      addFile,
      addParticipant,
      addWorkspaceTask,
      analysisOptions,
      buildPayload,
      fieldErrors,
      files,
      participants,
      removeFile,
      removeParticipant,
      removeWorkspaceTask,
      reset,
      status,
      statusMessage,
      updateAnalysisOptions,
      updateParticipant,
      validate,
      workspaceTasks,
    ],
  );

  return (
    <MeetingInputFlowContext.Provider value={value}>{children}</MeetingInputFlowContext.Provider>
  );
}

export interface MeetingInputFlowMeetingFilesProps {
  className?: string;
}

export function MeetingInputFlowMeetingFiles({ className = '' }: MeetingInputFlowMeetingFilesProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, fieldErrors, addFile, removeFile } = useMeetingInputFlowContext();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => addFile(file));
    }
    event.target.value = '';
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`meeting-input-files${className ? ` ${className}` : ''}`}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="meeting-input-file-picker"
        accept={ACCEPTED_AUDIO_EXTENSIONS.join(',')}
        multiple
        onChange={handleInputChange}
        aria-describedby={fieldErrors.files ? 'meeting-input-file-error' : undefined}
      />

      {fieldErrors.files ? (
        <div className="meeting-input-validation" id="meeting-input-file-error">
          <ErrorMessage message={fieldErrors.files} variant="inline" />
        </div>
      ) : null}

      <FileListEmptyState
        isEmpty={files.length === 0}
        title="업로드된 파일이 없습니다"
        description="회의 녹취 파일을 선택하면 목록에 표시됩니다."
        action={{
          label: '파일 선택',
          onClick: openFilePicker,
        }}
      >
        <ul className="meeting-input-file-list" aria-label="선택된 회의 파일">
          {files.map((file) => (
            <li key={file.id} className="meeting-input-file-item">
              <div className="meeting-input-file-meta">
                <p className="meeting-input-file-name">{file.name}</p>
                <p className="meeting-input-file-detail">
                  {file.format.toUpperCase()} · {formatFileSize(file.sizeBytes)}
                </p>
              </div>
              <button
                type="button"
                className="meeting-input-file-remove"
                onClick={() => removeFile(file.id)}
                aria-label={`${file.name} 제거`}
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      </FileListEmptyState>

      {files.length > 0 ? (
        <div className="meeting-input-file-actions">
          <button type="button" className="meeting-input-secondary-btn" onClick={openFilePicker}>
            파일 추가
          </button>
        </div>
      ) : null}
    </div>
  );
}

export interface MeetingInputFlowParticipantsProps {
  className?: string;
}

export function MeetingInputFlowParticipants({
  className = '',
}: MeetingInputFlowParticipantsProps) {
  const {
    participants,
    fieldErrors,
    addParticipant,
    updateParticipant,
    removeParticipant,
  } = useMeetingInputFlowContext();

  return (
    <div className={`meeting-input-participants${className ? ` ${className}` : ''}`}>
      {fieldErrors.participants ? (
        <div className="meeting-input-validation">
          <ErrorMessage message={fieldErrors.participants} variant="inline" />
        </div>
      ) : null}

      <ul className="meeting-input-participant-list" aria-label="참여자 목록">
        {participants.map((participant, index) => (
          <li key={participant.id} className="meeting-input-participant-item">
            <div className="meeting-input-participant-fields">
              <label className="meeting-input-field">
                <span className="meeting-input-field-label">이름</span>
                <input
                  type="text"
                  className={`meeting-input-text${!participant.name.trim() && fieldErrors.participants ? ' meeting-input-text--invalid' : ''}`}
                  value={participant.name}
                  placeholder={`참여자 ${index + 1}`}
                  aria-label={`참여자 ${index + 1} 이름`}
                  onChange={(event) =>
                    updateParticipant(participant.id, { name: event.target.value })
                  }
                />
              </label>
              <label className="meeting-input-field">
                <span className="meeting-input-field-label">역할</span>
                <input
                  type="text"
                  className="meeting-input-text"
                  value={participant.role}
                  placeholder="예: PM, 디자인"
                  aria-label={`참여자 ${index + 1} 역할`}
                  onChange={(event) =>
                    updateParticipant(participant.id, { role: event.target.value })
                  }
                />
              </label>
            </div>
            <button
              type="button"
              className="meeting-input-participant-remove"
              onClick={() => removeParticipant(participant.id)}
              disabled={participants.length === 1}
              aria-label={`${participant.name || `참여자 ${index + 1}`} 제거`}
            >
              제거
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="meeting-input-add-btn"
        onClick={() => addParticipant()}
        aria-label="참여자 추가"
      >
        + 참여자 추가
      </button>
    </div>
  );
}

export interface MeetingInputFlowAnalysisOptionsProps {
  className?: string;
}

export function MeetingInputFlowAnalysisOptions({
  className = '',
}: MeetingInputFlowAnalysisOptionsProps) {
  const { analysisOptions, updateAnalysisOptions } = useMeetingInputFlowContext();

  return (
    <fieldset className={`meeting-input-options${className ? ` ${className}` : ''}`}>
      <legend className="meeting-input-options-legend">분석 옵션</legend>

      <label className="meeting-input-checkbox">
        <input
          type="checkbox"
          checked={analysisOptions.enableSpeakerSeparation}
          onChange={(event) =>
            updateAnalysisOptions({ enableSpeakerSeparation: event.target.checked })
          }
        />
        <span>화자 분리</span>
      </label>

      <label className="meeting-input-checkbox">
        <input
          type="checkbox"
          checked={analysisOptions.generateSummary}
          onChange={(event) => updateAnalysisOptions({ generateSummary: event.target.checked })}
        />
        <span>회의록 요약 생성</span>
      </label>

      <label className="meeting-input-checkbox">
        <input
          type="checkbox"
          checked={analysisOptions.generateScript}
          onChange={(event) => updateAnalysisOptions({ generateScript: event.target.checked })}
        />
        <span>전체 스크립트 생성</span>
      </label>

      <label className="meeting-input-field meeting-input-field--inline">
        <span className="meeting-input-field-label">언어</span>
        <select
          className="meeting-input-select"
          value={analysisOptions.language}
          onChange={(event) =>
            updateAnalysisOptions({
              language: event.target.value as AnalysisOptions['language'],
            })
          }
        >
          {ANALYSIS_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}

export interface MeetingInputFlowWorkspaceProps {
  className?: string;
}

export function MeetingInputFlowWorkspace({ className = '' }: MeetingInputFlowWorkspaceProps) {
  const {
    status,
    files,
    participants,
    workspaceTasks,
    fieldErrors,
    statusMessage,
    validate,
    buildPayload,
    removeWorkspaceTask,
  } = useMeetingInputFlowContext();

  const isReady = status === 'ready';
  const hasValidationErrors = Object.keys(fieldErrors).length > 0;
  const payload = buildPayload();

  return (
    <div className={`meeting-input-workspace${className ? ` ${className}` : ''}`}>
      <div className="meeting-input-workspace-body">
        {hasValidationErrors && status === 'validating' ? (
          <div className="meeting-input-validation meeting-input-validation--block">
            <ErrorMessage
              message="입력 내용을 확인해 주세요"
              description={[
                fieldErrors.files,
                fieldErrors.participants,
                fieldErrors.tasks,
                fieldErrors.general,
              ]
                .filter(Boolean)
                .join(' ')}
              variant="block"
            />
          </div>
        ) : null}

        <div className="meeting-input-status-banner" role="status" aria-live="polite">
          <p className="meeting-input-status-message">{statusMessage}</p>
          {isReady && payload ? (
            <p className="meeting-input-status-detail">
              파일 {payload.files.length}개 · 참여자 {payload.participants.length}명 · 작업{' '}
              {workspaceTasks.length}개
            </p>
          ) : null}
        </div>

        {workspaceTasks.length > 0 ? (
          <ul className="meeting-input-task-list" aria-label="추가된 작업">
            {workspaceTasks.map((task) => (
              <li key={task.id} className="meeting-input-task-item">
                <span className="meeting-input-task-text">{task.text}</span>
                <button
                  type="button"
                  className="meeting-input-participant-remove"
                  onClick={() => removeWorkspaceTask(task.id)}
                  aria-label="작업 제거"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <WorkspaceEmptyState
          isEmpty={!isReady}
          title={isReady ? '분석을 시작할 준비가 되었습니다' : '아직 작업 내용이 없습니다'}
          description={
            isReady
              ? files.length === 1
                ? `「${files[0].name}」 파일로 분석을 시작할 수 있습니다.`
                : `선택된 ${files.length}개 파일로 분석을 시작할 수 있습니다.`
              : '회의 녹취를 업로드하고 참여자를 입력하면 변환·화자 분리·초안 생성 진행 상태가 여기에 표시됩니다.'
          }
          action={
            <div className="meeting-input-start-actions">
              <button
                type="button"
                className="meeting-input-start-btn"
                onClick={validate}
                disabled={files.length === 0}
                aria-disabled={files.length === 0}
              >
                {isReady ? '입력 확인 완료' : '입력 확인'}
              </button>
              {status === 'idle' && participants.some((participant) => !participant.name.trim()) ? (
                <p className="meeting-input-ready-hint">참여자 이름을 모두 입력해 주세요.</p>
              ) : null}
            </div>
          }
        />
      </div>
    </div>
  );
}

export interface MeetingInputFlowWorkspaceInputBarProps {
  className?: string;
  placeholder?: string;
  submitLabel?: string;
}

export function MeetingInputFlowWorkspaceInputBar({
  className = '',
  placeholder = '메시지 또는 지시를 입력하세요…',
  submitLabel = '전송',
}: MeetingInputFlowWorkspaceInputBarProps) {
  const { addWorkspaceTask, fieldErrors } = useMeetingInputFlowContext();
  const [draft, setDraft] = useState('');

  const submitDraft = () => {
    const added = addWorkspaceTask(draft);
    if (added) {
      setDraft('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitDraft();
    }
  };

  return (
    <div className={`meeting-input-bar${className ? ` ${className}` : ''}`}>
      {fieldErrors.tasks ? (
        <div className="meeting-input-validation meeting-input-validation--bar">
          <ErrorMessage message={fieldErrors.tasks} variant="inline" />
        </div>
      ) : null}

      <form className="meeting-input-bar-form" aria-label="입력" onSubmit={handleSubmit}>
        <MeetingInputFlowAddTaskButton />
        <input
          type="text"
          className={`meeting-input-bar-field${fieldErrors.tasks ? ' meeting-input-text--invalid' : ''}`}
          placeholder={placeholder}
          aria-label="작업 입력"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="meeting-input-submit-btn">
          {submitLabel}
        </button>
      </form>
    </div>
  );
}

export interface MeetingInputFlowAddTaskButtonProps {
  className?: string;
}

export function MeetingInputFlowAddTaskButton({
  className = '',
}: MeetingInputFlowAddTaskButtonProps) {
  const { addWorkspaceTask } = useMeetingInputFlowContext();
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openComposer = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const closeComposer = () => {
    setIsOpen(false);
    setDraft('');
  };

  const submitTask = () => {
    const added = addWorkspaceTask(draft);
    if (added) {
      closeComposer();
    }
  };

  if (isOpen) {
    return (
      <div className={`meeting-input-add-task${className ? ` ${className}` : ''}`}>
        <button
          type="button"
          className="meeting-input-add-task-btn meeting-input-add-task-btn--active"
          onClick={closeComposer}
          aria-label="작업 추가 취소"
        >
          ×
        </button>
        <input
          ref={inputRef}
          type="text"
          className="meeting-input-add-task-field"
          placeholder="추가할 작업을 입력하세요"
          aria-label="작업 추가"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitTask();
            }
            if (event.key === 'Escape') {
              closeComposer();
            }
          }}
        />
        <button type="button" className="meeting-input-add-task-confirm" onClick={submitTask}>
          추가
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`meeting-input-add-task-btn${className ? ` ${className}` : ''}`}
      onClick={openComposer}
      aria-label="작업 추가"
    >
      +
    </button>
  );
}

export interface MeetingInputFlowProps extends MeetingInputFlowProviderProps {
  className?: string;
}

export function MeetingInputFlow({
  children,
  className = '',
  ...providerProps
}: MeetingInputFlowProps) {
  return (
    <MeetingInputFlowProvider {...providerProps}>
      <div className={className}>{children}</div>
    </MeetingInputFlowProvider>
  );
}

export type {
  AnalysisOptions,
  MeetingInputFieldErrors,
  MeetingInputFile,
  MeetingInputFlowActions,
  MeetingInputFlowContextValue,
  MeetingInputFlowState,
  MeetingInputFlowStatus,
  MeetingInputParticipant,
  MeetingInputPayload,
  WorkspaceTask,
} from './MeetingInputFlow.types';

export {
  ACCEPTED_AUDIO_EXTENSIONS,
  ANALYSIS_LANGUAGE_OPTIONS,
  DEFAULT_ANALYSIS_OPTIONS,
} from './MeetingInputFlow.types';
