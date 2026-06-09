import { useMemo, useState } from 'react';
import { EmptyState } from '../../common/EmptyState';
import type { AdminMeetingRecord, AdminScreenStatus, AdminStatusFilter } from './AdminScreen.types';
import {
  STAGE_LABELS,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
  filterAdminRecords,
} from './AdminScreen.types';
import './admin.css';

export interface AdminMeetingListProps {
  records: AdminMeetingRecord[];
  selectedRecordId: string | null;
  screenStatus: AdminScreenStatus;
  onSelectRecord?: (recordId: string) => void;
  className?: string;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveResultLabel(record: AdminMeetingRecord): string {
  if (record.hasSummary && record.hasScript) {
    return '요약·스크립트 준비됨';
  }
  if (record.hasScript) {
    return '스크립트만 준비됨';
  }
  if (record.hasSummary) {
    return '요약만 준비됨';
  }
  return '결과 없음';
}

function resolveStatusTone(record: AdminMeetingRecord): string {
  if (record.stageStatus === 'error') {
    return 'error';
  }
  if (record.stageStatus === 'processing') {
    return 'processing';
  }
  if (record.currentStage === 'complete' && record.stageStatus === 'success') {
    return 'success';
  }
  return 'idle';
}

export function AdminMeetingList({
  records,
  selectedRecordId,
  screenStatus,
  onSelectRecord,
  className = '',
}: AdminMeetingListProps) {
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const isLoading = screenStatus === 'loading';

  const filteredRecords = useMemo(
    () => filterAdminRecords(records, statusFilter),
    [records, statusFilter],
  );

  return (
    <section
      className={`admin-meeting-list${className ? ` ${className}` : ''}`}
      aria-labelledby="admin-meeting-list-heading"
      aria-busy={isLoading}
    >
      <div className="admin-meeting-list__header">
        <h2 id="admin-meeting-list-heading" className="admin-section-title">
          회의 분석 목록
        </h2>
        <p className="admin-meeting-list__count" aria-live="polite">
          {filteredRecords.length}건
        </p>
      </div>

      <div className="admin-filter-tabs" role="tablist" aria-label="상태 필터">
        <button
          type="button"
          role="tab"
          className={`admin-filter-tab${statusFilter === 'all' ? ' admin-filter-tab--active' : ''}`}
          aria-selected={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        >
          전체
        </button>
        {STATUS_FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            className={`admin-filter-tab${statusFilter === option.id ? ' admin-filter-tab--active' : ''}`}
            aria-selected={statusFilter === option.id}
            onClick={() => setStatusFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <EmptyState
          title="표시할 회의가 없습니다"
          description="선택한 상태에 해당하는 회의 처리 기록이 없습니다. 다른 필터를 선택해 보세요."
          variant="panel"
        />
      ) : (
        <div className="admin-meeting-list__items" role="list" aria-label="회의 분석 항목">
          {filteredRecords.map((record) => {
            const isSelected = record.id === selectedRecordId;
            const statusTone = resolveStatusTone(record);
            const primaryFile = record.files[0];

            return (
              <article
                key={record.id}
                className={`admin-meeting-card${isSelected ? ' admin-meeting-card--selected' : ''}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="admin-meeting-card__select"
                  onClick={() => onSelectRecord?.(record.id)}
                  aria-pressed={isSelected}
                  disabled={isLoading}
                >
                  <div className="admin-meeting-card__header">
                    <h3 className="admin-meeting-card__title">{record.title}</h3>
                    <span
                      className={`admin-meeting-card__status admin-meeting-card__status--${statusTone}`}
                    >
                      {STATUS_LABELS[record.stageStatus]}
                    </span>
                  </div>

                  <dl className="admin-meeting-card__meta">
                    <div className="admin-meeting-card__meta-row">
                      <dt>처리 단계</dt>
                      <dd>{STAGE_LABELS[record.currentStage]}</dd>
                    </div>
                    <div className="admin-meeting-card__meta-row">
                      <dt>결과 상태</dt>
                      <dd>{resolveResultLabel(record)}</dd>
                    </div>
                    <div className="admin-meeting-card__meta-row">
                      <dt>최근 갱신</dt>
                      <dd>
                        <time dateTime={record.lastUpdated}>
                          {formatTimestamp(record.lastUpdated)}
                        </time>
                      </dd>
                    </div>
                  </dl>

                  {primaryFile ? (
                    <div className="admin-meeting-card__file">
                      <span className="admin-meeting-card__file-name">{primaryFile.name}</span>
                      <span className="admin-meeting-card__file-detail">
                        {primaryFile.format.toUpperCase()} · {formatFileSize(primaryFile.sizeBytes)}
                        {record.files.length > 1 ? ` · 외 ${record.files.length - 1}개` : ''}
                      </span>
                    </div>
                  ) : (
                    <p className="admin-meeting-card__file admin-meeting-card__file--empty">
                      업로드된 파일 없음
                    </p>
                  )}

                  {record.stageStatus === 'processing' ? (
                    <div
                      className="admin-meeting-card__progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={record.progressPercent}
                      aria-label={`진행률 ${record.progressPercent}%`}
                    >
                      <div
                        className="admin-meeting-card__progress-bar"
                        style={{ width: `${record.progressPercent}%` }}
                      />
                    </div>
                  ) : null}

                  <p className="admin-meeting-card__message">{record.message}</p>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
