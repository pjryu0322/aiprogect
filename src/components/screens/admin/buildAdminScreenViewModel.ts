import type {
  AdminAnalysisJob,
  AdminScreenViewModel,
  BuildAdminScreenViewModelOptions,
} from "./AdminScreen.types";
import { buildAdminStatusSummary } from "./adminScreen.utils";

export function buildAdminScreenViewModel(
  jobs: AdminAnalysisJob[],
  options: BuildAdminScreenViewModelOptions = {}
): AdminScreenViewModel {
  const status = options.status ?? "idle";
  const selectedJobId =
    options.selectedJobId !== undefined
      ? options.selectedJobId
      : jobs[0]?.id ?? null;

  return {
    status,
    jobs,
    summary: buildAdminStatusSummary(jobs),
    selectedJobId,
    isRefreshing: options.isRefreshing ?? false,
  };
}
