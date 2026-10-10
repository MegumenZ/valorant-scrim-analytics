"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

export const POLL_INTERVAL_MS = 0;
export const MIN_FOCUS_REFRESH_INTERVAL_MS = 60_000;

export function shouldRefreshOnFocus(isVisible: boolean, lastRefreshAt: number, now: number) {
  return isVisible && now - lastRefreshAt >= MIN_FOCUS_REFRESH_INTERVAL_MS;
}

export function LiveRefresh({ renderedAt }: { renderedAt: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const lastRefreshAt = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    lastRefreshAt.current = Date.now();
    setRefreshing(true);
    router.refresh();
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setRefreshing(false), 1500);
  }, [router]);

  useEffect(() => {
    lastRefreshAt.current = Date.now();
    const refreshIfFreshEnough = () => {
      const visible = document.visibilityState === "visible";
      if (shouldRefreshOnFocus(visible, lastRefreshAt.current, Date.now())) refresh();
    };
    document.addEventListener("visibilitychange", refreshIfFreshEnough);
    window.addEventListener("focus", refreshIfFreshEnough);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfFreshEnough);
      window.removeEventListener("focus", refreshIfFreshEnough);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [refresh]);

  return (
    <div className="mb-3 flex items-center justify-end gap-3 text-xs text-[#94A3B8]" aria-live="polite">
      <span>{t.dashboard.updatedAt} {renderedAt}</span>
      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" disabled={refreshing} onClick={refresh}>
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        {t.dashboard.refresh}
      </Button>
    </div>
  );
}
