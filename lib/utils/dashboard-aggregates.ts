import { calculateKD } from "./calculations";

export interface DashboardMatchRecord {
  id: string;
  matchDate: string;
  map: string;
  opponentName: string;
  result: "WIN" | "LOSS" | "DRAW";
  scoreTeam: number;
  scoreOpponent: number;
  playerStats: Array<{
    playerId: string;
    kills: number;
    deaths: number;
    assists: number;
    firstKills: number | null;
    plants: number | null;
    defuses: number | null;
    player: { id: string; name: string; primaryRole: string; isActive: boolean };
  }>;
}

export interface RosterDashboardRow {
  player: { id: string; name: string; primaryRole: string; isActive: boolean };
  matches: number;
  kdRatio: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  firstBloodTotal: number | null;
  firstBloodAverage: number | null;
  firstBloodSamples: number;
  plantsTotal: number | null;
  plantsAverage: number | null;
  plantsSamples: number;
  defusesTotal: number | null;
  defusesAverage: number | null;
  defusesSamples: number;
}

export function getTeamScoreboardSummary(matches: readonly DashboardMatchRecord[]) {
  let kills = 0;
  let deaths = 0;
  let roundDifference = 0;
  for (const match of matches) {
    roundDifference += match.scoreTeam - match.scoreOpponent;
    for (const stat of match.playerStats) {
      kills += stat.kills;
      deaths += stat.deaths;
    }
  }
  return {
    totalKills: kills,
    totalDeaths: deaths,
    kdRatio: calculateKD(kills, deaths),
    avgRoundDifference: matches.length ? Number((roundDifference / matches.length).toFixed(1)) : 0,
  };
}

export function getTeamKdTrend(matches: readonly DashboardMatchRecord[]) {
  return [...matches]
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate) || a.id.localeCompare(b.id))
    .map((match) => {
      const kills = match.playerStats.reduce((sum, stat) => sum + stat.kills, 0);
      const deaths = match.playerStats.reduce((sum, stat) => sum + stat.deaths, 0);
      return {
        matchId: match.id,
        matchDate: match.matchDate,
        map: match.map,
        opponent: match.opponentName,
        result: match.result,
        score: `${match.scoreTeam}-${match.scoreOpponent}`,
        teamKd: calculateKD(kills, deaths),
      };
    });
}

export function getRosterDashboardRows(
  matches: readonly DashboardMatchRecord[],
): RosterDashboardRow[] {
  const stats = new Map<string, {
    player: RosterDashboardRow["player"];
    matches: number;
    kills: number;
    deaths: number;
    assists: number;
    firstBloodTotal: number;
    firstBloodSamples: number;
    plantsTotal: number;
    plantsSamples: number;
    defusesTotal: number;
    defusesSamples: number;
  }>();
  for (const match of matches) {
    for (const row of match.playerStats) {
      const player = row.player;
      const agg = stats.get(row.playerId) ?? {
        player, matches: 0, kills: 0, deaths: 0, assists: 0,
        firstBloodTotal: 0, firstBloodSamples: 0, plantsTotal: 0, plantsSamples: 0, defusesTotal: 0, defusesSamples: 0,
      };
      agg.matches++;
      agg.kills += row.kills;
      agg.deaths += row.deaths;
      agg.assists += row.assists;
      if (row.firstKills != null) { agg.firstBloodTotal += row.firstKills; agg.firstBloodSamples++; }
      if (row.plants != null) { agg.plantsTotal += row.plants; agg.plantsSamples++; }
      if (row.defuses != null) { agg.defusesTotal += row.defuses; agg.defusesSamples++; }
      stats.set(row.playerId, agg);
    }
  }
  return [...stats.values()].map((agg) => ({
    player: agg.player,
    matches: agg.matches,
    kdRatio: calculateKD(agg.kills, agg.deaths),
    avgKills: Number((agg.kills / agg.matches).toFixed(1)),
    avgDeaths: Number((agg.deaths / agg.matches).toFixed(1)),
    avgAssists: Number((agg.assists / agg.matches).toFixed(1)),
    firstBloodTotal: agg.firstBloodSamples ? agg.firstBloodTotal : null,
    firstBloodAverage: agg.firstBloodSamples ? Number((agg.firstBloodTotal / agg.firstBloodSamples).toFixed(1)) : null,
    firstBloodSamples: agg.firstBloodSamples,
    plantsTotal: agg.plantsSamples ? agg.plantsTotal : null,
    plantsAverage: agg.plantsSamples ? Number((agg.plantsTotal / agg.plantsSamples).toFixed(1)) : null,
    plantsSamples: agg.plantsSamples,
    defusesTotal: agg.defusesSamples ? agg.defusesTotal : null,
    defusesAverage: agg.defusesSamples ? Number((agg.defusesTotal / agg.defusesSamples).toFixed(1)) : null,
    defusesSamples: agg.defusesSamples,
  })).sort((a, b) => b.kdRatio - a.kdRatio || a.player.name.localeCompare(b.player.name));
}
