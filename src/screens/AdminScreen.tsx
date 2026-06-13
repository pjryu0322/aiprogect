import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AdminScreen,
  AdminScreenJobsSection,
  AdminScreenSummarySection,
  buildAdminScreenViewModel,
} from "../components/screens/admin/AdminScreen";
import type {
  AdminAnalysisJob,
  AdminJobResultStatus,
  AdminScreenContainerProps,
} from "../components/screens/admin/AdminScreen.types";

const REFRESH_SIMULATION_MS = 700;

const DEFAULT_ADMIN_JOBS: AdminAnalysisJob[] = [
  {
    id: "admin-job-001",
    meetingTitle: "회의록 자동정리 워크스페이스 — 샘플 데이터 검증 회의",
    fileName: "2026-06-10_제품기획_주간회의.m4a",
    stage: "done",
    resultStatus: "completed",
    updatedAt: "2026-06-10T09:12:00+09:00",
  },
  {
    id: "admin-job-002",
    meetingTitle: "STT 변환 파이프라인 점검",
    fileName: "2026-06-11_백엔드_스프린트리뷰.wav",
    stage: "speaker_waiting",
    resultStatus: "processing",
    updatedAt: "2026-06-11T14:35:00+09:00",
    progress: 62,
  },
  {
    id: "admin-job-003",
    meetingTitle: "화자 분리 QA 재현 회의",
    fileName: "2026-06-09_화자분리_테스트.m4a",
    stage: "draft_pending",
    resultStatus: "needs_review",
    updatedAt: "2026-06-09T18:04:00+09:00",
  },
  {
    id: "admin-job-004",
    meetingTitle: "초안 생성 실패 케이스",
    fileName: "2026-06-08_초안생성_오류.mp3",
    stage: "draft_pending",
    resultStatus: "failed",
    updatedAt: "2026-06-08T11:22:00+09:00",
    errorMessage: "초안 생성 API 응답 시간이 초과되었습니다.",
  },
];

function updateJob(
  jobs: AdminAnalysisJob[],
  jobId: string,
  updater: (job: AdminAnalysisJob) => AdminAnalysisJob
): AdminAnalysisJob[] {
  return jobs.map((job) => (job.id === jobId ? updater(job) : job));
}

export function AdminScreenContainer({
  initialJobs = DEFAULT_ADMIN_JOBS,
  simulateRefresh = true,
  disabled = false,
  className,
  onRefresh,
  onJobSelect,
  onRetryJob,
  onConfirmJob,
  onStatusChange,
}: AdminScreenContainerProps) {
  const [jobs, setJobs] = useState<AdminAnalysisJob[]>(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialJobs[0]?.id ?? null
  );
  const [screenStatus, setScreenStatus] = useState<"idle" | "loading">("idle");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearRefreshTimer, [clearRefreshTimer]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();

    if (!simulateRefresh) {
      return;
    }

    clearRefreshTimer();
    setScreenStatus("loading");
    setIsRefreshing(true);

    refreshTimerRef.current = window.setTimeout(() => {
      setJobs((current) =>
        current.map((job) =>
          job.resultStatus === "processing" && typeof job.progress === "number"
            ? {
                ...job,
                progress: Math.min(job.progress + 8, 96),
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );
      setScreenStatus("idle");
      setIsRefreshing(false);
    }, REFRESH_SIMULATION_MS);
  }, [clearRefreshTimer, onRefresh, simulateRefresh]);

  const handleJobSelect = useCallback(
    (jobId: string) => {
      setSelectedJobId(jobId);
      onJobSelect?.(jobId);
    },
    [onJobSelect]
  );

  const handleRetryJob = useCallback(
    (jobId: string) => {
      setJobs((current) =>
        updateJob(current, jobId, (job) => ({
          ...job,
          stage: "stt_processing",
          resultStatus: "processing",
          progress: 18,
          errorMessage: undefined,
          updatedAt: new Date().toISOString(),
        }))
      );
      onRetryJob?.(jobId);
    },
    [onRetryJob]
  );

  const handleConfirmJob = useCallback(
    (jobId: string) => {
      setJobs((current) =>
        updateJob(current, jobId, (job) => ({
          ...job,
          stage: "done",
          resultStatus: "completed",
          progress: null,
          errorMessage: undefined,
          updatedAt: new Date().toISOString(),
        }))
      );
      onConfirmJob?.(jobId);
    },
    [onConfirmJob]
  );

  const handleStatusChange = useCallback(
    (jobId: string, status: AdminJobResultStatus) => {
      setJobs((current) =>
        updateJob(current, jobId, (job) => ({
          ...job,
          resultStatus: status,
          stage: status === "completed" ? "done" : job.stage,
          progress: status === "processing" ? job.progress ?? 24 : null,
          errorMessage: status === "failed" ? job.errorMessage ?? "처리 중 오류가 발생했습니다." : undefined,
          updatedAt: new Date().toISOString(),
        }))
      );
      onStatusChange?.(jobId, status);
    },
    [onStatusChange]
  );

  const viewModel = useMemo(
    () =>
      buildAdminScreenViewModel(jobs, {
        status: screenStatus,
        selectedJobId,
        isRefreshing,
      }),
    [jobs, screenStatus, selectedJobId, isRefreshing]
  );

  return (
    <AdminScreen
      viewModel={viewModel}
      onRefresh={handleRefresh}
      onJobSelect={handleJobSelect}
      onRetryJob={handleRetryJob}
      onConfirmJob={handleConfirmJob}
      onStatusChange={handleStatusChange}
      disabled={disabled}
      className={className}
    />
  );
}

export type { AdminScreenContainerProps } from "../components/screens/admin/AdminScreen.types";

export {
  AdminScreen,
  AdminScreenJobsSection,
  AdminScreenSummarySection,
  AnalysisJobCard,
  AnalysisJobList,
  ProcessingStatusSummary,
  buildAdminScreenViewModel,
} from "../components/screens/admin/AdminScreen";

export type {
  AdminAnalysisJob,
  AdminJobResultStatus,
  AdminJobStage,
  AdminScreenCallbacks,
  AdminScreenProps,
  AdminScreenStatus,
  AdminScreenViewModel,
  AdminStatusSummary,
} from "../components/screens/admin/AdminScreen.types";
