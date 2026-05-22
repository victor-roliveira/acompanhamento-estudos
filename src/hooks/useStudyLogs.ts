import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { studyLogsService } from "@/services/studyLogs.service";
import type { DailyStudyLog, StudyLogInput } from "@/types/study";

export function useStudyLogs(userId?: string) {
  const [logs, setLogs] = useState<DailyStudyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      setLogs(await studyLogsService.list(userId));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar registros."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createLog(input: StudyLogInput) {
    if (!userId) return;
    await studyLogsService.create(userId, input);
    await refresh();
  }

  return { logs, isLoading, error, refresh, createLog };
}
