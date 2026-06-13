import type { ConversionStepId } from "../../WorkspaceShell.types";
import type {
  AdminAnalysisJob,
  AdminJobResultStatus,
  AdminJobStage,
  AdminScreenStatus,
  AdminStatusSummary,
} from "./AdminScreen.types";

const STAGE_LABELS: Record<AdminJobStage, string> = {
  uploading: "업로드",
  stt_processing: "STT 변환",
  speaker_waiting: "화자 분리",
  draft_pending: "초안 생성",
  done: "완료",
};

const RESULT_STATUS_LABELS: Record<AdminJobResultStatus, string> = {
  pending: "대기",
  processing: "처리 중",
  completed: "완료",
  failed: "실패",
  needs_review: "확인 필요",
};

export function getAdminJobStageLabel(stage: AdminJobStage): string {
  return STAGE_LABELS[stage];
}

export function getAdminJobResultStatusLabel(status: AdminJobResultStatus): string {
  return RESULT_STATUS_LABELS[status];
}

export function getAdminJobResultStatusChipClass(status: AdminJobResultStatus): string {
  return `admin-screen-status-chip admin-screen-status-chip--${status}`;
}

export function getAdminJobStageChipClass(stage: AdminJobStage): string {
  return `admin-screen-stage-chip admin-screen-stage-chip--${stage}`;
}

export function buildAdminStatusSummary(jobs: AdminAnalysisJob[]): AdminStatusSummary {
  return jobs.reduce<AdminStatusSummary>(
    (summary, job) => {
      summary.total += 1;

      switch (job.resultStatus) {
        case "processing":
          summary.processing += 1;
          break;
        case "completed":
          summary.completed += 1;
          break;
        case "failed":
          summary.failed += 1;
          break;
        case "needs_review":
          summary.needsReview += 1;
          break;
        default:
          break;
      }

      return summary;
    },
    {
      total: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      needsReview: 0,
    }
  );
}

export function formatAdminUpdatedAt(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function canRetryAdminJob(job: AdminAnalysisJob): boolean {
  return job.resultStatus === "failed" || job.resultStatus === "needs_review";
}

export function canConfirmAdminJob(job: AdminAnalysisJob): boolean {
  return job.resultStatus === "needs_review" || job.resultStatus === "completed";
}

export function canChangeAdminJobStatus(job: AdminAnalysisJob): boolean {
  return job.resultStatus !== "processing";
}

export function getAdminScreenHeadline(status: AdminScreenStatus, summary: AdminStatusSummary): string {
  if (status === "loading") {
    return "분석 작업 상태를 불러오는 중입니다";
  }

  if (summary.total === 0) {
    return "등록된 분석 작업이 없습니다";
  }

  if (summary.processing > 0) {
    return `${summary.processing}건의 작업이 처리 중입니다`;
  }

  if (summary.needsReview > 0) {
    return `${summary.needsReview}건의 결과 확인이 필요합니다`;
  }

  return "모든 분석 작업 상태를 확인할 수 있습니다";
}

export function getAdminScreenDescription(summary: AdminStatusSummary): string {
  if (summary.total === 0) {
    return "회의 분석이 시작되면 이 영역에서 진행 상태와 결과를 관리할 수 있습니다.";
  }

  return `총 ${summary.total}건 · 완료 ${summary.completed} · 실패 ${summary.failed} · 확인 필요 ${summary.needsReview}`;
}

export function mapConversionStepToAdminStage(step: ConversionStepId): AdminJobStage {
  return step;
}
