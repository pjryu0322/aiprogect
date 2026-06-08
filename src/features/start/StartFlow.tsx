import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import { ConversionProgressMessage } from '../../components/common/LoadingState';
import { StageChipLoading } from '../../components/common/LoadingState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { FileListEmptyState } from '../../components/common/EmptyState';
import { WorkspaceEmptyState } from '../../components/common/EmptyState';
import type { ConversionStage } from '../../data/types';
import {
  ACCEPTED_AUDIO_EXTENSIONS,
  MAX_AUDIO_FILE_SIZE_BYTES,
  START_FLOW_STAGES,
  type StartFlowContextValue,
  type StartFlowFile,
  type StartFlowStatus,
} from './StartFlow.types';
import './StartFlow.css';

const INITIAL_STATUS_MESSAGE = '회의 녹취 파일을 업로드한 뒤 분석을 시작하세요.';

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

function validateAudioFile(file: File): string | null {
  if (!isAcceptedAudioFile(file)) {
    return `지원하지 않는 파일 형식입니다. ${ACCEPTED_AUDIO_EXTENSIONS.join(', ')} 형식만 업로드할 수 있습니다.`;
  }

  if (file.size <= 0) {
    return '빈 파일은 업로드할 수 없습니다.';
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return `파일 크기는 ${formatFileSize(MAX_AUDIO_FILE_SIZE_BYTES)} 이하여야 합니다.`;
  }

  return null;
}

function createStartFlowFile(file: File): StartFlowFile {
  return {
    id: `file-${crypto.randomUUID()}`,
    name: file.name,
    sizeBytes: file.size,
    format: extractFormat(file.name),
    file,
  };
}

function resolveStageIndex(stage: ConversionStage): number {
  return START_FLOW_STAGES.findIndex((item) => item.id === stage);
}

const StartFlowContext = createContext<StartFlowContextValue | null>(null);

function useStartFlowContext(): StartFlowContextValue {
  const context = useContext(StartFlowContext);
  if (!context) {
    throw new Error('StartFlow components must be used within StartFlowProvider');
  }
  return context;
}

export function useStartFlow(): StartFlowContextValue {
  return useStartFlowContext();
}

export interface StartFlowProviderProps {
  children: ReactNode;
  onStatusChange?: (status: StartFlowStatus) => void;
  onAnalysisStart?: (file: StartFlowFile) => void;
}

