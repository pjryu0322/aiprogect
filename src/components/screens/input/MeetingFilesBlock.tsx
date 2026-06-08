import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
} from 'react';
import { FileListEmptyState } from '../../common/EmptyState';
import { ErrorMessage } from '../../common/ErrorMessage';
import {
  ACCEPTED_AUDIO_EXTENSIONS,
  useMeetingInputFlow,
} from '../../../features/input/MeetingInputFlow';
import type { InputScreenSlotProps } from '../../../screens/InputScreen.types';
import {
  formatDuration,
  formatFileSize,
  getConversionStatusClassName,
  getConversionStatusLabel,
} from './fileMetadata';
import { useFileDurations } from './useFileDurations';
import './inputScreen.css';

export interface MeetingFilesBlockProps extends InputScreenSlotProps {
  screenStatus?: 'idle' | 'uploading' | 'ready';
}

export function MeetingFilesBlock({
  className = '',
  screenStatus = 'idle',
}: MeetingFilesBlockProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, fieldErrors, addFile, removeFile } = useMeetingInputFlow();
  const { durations, isReadingMetadata } = useFileDurations(files);

  const resolvedStatus = isReadingMetadata ? 'uploading' : screenStatus;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => addFile(file));
    }
    event.target.value = '';
  };

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        openFilePicker();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [openFilePicker]);

  return (
    <section
      className={`input-screen-meeting-files${className ? ` ${className}` : ''}`}
      aria-labelledby="input-screen-meeting-files-heading"
    >
      <div className="input-screen-meeting-files-header">
        <h2 id="input-screen-meeting-files-heading" className="input-screen-section-title">
          회의 파일
        </h2>
        <span className={getConversionStatusClassName(resolvedStatus)} aria-live="polite">
          {getConversionStatusLabel(resolvedStatus)}
        </span>
      </div>

      <div className="input-screen-meeting-files-body">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="input-screen-file-picker"
          accept={ACCEPTED_AUDIO_EXTENSIONS.join(',')}
          multiple
          onChange={handleInputChange}
          aria-describedby={fieldErrors.files ? 'input-screen-file-error' : undefined}
        />

        {fieldErrors.files ? (
          <div className="input-screen-validation" id="input-screen-file-error">
            <ErrorMessage message={fieldErrors.files} variant="inline" />
          </div>
        ) : null}

        <FileListEmptyState
          isEmpty={files.length === 0}
          title="업로드된 파일이 없습니다"
          description="회의 녹취 파일을 선택하면 파일명·재생 길이·변환 상태를 확인할 수 있습니다."
          action={{
            label: '파일 선택',
            onClick: openFilePicker,
          }}
        >
          <ul className="input-screen-file-list" aria-label="선택된 회의 파일">
            {files.map((file) => (
              <li key={file.id} className="input-screen-file-item">
                <div className="input-screen-file-meta">
                  <p className="input-screen-file-name">{file.name}</p>
                  <p className="input-screen-file-detail">
                    {file.format.toUpperCase()} · {formatFileSize(file.sizeBytes)} ·{' '}
                    {formatDuration(durations[file.id])}
                  </p>
                  <p className="input-screen-file-status">
                    변환 상태: {getConversionStatusLabel(resolvedStatus)}
                  </p>
                </div>
                <button
                  type="button"
                  className="input-screen-file-remove"
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
          <div className="input-screen-file-actions">
            <button
              type="button"
              className="input-screen-secondary-btn"
              onClick={openFilePicker}
            >
              파일 추가
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
