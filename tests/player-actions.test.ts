import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const playersFindFirst = vi.fn();
  const statsFindFirst = vi.fn();
  const updateWhere = vi.fn();
  const updateSet = vi.fn();
  const updateBuilder = { set: updateSet, where: updateWhere };
  updateSet.mockReturnValue(updateBuilder);
  updateWhere.mockResolvedValue(undefined);
  const deleteWhere = vi.fn();
  const deleteReturning = vi.fn();
  const deleteBuilder = { where: deleteWhere, returning: deleteReturning };
  deleteWhere.mockReturnValue(deleteBuilder);
  const selectBuilder: { from: () => typeof selectBuilder; where: () => typeof selectBuilder } = {
    from: () => selectBuilder,
    where: () => selectBuilder,
  };
  const select = vi.fn(() => selectBuilder);
  const deleteFn = vi.fn(() => deleteBuilder);
  const update = vi.fn(() => updateBuilder);
  const updateTag = vi.fn();
  const getCurrentUser = vi.fn();
  return { playersFindFirst, statsFindFirst, updateWhere, updateSet, deleteWhere, deleteReturning, deleteFn, update, select, updateTag, getCurrentUser };
});

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      players: { findFirst: mocks.playersFindFirst },
      matchPlayerStats: { findFirst: mocks.statsFindFirst },
    },
    update: mocks.update,
    delete: mocks.deleteFn,
    select: mocks.select,
  },
  ensureDbInitialized: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser, isDemoAccount: (id: string) => id.startsWith("10000000000000000") }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: mocks.updateTag, unstable_cache: (fn: (...args: any[]) => any) => fn }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, and: vi.fn(() => ({})), eq: vi.fn(() => ({})), ne: vi.fn(() => ({})), notExists: vi.fn(() => ({})) };
});

import { deletePlayer, setPlayerActiveStatus } from "@/lib/actions/players";

describe("player roster server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ role: "ADMIN", discordId: "real-admin" });
    mocks.playersFindFirst.mockResolvedValue({ id: "p1", isActive: true });
    mocks.statsFindFirst.mockResolvedValue(null);
    mocks.deleteReturning.mockResolvedValue([{ id: "p1" }]);
  });

  it("denies roster mutations from a demo admin identity", async () => {
    mocks.getCurrentUser.mockResolvedValue({ role: "ADMIN", discordId: "100000000000000001" });
    const result = await setPlayerActiveStatus("p1", false);
    expect(result.success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([
    [true, false],
    [false, true],
  ])("writes the explicit status target %s -> %s", async (currentStatus, targetStatus) => {
    mocks.playersFindFirst.mockResolvedValue({ id: "p1", isActive: currentStatus });
    const result = await setPlayerActiveStatus("p1", targetStatus);
    expect(result.success).toBe(true);
    expect(mocks.updateSet).toHaveBeenCalledWith({ isActive: targetStatus });
    expect(mocks.updateTag.mock.calls).toEqual([["matches"], ["players"]]);
  });

  it("refuses permanent deletion when player match statistics exist", async () => {
    mocks.deleteReturning.mockResolvedValue([]);
    mocks.playersFindFirst.mockResolvedValueOnce({ id: "p1" });
    mocks.statsFindFirst.mockResolvedValue({ id: "stat1" });

    const result = await deletePlayer("p1");
    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected player with match history to be rejected");
    expect(result.error).toMatch(/riwayat match/i);
    expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
  });

  it("allows permanent deletion when no match statistics exist", async () => {
    const result = await deletePlayer("p1");
    expect(result.success).toBe(true);
    expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
  });
});
