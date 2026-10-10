import { describe, expect, it } from "vitest";
import { getRosterDashboardRows, getTeamKdTrend, getTeamScoreboardSummary, type DashboardMatchRecord } from "@/lib/utils/dashboard-aggregates";

const player = { id: "p1", name: "Player One", primaryRole: "Duelist", isActive: true };
const match = (overrides: Partial<DashboardMatchRecord> = {}): DashboardMatchRecord => ({
  id: "m1", matchDate: "2026-01-02", map: "Ascent", opponentName: "Rival", result: "WIN", scoreTeam: 13, scoreOpponent: 8,
  playerStats: [{ playerId: "p1", kills: 10, deaths: 5, assists: 4, firstKills: 2, plants: 1, defuses: 0, player }], ...overrides,
});

describe("dashboard scoreboard aggregates", () => {
  it("calculates team K/D from total scoreboard kills and deaths and guards zero deaths", () => {
    expect(getTeamScoreboardSummary([match()])).toMatchObject({ totalKills: 10, totalDeaths: 5, kdRatio: 2 });
    expect(getTeamScoreboardSummary([match({ playerStats: [{ ...match().playerStats[0], deaths: 0 }] })]).kdRatio).toBe(10);
  });
  it("averages signed round difference per match", () => {
    expect(getTeamScoreboardSummary([match()]).avgRoundDifference).toBe(5);
    expect(getTeamScoreboardSummary([match({ scoreTeam: 8, scoreOpponent: 13 })]).avgRoundDifference).toBe(-5);
    expect(getTeamScoreboardSummary([match(), match({ id: "m2", scoreTeam: 8, scoreOpponent: 13 })]).avgRoundDifference).toBe(0);
  });
  it("calculates roster K/D from totals, not mean per-match ratios", () => {
    const rows = getRosterDashboardRows([
      match({ playerStats: [{ ...match().playerStats[0], kills: 10, deaths: 10 }] }),
      match({ id: "m2", playerStats: [{ ...match().playerStats[0], kills: 90, deaths: 0 }] }),
    ]);
    expect(rows[0].kdRatio).toBe(10);
  });
  it("skips null FB, plants, and defuses and returns null when no samples exist", () => {
    const rows = getRosterDashboardRows([
      match({ playerStats: [{ ...match().playerStats[0], firstKills: 3, plants: null, defuses: 1 }] }),
      match({ id: "m2", playerStats: [{ ...match().playerStats[0], firstKills: null, plants: null, defuses: null }] }),
    ]);
    expect(rows[0]).toMatchObject({ firstBloodTotal: 3, firstBloodAverage: 3, firstBloodSamples: 1, plantsTotal: null, plantsAverage: null, plantsSamples: 0, defusesTotal: 1, defusesAverage: 1, defusesSamples: 1 });
  });
  it("sorts K/D trend chronologically and computes each match ratio", () => {
    const trend = getTeamKdTrend([match({ id: "later", matchDate: "2026-02-01", playerStats: [{ ...match().playerStats[0], kills: 6, deaths: 2 }] }), match({ id: "earlier", matchDate: "2026-01-01", playerStats: [{ ...match().playerStats[0], kills: 3, deaths: 3 }] })]);
    expect(trend.map((point) => point.matchId)).toEqual(["earlier", "later"]);
    expect(trend.map((point) => point.teamKd)).toEqual([1, 3]);
  });
  it("includes players with stats regardless of active roster status", () => {
    const inactivePlayer = { ...player, isActive: false };
    const rows = getRosterDashboardRows([match({ playerStats: [{ ...match().playerStats[0], player: inactivePlayer }] })]);
    expect(rows).toHaveLength(1);
    expect(rows[0].player).toMatchObject({ id: "p1", isActive: false });
  });
});
