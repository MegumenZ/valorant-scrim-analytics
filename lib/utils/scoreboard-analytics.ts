import { calculateKD } from "@/lib/utils/calculations";

export interface PlayerScoreboardRecord {
  matchId: string;
  matchDate: string;
  map: string;
  opponentName: string;
  result: "WIN" | "LOSS" | "DRAW";
  scoreTeam: number;
  scoreOpponent: number;
  agent: string;
  kills: number;
  deaths: number;
  assists: number;
  firstKills: number | null;
  plants: number | null;
  defuses: number | null;
}

export interface NullableMetricSummary { total: number | null; average: number | null; samples: number }
export interface PlayerScoreboardSummary {
  matchesPlayed: number; wins: number; losses: number; draws: number; winRate: number;
  totalKills: number; totalDeaths: number; totalAssists: number; kdRatio: number;
  avgKills: number; avgDeaths: number; avgAssists: number;
  firstBlood: NullableMetricSummary; plants: NullableMetricSummary; defuses: NullableMetricSummary;
}
export interface PlayerAgentScoreboardSummary { agent: string; matchesPlayed: number; kdRatio: number; totalKills: number; totalDeaths: number }
export interface MapScoreboardSummary {
  map: string; totalMatches: number; wins: number; losses: number; draws: number; winRate: number;
  avgRoundDifference: number | null; teamKdRatio: number | null; teamKills: number; teamDeaths: number;
}

function nullableMetric(values: Array<number | null>): NullableMetricSummary {
  const present = values.filter((value): value is number => value != null);
  return present.length ? {
    total: present.reduce((sum, value) => sum + value, 0),
    average: Number((present.reduce((sum, value) => sum + value, 0) / present.length).toFixed(1)),
    samples: present.length,
  } : { total: null, average: null, samples: 0 };
}

export function summarizePlayerScoreboard(rows: readonly PlayerScoreboardRecord[]): PlayerScoreboardSummary {
  const totalKills = rows.reduce((sum, row) => sum + row.kills, 0);
  const totalDeaths = rows.reduce((sum, row) => sum + row.deaths, 0);
  const totalAssists = rows.reduce((sum, row) => sum + row.assists, 0);
  const matchesPlayed = rows.length;
  const wins = rows.filter((row) => row.result === "WIN").length;
  const losses = rows.filter((row) => row.result === "LOSS").length;
  const draws = rows.filter((row) => row.result === "DRAW").length;
  return {
    matchesPlayed, wins, losses, draws,
    winRate: matchesPlayed ? Number(((wins / matchesPlayed) * 100).toFixed(1)) : 0,
    totalKills, totalDeaths, totalAssists, kdRatio: calculateKD(totalKills, totalDeaths),
    avgKills: matchesPlayed ? Number((totalKills / matchesPlayed).toFixed(1)) : 0,
    avgDeaths: matchesPlayed ? Number((totalDeaths / matchesPlayed).toFixed(1)) : 0,
    avgAssists: matchesPlayed ? Number((totalAssists / matchesPlayed).toFixed(1)) : 0,
    firstBlood: nullableMetric(rows.map((row) => row.firstKills)),
    plants: nullableMetric(rows.map((row) => row.plants)),
    defuses: nullableMetric(rows.map((row) => row.defuses)),
  };
}

export function summarizeAgentPool(rows: readonly PlayerScoreboardRecord[]): PlayerAgentScoreboardSummary[] {
  const byAgent = new Map<string, PlayerScoreboardRecord[]>();
  for (const row of rows) byAgent.set(row.agent, [...(byAgent.get(row.agent) ?? []), row]);
  return [...byAgent.entries()].map(([agent, agentRows]) => {
    const kills = agentRows.reduce((sum, row) => sum + row.kills, 0);
    const deaths = agentRows.reduce((sum, row) => sum + row.deaths, 0);
    return { agent, matchesPlayed: agentRows.length, kdRatio: calculateKD(kills, deaths), totalKills: kills, totalDeaths: deaths };
  }).sort((a, b) => b.matchesPlayed - a.matchesPlayed || a.agent.localeCompare(b.agent));
}

export function getPlayerKdTrend(rows: readonly PlayerScoreboardRecord[]) {
  return [...rows].sort((a, b) => a.matchDate.localeCompare(b.matchDate) || a.matchId.localeCompare(b.matchId)).map((row) => ({
    matchId: row.matchId, matchDate: row.matchDate, map: row.map, opponentName: row.opponentName,
    result: row.result, scoreTeam: row.scoreTeam, scoreOpponent: row.scoreOpponent,
    kdRatio: calculateKD(row.kills, row.deaths),
  }));
}

export function summarizeMapScoreboards(
  matches: readonly { id: string; map: string; result: "WIN" | "LOSS" | "DRAW"; scoreTeam: number; scoreOpponent: number; playerStats: Array<{ kills: number; deaths: number }> }[],
  mapNames: readonly string[],
): MapScoreboardSummary[] {
  return mapNames.map((map) => {
    const rows = matches.filter((match) => match.map === map);
    const wins = rows.filter((match) => match.result === "WIN").length;
    const losses = rows.filter((match) => match.result === "LOSS").length;
    const draws = rows.filter((match) => match.result === "DRAW").length;
    const teamKills = rows.flatMap((match) => match.playerStats).reduce((sum, stat) => sum + stat.kills, 0);
    const teamDeaths = rows.flatMap((match) => match.playerStats).reduce((sum, stat) => sum + stat.deaths, 0);
    const roundDifference = rows.reduce((sum, match) => sum + match.scoreTeam - match.scoreOpponent, 0);
    return {
      map, totalMatches: rows.length, wins, losses, draws,
      winRate: rows.length ? Number(((wins / rows.length) * 100).toFixed(1)) : 0,
      avgRoundDifference: rows.length ? Number((roundDifference / rows.length).toFixed(1)) : null,
      teamKdRatio: rows.length ? calculateKD(teamKills, teamDeaths) : null,
      teamKills, teamDeaths,
    };
  }).sort((a, b) => b.totalMatches - a.totalMatches || a.map.localeCompare(b.map));
}
