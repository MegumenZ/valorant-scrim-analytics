import { describe, expect, it } from "vitest";
import { getPlayerKdTrend, summarizeAgentPool, summarizeMapScoreboards, summarizePlayerScoreboard, type PlayerScoreboardRecord } from "@/lib/utils/scoreboard-analytics";

const row = (patch: Partial<PlayerScoreboardRecord> = {}): PlayerScoreboardRecord => ({
  matchId: "m1", matchDate: "2026-04-02", map: "Ascent", opponentName: "Rival", result: "WIN", scoreTeam: 13, scoreOpponent: 9,
  agent: "Jett", kills: 10, deaths: 5, assists: 4, firstKills: 2, plants: 1, defuses: null, ...patch,
});

describe("scoreboard analytics", () => {
  it("computes profile K/D from aggregate totals, with a zero-death guard", () => {
    const stats = summarizePlayerScoreboard([row({ kills: 10, deaths: 10 }), row({ matchId: "m2", kills: 90, deaths: 0 })]);
    expect(stats.kdRatio).toBe(10);
    expect(summarizePlayerScoreboard([row({ deaths: 0 })]).kdRatio).toBe(10);
  });

  it("skips null first blood, plants, and defuses and preserves sample counts", () => {
    const stats = summarizePlayerScoreboard([
      row({ firstKills: 2, plants: null, defuses: 1 }),
      row({ matchId: "m2", firstKills: null, plants: null, defuses: null }),
    ]);
    expect(stats.firstBlood).toEqual({ total: 2, average: 2, samples: 1 });
    expect(stats.plants).toEqual({ total: null, average: null, samples: 0 });
    expect(stats.defuses).toEqual({ total: 1, average: 1, samples: 1 });
  });

  it("groups agent pool by match count and K/D from each agent's total kills/deaths", () => {
    const pool = summarizeAgentPool([row({ kills: 10, deaths: 10 }), row({ matchId: "m2", kills: 90, deaths: 0 }), row({ matchId: "m3", agent: "Sova", kills: 5, deaths: 5 })]);
    expect(pool).toEqual([
      { agent: "Jett", matchesPlayed: 2, kdRatio: 10, totalKills: 100, totalDeaths: 10 },
      { agent: "Sova", matchesPlayed: 1, kdRatio: 1, totalKills: 5, totalDeaths: 5 },
    ]);
  });

  it("orders per-player K/D trend chronologically", () => {
    const trend = getPlayerKdTrend([row({ matchId: "later", matchDate: "2026-05-01", kills: 6, deaths: 2 }), row({ matchId: "early", matchDate: "2026-04-01", kills: 3, deaths: 3 })]);
    expect(trend.map(({ matchId, kdRatio }) => [matchId, kdRatio])).toEqual([["early", 1], ["later", 3]]);
  });

  it("computes map match count, win rate, average signed round difference, and team K/D", () => {
    const maps = summarizeMapScoreboards([
      { id: "m1", map: "Ascent", result: "WIN", scoreTeam: 13, scoreOpponent: 9, playerStats: [{ kills: 10, deaths: 5 }, { kills: 5, deaths: 5 }] },
      { id: "m2", map: "Ascent", result: "LOSS", scoreTeam: 8, scoreOpponent: 13, playerStats: [{ kills: 5, deaths: 10 }] },
      { id: "m3", map: "Bind", result: "DRAW", scoreTeam: 12, scoreOpponent: 12, playerStats: [{ kills: 2, deaths: 2 }] },
    ], ["Ascent", "Bind", "Haven"]);
    expect(maps[0]).toMatchObject({ map: "Ascent", totalMatches: 2, wins: 1, losses: 1, winRate: 50, avgRoundDifference: -0.5, teamKills: 20, teamDeaths: 20, teamKdRatio: 1 });
    expect(maps[1]).toMatchObject({ map: "Bind", totalMatches: 1, draws: 1, avgRoundDifference: 0, teamKdRatio: 1 });
    expect(maps[2]).toMatchObject({ map: "Haven", totalMatches: 0, avgRoundDifference: null, teamKdRatio: null });
  });
});
