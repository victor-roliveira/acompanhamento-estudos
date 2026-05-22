import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { weeklyPlansService } from "@/services/weeklyPlans.service";
import type { PendingWeek } from "@/types/study";

export function usePendingStudies(userId?: string) {
  const [weeks, setWeeks] = useState<PendingWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      setWeeks(await weeklyPlansService.listPending(userId));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar pendências."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weeks, isLoading, error, refresh };
}
