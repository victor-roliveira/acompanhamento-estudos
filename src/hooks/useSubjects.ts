import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { subjectsService } from "@/services/subjects.service";
import type { Subject } from "@/types/study";

export function useSubjects(userId?: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      setSubjects(await subjectsService.list(userId));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar matérias."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { subjects, isLoading, error, refresh };
}