export function StartFlowProvider({
  children,
  onStatusChange,
  onAnalysisStart,
}: StartFlowProviderProps) {
  const [status, setStatus] = useState<StartFlowStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<StartFlowFile | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<ConversionStage>('uploading');
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState(INITIAL_STATUS_MESSAGE);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearUploadTimer = useCallback(() => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  }, []);

  const updateStatus = useCallback(
    (nextStatus: StartFlowStatus) => {
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
    },
    [onStatusChange],
  );

  const selectFile = useCallback(
    (file: File) => {
      clearUploadTimer();
      setValidationError(null);

      const validationMessage = validateAudioFile(file);
      if (validationMessage) {
        setSelectedFile(null);
        setProgressPercent(0);
        setStatusMessage(INITIAL_STATUS_MESSAGE);
        updateStatus('idle');
        setValidationError(validationMessage);
        return;
      }

      const nextFile = createStartFlowFile(file);
      setSelectedFile(nextFile);
      setProgressPercent(0);
      setStatusMessage(`「${nextFile.name}」 파일이 선택되었습니다. 분석을 시작할 수 있습니다.`);
      updateStatus('ready');
    },
    [clearUploadTimer, updateStatus],
  );

  const clearFile = useCallback(() => {
    clearUploadTimer();
    setSelectedFile(null);
    setValidationError(null);
    setCurrentStage('uploading');
    setProgressPercent(0);
    setStatusMessage(INITIAL_STATUS_MESSAGE);
    updateStatus('idle');
  }, [clearUploadTimer, updateStatus]);

  const startAnalysis = useCallback(() => {
    if (status === 'uploading') {
      return;
    }

    if (!selectedFile) {
      setValidationError('분석을 시작하려면 회의 녹취 파일을 먼저 선택해 주세요.');
      updateStatus('idle');
      return;
    }

    setValidationError(null);
    setCurrentStage('uploading');
    setProgressPercent(0);
    setStatusMessage('녹취 파일을 업로드하는 중입니다…');
    updateStatus('uploading');
    onAnalysisStart?.(selectedFile);

    clearUploadTimer();
    uploadTimerRef.current = setInterval(() => {
      setProgressPercent((current) => {
        const next = Math.min(current + 12, 100);

        if (next >= 100) {
          clearUploadTimer();
          setStatusMessage('업로드가 완료되었습니다. STT 변환 단계로 이어집니다.');
        } else {
          setStatusMessage(`녹취 파일을 업로드하는 중입니다… (${next}%)`);
        }

        return next;
      });
    }, 350);
  }, [clearUploadTimer, onAnalysisStart, selectedFile, status, updateStatus]);

  const reset = useCallback(() => {
    clearUploadTimer();
    setSelectedFile(null);
    setValidationError(null);
    setCurrentStage('uploading');
    setProgressPercent(0);
    setStatusMessage(INITIAL_STATUS_MESSAGE);
    updateStatus('idle');
  }, [clearUploadTimer, updateStatus]);

  const value = useMemo<StartFlowContextValue>(
    () => ({
      status,
      selectedFile,
      validationError,
      currentStage,
      progressPercent,
      statusMessage,
      selectFile,
      clearFile,
      startAnalysis,
      reset,
    }),
    [
      clearFile,
      currentStage,
      progressPercent,
      reset,
      selectFile,
      selectedFile,
      startAnalysis,
      status,
      statusMessage,
      validationError,
    ],
  );

  return <StartFlowContext.Provider value={value}>{children}</StartFlowContext.Provider>;
}

export interface StartFlowMeetingFilesProps {
  className?: string;
}

