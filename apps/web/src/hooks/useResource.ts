import { useCallback, useEffect, useState } from "react";

export type ResourceRefreshOptions = {
  /** When true, does not toggle `loading` (avoids unmounting pages that show a full-screen loader). */
  silent?: boolean;
};

export function useResource<TData>(loader: () => Promise<TData>) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (options?: ResourceRefreshOptions) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const next = await loader();
        setData(next);
        return next;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
        return null;
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [loader]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    setData,
    loading,
    error,
    refresh
  };
}
