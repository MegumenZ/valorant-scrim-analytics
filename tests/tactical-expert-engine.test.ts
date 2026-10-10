import { describe, it, expect } from "vitest";
import { evaluateMatchTactics } from "@/lib/utils/tactical-expert-engine";
import { MatchWithStats } from "@/lib/actions/matches";

describe("Tactical Expert Engine", () => {
  const mockMatch: MatchWithStats = {
    id: "match-test-1",
    matchDate: "2026-08-20",
    map: "Ascent",
    opponentName: "Paper Rex",
    scoreTeam: 13,
    scoreOpponent: 9,
    result: "WIN",
    startSide: "ATTACK",
    vodUrl: null,
    notes: null,
    attachments: null,
    idempotencyKey: null,
    roundTimeline: JSON.stringify([
      { round: 1, side: "ATTACK", winner: "TEAM", winType: "ELIMINATION", tradesWon: 1, tradedDeaths: 1 },
      { round: 2, side: "ATTACK", winner: "TEAM", winType: "DETONATION", tradesWon: 1, tradedDeaths: 1 },
      { round: 3, side: "ATTACK", winner: "OPPONENT", winType: "DEFUSE", tradesWon: 0, tradedDeaths: 0 },
    ]),
    createdAt: "2026-08-20T10:00:00Z",
    playerStats: [
      {
        id: "stat-1",
        matchId: "match-test-1",
        playerId: "p1",
        agent: "Jett",
        acs: 280,
        kills: 22,
        deaths: 12,
        assists: 4,
        adr: 180,
        hsPercent: 28,
        firstKills: 6,
        plants: 0,
        defuses: 0,
        firstDeaths: 2,
        clutchesWon: 1,
        kastPercent: 82,
        player: {
          id: "p1",
          name: "TenZ",
          riotId: "TenZ#NA1",
          primaryRole: "Duelist",
          discordId: null,
          isActive: true,
          createdAt: "2026-08-20",
        },
      },
    ],
  };

  it("should evaluate match tactics and return a valid grade and score between 0 and 100", () => {
    const report = evaluateMatchTactics(mockMatch, []);
    expect(report).not.toBeNull();
    if (!report) throw new Error("Expected tactical report for timeline with recorded trades");
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(["S", "A+", "A", "B+", "B", "C+", "C", "D"]).toContain(report.grade);
    expect(report.strengths.length).toBeGreaterThan(0);
    expect(report.pillars.roundWinRate).toBe(59);
  });

  it("does not crash when a new match has no timeline or optional advanced stats", () => {
    const newScoreboardMatch = {
      ...mockMatch,
      roundTimeline: null,
      parsedRoundTimeline: [],
      playerStats: mockMatch.playerStats.map((stat) => ({ ...stat, acs: null, adr: null, hsPercent: null, kastPercent: null, firstDeaths: null, clutchesWon: null })),
    };
    expect(evaluateMatchTactics(newScoreboardMatch, [])).toBeNull();
  });
});