export function StartFlowMeetingFiles({ className = '' }: StartFlowMeetingFilesProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, selectedFile, validationError, selectFile, clearFile } = useStartFlowContext();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      selectFile(file);
    }
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      selectFile(file);
    }
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const isUploading = status === 'uploading';

  return (
    <div
      className={`start-flow-meeting-files${className ? ` ${className}` : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="start-flow-file-input"
        accept={ACCEPTED_AUDIO_EXTENSIONS.join(',')}
        onChange={handleInputChange}
        disabled={isUploading}
        aria-describedby={validationError ? 'start-flow-file-error' : undefined}
      />

      {validationError ? (
        <div className="start-flow-validation" id="start-flow-file-error">
          <ErrorMessage message={validationError} variant="inline" />
        </div>
      ) : null}

      <FileListEmptyState
        isEmpty={!selectedFile}
        title="업로드된 파일이 없습니다"
        description="회의 녹취 파일을 선택하거나 이 영역으로 끌어다 놓으세요."
        action={{
          label: '파일 선택',
          onClick: openFilePicker,
        }}
      >
        <div className="start-flow-file-list" role="list" aria-label="선택된 회의 파일">
          {selectedFile ? (
            <div className="start-flow-file-item" role="listitem">
              <div className="start-flow-file-meta">
                <p className="start-flow-file-name">{selectedFile.name}</p>
                <p className="start-flow-file-detail">
                  {selectedFile.format.toUpperCase()} · {formatFileSize(selectedFile.sizeBytes)}
                  {status === 'ready' ? ' · 분석 대기' : null}
                  {status === 'uploading' ? ' · 업로드 중' : null}
                </p>
              </div>
              <button
                type="button"
                className="start-flow-file-remove"
                onClick={clearFile}
                disabled={isUploading}
                aria-label={`${selectedFile.name} 제거`}
              >
                제거
              </button>
            </div>
          ) : null}
        </div>
      </FileListEmptyState>

      {selectedFile ? (
        <div className="start-flow-start-actions">
          <button
            type="button"
            className="start-flow-upload-btn"
            onClick={openFilePicker}
            disabled={isUploading}
          >
            다른 파일 선택
          </button>
        </div>
      ) : null}
    </div>
  );
}

export interface StartFlowWorkspaceProps {
  className?: string;
}

export function StartFlowWorkspace({ className = '' }: StartFlowWorkspaceProps) {
  const { status, selectedFile, validationError, statusMessage, progressPercent, startAnalysis } =
    useStartFlowContext();

  const isUploading = status === 'uploading';
  const canStart = status === 'ready' && Boolean(selectedFile);

  return (
    <div className={`start-flow-workspace${className ? ` ${className}` : ''}`}>
      <div className="start-flow-workspace-body">
        {validationError && status !== 'uploading' ? (
          <div className="start-flow-validation">
            <ErrorMessage message={validationError} variant="block" />
          </div>
        ) : null}

        <ConversionProgressMessage
          loading={isUploading}
          message={statusMessage}
          progressPercent={progressPercent}
        >
          <WorkspaceEmptyState
            isEmpty={!isUploading}
            title={canStart ? '분석을 시작할 준비가 되었습니다' : '아직 작업 내용이 없습니다'}
            description={
              canStart
                ? `「${selectedFile?.name ?? ''}」 파일로 회의 분석을 시작할 수 있습니다.`
                : '회의 녹취를 업로드하면 변환·화자 분리·초안 생성 진행 상태가 여기에 표시됩니다.'
            }
            action={
              <div className="start-flow-start-actions">
                <button
                  type="button"
                  className="start-flow-start-btn"
                  onClick={startAnalysis}
                  disabled={!canStart}
                  aria-disabled={!canStart}
                >
                  분석 시작
                </button>
                {status === 'idle' ? (
                  <p className="start-flow-ready-hint">
                    좌측 「회의 파일」에서 녹취 파일을 선택해 주세요.
                  </p>
                ) : null}
              </div>
            }
          />
        </ConversionProgressMessage>
      </div>
    </div>
  );
}

export interface StartFlowStageChipsProps {
  className?: string;
}

export function StartFlowStageChips({ className = '' }: StartFlowStageChipsProps) {
  const { status, currentStage } = useStartFlowContext();
  const activeStage: ConversionStage | null = status === 'uploading' ? currentStage : null;
  const activeIndex = activeStage ? resolveStageIndex(activeStage) : -1;

  return (
    <nav
      className={`start-flow-stage-chips${className ? ` ${className}` : ''}`}
      aria-label="변환 단계"
    >
      {START_FLOW_STAGES.map((stage, index) => {
        const isActive = stage.id === activeStage;
        const isComplete = activeIndex > index;
        const chipClassName = [
          'start-flow-stage-chip',
          isActive ? 'start-flow-stage-chip--active' : '',
          isComplete ? 'start-flow-stage-chip--complete' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <span
            key={stage.id}
            className={chipClassName}
            aria-current={isActive ? 'step' : undefined}
          >
            {stage.label}
            {isActive && status === 'uploading' ? <StageChipLoading loading /> : null}
          </span>
        );
      })}
    </nav>
  );
}

export interface StartFlowProps extends StartFlowProviderProps {
  className?: string;
}

export function StartFlow({ children, className = '', ...providerProps }: StartFlowProps) {
  return (
    <StartFlowProvider {...providerProps}>
      <div className={className}>{children}</div>
    </StartFlowProvider>
  );
}

export type {
  StartFlowActions,
  StartFlowContextValue,
  StartFlowFile,
  StartFlowState,
  StartFlowStatus,
} from './StartFlow.types';

export {
  ACCEPTED_AUDIO_EXTENSIONS,
  MAX_AUDIO_FILE_SIZE_BYTES,
  START_FLOW_STAGES,
} from './StartFlow.types';
