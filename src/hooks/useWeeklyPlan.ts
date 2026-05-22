import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { weeklyPlansService } from "@/services/weeklyPlans.service";
import type { WeeklyPlanItem, WeeklyPlanItemInput } from "@/types/study";

export function useWeeklyPlan(userId: string | undefined, weekStart: string, weekEnd: string) {
  const [items, setItems] = useState<WeeklyPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      setItems(await weeklyPlansService.listItems(userId, weekStart, weekEnd));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar planejamento."));
    } finally {
      setIsLoading(false);
    }
  }, [userId, weekEnd, weekStart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(input: WeeklyPlanItemInput) {
    if (!userId) return;
    await weeklyPlansService.addItem(userId, weekStart, weekEnd, input);
    await refresh();
  }

  async function setStudied(itemId: string, studied: boolean) {
    await weeklyPlansService.setStudied(itemId, studied);
    await refresh();
  }

  return { items, isLoading, error, refresh, addItem, setStudied };
}
