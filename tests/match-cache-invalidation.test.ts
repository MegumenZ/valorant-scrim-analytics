import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const deleteQuery = vi.fn(() => ({ where: deleteWhere }));
  const updateTag = vi.fn();
  const getCurrentUser = vi.fn();
  return { deleteWhere, deleteQuery, updateTag, getCurrentUser };
});

vi.mock("@/lib/db", () => ({ db: { delete: mocks.deleteQuery }, client: { execute: vi.fn() }, ensureDbInitialized: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser, isDemoAccount: (id: string) => id.startsWith("10000000000000000") }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: (...args: any[]) => any) => fn, revalidatePath: vi.fn(), updateTag: mocks.updateTag }));

import { deleteMatch } from "@/lib/actions/matches";

describe("match mutation cache invalidation", () => {
  it("denies mutations from an already-issued demo admin session", async () => {
    mocks.getCurrentUser.mockResolvedValue({ role: "ADMIN", discordId: "100000000000000001" });
    const result = await deleteMatch("match-1");
    expect(result.success).toBe(false);
    expect(mocks.deleteQuery).not.toHaveBeenCalled();
  });

  it("expires match and player data immediately after deleting a match", async () => {
    mocks.getCurrentUser.mockResolvedValue({ role: "ADMIN", discordId: "real-admin" });
    const result = await deleteMatch("match-1");
    expect(result.success).toBe(true);
    expect(mocks.updateTag.mock.calls).toEqual([["matches"], ["players"]]);
  });
});
