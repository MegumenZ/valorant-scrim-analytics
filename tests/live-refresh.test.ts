import { afterEach, describe, expect, it, vi } from "vitest";
import { MIN_FOCUS_REFRESH_INTERVAL_MS, POLL_INTERVAL_MS, shouldRefreshOnFocus } from "@/components/layout/live-refresh";

describe("LiveRefresh focus refresh policy", () => {
  afterEach(() => vi.useRealTimers());

  it("waits at least 60 seconds after refresh and never refreshes while hidden", () => {
    vi.useFakeTimers();
    const lastRefreshAt = Date.now();
    vi.advanceTimersByTime(MIN_FOCUS_REFRESH_INTERVAL_MS - 1);
    expect(shouldRefreshOnFocus(true, lastRefreshAt, Date.now())).toBe(false);
    expect(shouldRefreshOnFocus(false, lastRefreshAt, Date.now())).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shouldRefreshOnFocus(true, lastRefreshAt, Date.now())).toBe(true);
    expect(POLL_INTERVAL_MS).toBe(0);
  });
});
