import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: { query: { matches: { findMany } } },
  client: { execute: vi.fn() },
  ensureDbInitialized: vi.fn(),
}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: (...args: any[]) => any) => fn, revalidatePath: vi.fn(), updateTag: vi.fn() }));

import { getAllMatches } from "@/lib/actions/matches";

describe("match history query projection", () => {
  beforeEach(() => { findMany.mockReset().mockResolvedValue([]); });

  it("explicitly excludes base64 attachment and unused timeline columns", async () => {
    await getAllMatches();
    const columns = findMany.mock.calls[0][0].columns;
    expect(columns.attachments).toBe(false);
    expect(columns.roundTimeline).toBe(false);
    expect(columns.id).toBe(true);
  });
});
