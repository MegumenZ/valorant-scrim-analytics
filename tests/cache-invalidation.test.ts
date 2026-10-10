import { beforeEach, describe, expect, it, vi } from "vitest";

const updateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ updateTag }));

import { invalidateScrimReadCache } from "@/lib/utils/cache-invalidation";

describe("scrim cache invalidation", () => {
  beforeEach(() => updateTag.mockClear());

  it("expires both match and player domains for read-your-writes across analytics pages", () => {
    invalidateScrimReadCache();
    expect(updateTag.mock.calls).toEqual([["matches"], ["players"]]);
  });
});
