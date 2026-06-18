"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { isActionError } from "@/lib/action-result";

type ActionResult = { error?: string; success?: boolean } | Record<string, unknown>;

export function useAsyncAction() {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const run = useCallback(
    async (
      key: string,
      action: () => Promise<ActionResult | void>,
      options?: {
        successMessage?: string;
        reload?: boolean;
        onSuccess?: (result: ActionResult) => void;
      }
    ) => {
      if (loadingKeys.has(key)) return;

      setLoadingKeys((prev) => new Set(prev).add(key));
      try {
        const result = await action();
        if (result && isActionError(result)) {
          toast.error(result.error);
          return;
        }
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        if (result && options?.onSuccess) {
          options.onSuccess(result);
        }
        if (options?.reload) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Admin action error:", error);
        toast.error("Xatolik yuz berdi");
      } finally {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [loadingKeys]
  );

  const isLoading = useCallback((key: string) => loadingKeys.has(key), [loadingKeys]);

  return { run, isLoading, isBusy: loadingKeys.size > 0 };
}
