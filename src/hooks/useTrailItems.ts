import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { weeklyPlansService } from "@/services/weeklyPlans.service";
import type { WeeklyPlanItem } from "@/types/study";

export function useTrailItems(userId?: string) {
  const [items, setItems] = useState<WeeklyPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      setItems(await weeklyPlansService.listAllItems(userId));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar trilhas."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, isLoading, error, refresh };
}
