import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn(), ensureDbInitialized: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { query: { players: { findMany: mocks.findMany } } },
  ensureDbInitialized: mocks.ensureDbInitialized,
}));

import { isAuthorizedTeamMember } from "@/lib/auth/session";

describe("Discord team-member authorization", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("denies an outsider when whitelists and roster links are empty", async () => {
    vi.stubEnv("DISCORD_ADMIN_IDS", "");
    vi.stubEnv("DISCORD_MEMBER_IDS", "");
    mocks.findMany.mockResolvedValue([]);
    await expect(isAuthorizedTeamMember("outsider-id", "outsider")).resolves.toBe(false);
  });

  it("still allows a Discord ID linked to a roster player", async () => {
    vi.stubEnv("DISCORD_ADMIN_IDS", "");
    vi.stubEnv("DISCORD_MEMBER_IDS", "");
    mocks.findMany.mockResolvedValue([{ discordId: "roster-id" }]);
    await expect(isAuthorizedTeamMember("roster-id", "player-name")).resolves.toBe(true);
  });
});
