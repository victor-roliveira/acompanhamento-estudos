import { useState } from "react";
import { getErrorMessage } from "@/lib/utils";

export function useAsyncAction() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(action: () => Promise<T>) {
    setError(null);
    setIsSubmitting(true);
    try {
      return await action();
    } catch (err) {
      setError(getErrorMessage(err, "Algo deu errado."));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, error, setError, run };
}
