import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  playersFindMany: vi.fn(),
  matchesFindFirst: vi.fn(),
  batch: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      players: { findMany: mocks.playersFindMany },
      matches: { findFirst: mocks.matchesFindFirst },
    },
    batch: mocks.batch,
  },
  client: { execute: vi.fn() },
  ensureDbInitialized: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ role: "ADMIN", discordId: "real-admin" }),
  isDemoAccount: vi.fn(() => false),
}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: (...args: any[]) => any) => fn, revalidatePath: vi.fn(), updateTag: vi.fn() }));

import { updateMatch } from "@/lib/actions/matches";

const players = ["p1", "p2", "p3", "p4", "p5"];
const input = {
  matchDate: "2026-10-10",
  map: "Ascent",
  opponentName: "Opponent",
  scoreTeam: 13,
  scoreOpponent: 9,
  playerStats: [...players.slice(0, 4), "replacement"].map((playerId) => ({
    playerId,
    agent: "Jett",
    kills: 1,
    deaths: 1,
    assists: 1,
    firstKills: 0,
    plants: playerId === "replacement" ? null : 0,
    defuses: 0,
  })),
  opponentPlayerStats: null,
};

describe("updateMatch event validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.playersFindMany.mockResolvedValue([...players, "replacement"].map((id) => ({ id })));
    mocks.matchesFindFirst.mockResolvedValue({
      id: "match-1",
      roundTimeline: null,
      attachments: null,
      playerStats: players.map((playerId) => ({ playerId, plants: null, defuses: null })),
    });
  });

  it("rejects a new player with missing event counts before writing", async () => {
    const result = await updateMatch("match-1", input);
    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected the replacement player's incomplete scoreboard to be rejected");
    expect(result.error).toMatch(/Plants dan defuses wajib/i);
    expect(mocks.batch).not.toHaveBeenCalled();
  });
});
