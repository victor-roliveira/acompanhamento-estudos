import { useMemo } from "react";
import { dashboardService } from "@/services/dashboard.service";
import type { DailyStudyLog, DashboardFilter } from "@/types/study";

export function useDashboard(logs: DailyStudyLog[], filter: DashboardFilter, subjectId?: string) {
  return useMemo(() => dashboardService.summarize(logs, filter, subjectId), [filter, logs, subjectId]);
}
