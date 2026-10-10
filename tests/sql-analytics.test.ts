import { createClient } from "@libsql/client";
import { afterEach, describe, expect, it } from "vitest";
import { DASHBOARD_AGGREGATE_SQL, MAP_AGGREGATE_SQL, includeEmptyMaps, mapDashboardAggregateRows, mapMapAggregateRows } from "@/lib/utils/sql-analytics";
import { getRosterDashboardRows, getTeamKdTrend, getTeamScoreboardSummary, type DashboardMatchRecord } from "@/lib/utils/dashboard-aggregates";
import { summarizeMapScoreboards } from "@/lib/utils/scoreboard-analytics";
import { VALORANT_MAPS } from "@/lib/data/valorant";

const fixture: DashboardMatchRecord[] = [
  { id: "m1", matchDate: "2026-01-01", map: "Ascent", opponentName: "Alpha", scoreTeam: 13, scoreOpponent: 9, result: "WIN", playerStats: [
    { playerId: "p1", kills: 10, deaths: 5, assists: 3, firstKills: 1, plants: null, defuses: 0, player: { id: "p1", name: "Astra", primaryRole: "Controller", isActive: true } },
    { playerId: "p2", kills: 5, deaths: 7, assists: 4, firstKills: 0, plants: 1, defuses: null, player: { id: "p2", name: "Jett", primaryRole: "Duelist", isActive: false } },
  ] },
  { id: "m2", matchDate: "2026-01-02", map: "Bind", opponentName: "Bravo", scoreTeam: 5, scoreOpponent: 13, result: "LOSS", playerStats: [
    { playerId: "p1", kills: 8, deaths: 12, assists: 2, firstKills: null, plants: null, defuses: null, player: { id: "p1", name: "Astra", primaryRole: "Controller", isActive: true } },
    { playerId: "p2", kills: 9, deaths: 10, assists: 1, firstKills: 1, plants: 0, defuses: null, player: { id: "p2", name: "Jett", primaryRole: "Duelist", isActive: false } },
  ] },
  { id: "m3", matchDate: "2026-01-03", map: "Ascent", opponentName: "Charlie", scoreTeam: 12, scoreOpponent: 12, result: "DRAW", playerStats: [
    { playerId: "p1", kills: 6, deaths: 6, assists: 5, firstKills: 0, plants: 0, defuses: 0, player: { id: "p1", name: "Astra", primaryRole: "Controller", isActive: true } },
    { playerId: "p2", kills: 7, deaths: 4, assists: 2, firstKills: 0, plants: null, defuses: null, player: { id: "p2", name: "Jett", primaryRole: "Duelist", isActive: false } },
  ] },
];

const setupSqliteFixture = async () => {
  const client = createClient({ url: "file::memory:" });
  await client.batch([
    "CREATE TABLE players (id TEXT PRIMARY KEY, name TEXT, primary_role TEXT, is_active INTEGER)",
    "CREATE TABLE matches (id TEXT PRIMARY KEY, match_date TEXT, created_at TEXT, map TEXT, opponent_name TEXT, score_team INTEGER, score_opponent INTEGER, result TEXT)",
    "CREATE TABLE match_player_stats (id TEXT PRIMARY KEY, match_id TEXT, player_id TEXT, kills INTEGER, deaths INTEGER, assists INTEGER, first_kills INTEGER, plants INTEGER, defuses INTEGER)",
    "INSERT INTO players VALUES ('p1','Astra','Controller',1),('p2','Jett','Duelist',0),('p3','No Match','Flex',1)",
    ...fixture.map((match) => `INSERT INTO matches VALUES ('${match.id}','${match.matchDate}','${match.matchDate} 12:00:00','${match.map}','${match.opponentName}',${match.scoreTeam},${match.scoreOpponent},'${match.result}')`),
    ...fixture.flatMap((match) => match.playerStats.map((stat) => `INSERT INTO match_player_stats VALUES ('${match.id}-${stat.playerId}', '${match.id}', '${stat.playerId}', ${stat.kills}, ${stat.deaths}, ${stat.assists}, ${stat.firstKills ?? "NULL"}, ${stat.plants ?? "NULL"}, ${stat.defuses ?? "NULL"})`)),
  ], "write");
  return client;
};

describe("SQL scoreboard aggregates", () => {
  let client: Awaited<ReturnType<typeof setupSqliteFixture>> | undefined;
  afterEach(async () => { await client?.close(); client = undefined; });

  it("matches the previous in-memory dashboard and map calculations on a local fixture", async () => {
    client = await setupSqliteFixture();
    const dashboardRows = (await client.execute(DASHBOARD_AGGREGATE_SQL)).rows as unknown as Array<Record<string, unknown>>;
    const { summary, leaderboard } = mapDashboardAggregateRows(dashboardRows);
    const previousTeam = getTeamScoreboardSummary(fixture);
    expect(summary.totalMatches).toBe(fixture.length);
    expect(summary.wins).toBe(1);
    expect(summary.losses).toBe(1);
    expect(summary.draws).toBe(1);
    expect(summary.teamKdRatio).toBe(previousTeam.kdRatio);
    expect(summary.avgRoundDifference).toBe(previousTeam.avgRoundDifference);
    expect(summary.kdTrend).toEqual(getTeamKdTrend(fixture));
    expect(leaderboard).toEqual(getRosterDashboardRows(fixture));
    expect(leaderboard.some((row) => row.player.id === "p2" && !row.player.isActive)).toBe(true);

    const mapRows = (await client.execute(MAP_AGGREGATE_SQL)).rows as unknown as Array<Record<string, unknown>>;
    expect(includeEmptyMaps(mapMapAggregateRows(mapRows))).toEqual(summarizeMapScoreboards(fixture, VALORANT_MAPS));
  });
});
