import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingState } from '../components/common/LoadingState';
import { getMeetingDataSync } from '../data/meetingDataProvider';
import type { ProcessingStatus, SampleScenario } from '../data/types';
import { FIXTURE_SCENARIOS } from '../fixtures/meetingFixtures';
import {
  AdminActionPanel,
  AdminMeetingList,
  AdminStatusOverview,
  summarizeAdminRecords,
  toAdminMeetingRecord,
  type AdminMeetingRecord,
  type AdminScreenActions,
  type AdminScreenStatus,
} from '../components/screens/admin';
import './AdminScreen.css';

const DEFAULT_SCENARIOS: SampleScenario[] = FIXTURE_SCENARIOS.filter(
  (scenario) => scenario !== 'idle',
);

function buildAdminRecords(scenarios: SampleScenario[] = DEFAULT_SCENARIOS): AdminMeetingRecord[] {
  return scenarios.map((scenario) => {
    const record = toAdminMeetingRecord(getMeetingDataSync(scenario), scenario);
    return {
      ...record,
      id: `${record.id}:${scenario}`,
    };
  });
}

export interface AdminScreenProps extends AdminScreenActions {
  className?: string;
  initialStatus?: AdminScreenStatus;
  scenarios?: SampleScenario[];
}

export function AdminScreen({
  className = '',
  initialStatus = 'idle',
  scenarios = DEFAULT_SCENARIOS,
  onReprocess,
  onConfirm,
  onStatusChange,
  onRefresh,
  onSelectRecord,
}: AdminScreenProps) {
  const [screenStatus, setScreenStatus] = useState<AdminScreenStatus>(initialStatus);
  const [records, setRecords] = useState<AdminMeetingRecord[]>(() => buildAdminRecords(scenarios));
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    () => records[0]?.id ?? null,
  );
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const summary = useMemo(() => summarizeAdminRecords(records), [records]);
  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const handleSelectRecord = useCallback(
    (recordId: string) => {
      setSelectedRecordId(recordId);
      onSelectRecord?.(recordId);
    },
    [onSelectRecord],
  );

  const handleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    setScreenStatus('loading');
    onRefresh?.();

    refreshTimerRef.current = setTimeout(() => {
      const nextRecords = buildAdminRecords(scenarios);
      setRecords(nextRecords);
      setSelectedRecordId((currentId) => {
        if (currentId && nextRecords.some((record) => record.id === currentId)) {
          return currentId;
        }
        return nextRecords[0]?.id ?? null;
      });
      setScreenStatus('idle');
      refreshTimerRef.current = null;
    }, 600);
  }, [onRefresh, scenarios]);

  const handleReprocess = useCallback(
    (recordId: string) => {
      setRecords((previous) =>
        previous.map((record) =>
          record.id === recordId
            ? {
                ...record,
                stageStatus: 'processing' as ProcessingStatus,
                message: '재처리를 시작했습니다.',
                progressPercent: 10,
              }
            : record,
        ),
      );
      onReprocess?.(recordId);
    },
    [onReprocess],
  );

  const handleConfirm = useCallback(
    (recordId: string) => {
      onConfirm?.(recordId);
    },
    [onConfirm],
  );

  const handleStatusChange = useCallback(
    (recordId: string, status: ProcessingStatus) => {
      setRecords((previous) =>
        previous.map((record) =>
          record.id === recordId
            ? {
                ...record,
                stageStatus: status,
                message:
                  status === 'error'
                    ? '관리자에 의해 오류 상태로 표시되었습니다.'
                    : record.message,
              }
            : record,
        ),
      );
      onStatusChange?.(recordId, status);
    },
    [onStatusChange],
  );

  const isInitialLoading = screenStatus === 'loading' && records.length === 0;

  return (
    <div
      className={`admin-screen${className ? ` ${className}` : ''}`}
      data-screen-status={screenStatus}
    >
      <header className="admin-screen__header">
        <div className="admin-screen__heading">
          <h1 className="admin-screen__title">관리 화면</h1>
          <p className="admin-screen__description">
            회의 분석 결과와 처리 상태를 확인하고, 필요한 보조 행동을 연결할 수 있습니다.
          </p>
        </div>
        <span
          className={`admin-screen__status-badge admin-screen__status-badge--${screenStatus}`}
          role="status"
          aria-live="polite"
        >
          {screenStatus === 'loading' ? '갱신 중' : '준비됨'}
        </span>
      </header>

      {isInitialLoading ? (
        <div className="admin-screen__loading">
          <LoadingState loading message="관리 데이터를 불러오는 중입니다…" variant="block" />
        </div>
      ) : (
        <div className="admin-screen__body">
          <AdminStatusOverview summary={summary} screenStatus={screenStatus} />

          <div className="admin-screen__main">
            <AdminMeetingList
              records={records}
              selectedRecordId={selectedRecordId}
              screenStatus={screenStatus}
              onSelectRecord={handleSelectRecord}
            />

            <AdminActionPanel
              selectedRecord={selectedRecord}
              screenStatus={screenStatus}
              onReprocess={handleReprocess}
              onConfirm={handleConfirm}
              onStatusChange={handleStatusChange}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { AdminMeetingRecord, AdminScreenActions, AdminScreenStatus } from '../components/screens/admin';
