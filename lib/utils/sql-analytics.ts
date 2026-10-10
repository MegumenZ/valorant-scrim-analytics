import type { DashboardSummary, MapAggregateStats } from "./analytics";
import type { RosterDashboardRow } from "./dashboard-aggregates";
import { calculateKD } from "./calculations";
import { VALORANT_MAPS, type ValorantMap } from "../data/valorant";

/** One materialized scan feeds match- and player-grain SQL aggregates. */
export const DASHBOARD_AGGREGATE_SQL = `
WITH raw AS MATERIALIZED (
  SELECT m.id AS match_id, m.match_date, m.created_at, m.map, m.opponent_name,
    m.score_team, m.score_opponent, m.result,
    p.id AS player_id, p.name AS player_name, p.primary_role, p.is_active,
    s.kills, s.deaths, s.assists, s.first_kills, s.plants, s.defuses
  FROM matches m
  LEFT JOIN match_player_stats s ON s.match_id = m.id
  LEFT JOIN players p ON p.id = s.player_id
  WHERE (? IS NULL OR m.match_date >= ?)
), aggregate_rows AS (
  SELECT 'match' AS kind, match_id AS group_id, match_date, created_at, map,
    opponent_name, score_team, score_opponent, result,
    COALESCE(SUM(kills), 0) AS team_kills, COALESCE(SUM(deaths), 0) AS team_deaths,
    NULL AS player_name, NULL AS primary_role, NULL AS is_active,
    NULL AS matches_played, NULL AS kills, NULL AS deaths, NULL AS assists,
    NULL AS first_blood_total, NULL AS first_blood_samples,
    NULL AS plants_total, NULL AS plants_samples, NULL AS defuses_total, NULL AS defuses_samples
  FROM raw GROUP BY match_id
  UNION ALL
  SELECT 'player', player_id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    MAX(player_name), MAX(primary_role), MAX(is_active), COUNT(match_id),
    COALESCE(SUM(kills), 0), COALESCE(SUM(deaths), 0), COALESCE(SUM(assists), 0),
    COALESCE(SUM(first_kills), 0), COUNT(first_kills),
    COALESCE(SUM(plants), 0), COUNT(plants), COALESCE(SUM(defuses), 0), COUNT(defuses)
  FROM raw WHERE player_id IS NOT NULL GROUP BY player_id
)
SELECT * FROM aggregate_rows ORDER BY kind, match_date DESC, created_at DESC;
`;

/** One match-grain aggregate prevents scoreboard rows multiplying round differences. */
export const MAP_AGGREGATE_SQL = `
WITH per_match AS (
  SELECT m.id, m.map, m.result, m.score_team, m.score_opponent,
    COALESCE(SUM(s.kills), 0) AS team_kills,
    COALESCE(SUM(s.deaths), 0) AS team_deaths
  FROM matches m
  LEFT JOIN match_player_stats s ON s.match_id = m.id
  GROUP BY m.id
)
SELECT map, COUNT(*) AS total_matches,
  SUM(CASE WHEN result = 'WIN' THEN 1 ELSE 0 END) AS wins,
  SUM(CASE WHEN result = 'LOSS' THEN 1 ELSE 0 END) AS losses,
  SUM(CASE WHEN result = 'DRAW' THEN 1 ELSE 0 END) AS draws,
  AVG(score_team - score_opponent) AS avg_round_difference,
  SUM(team_kills) AS team_kills, SUM(team_deaths) AS team_deaths
FROM per_match GROUP BY map;
`;

type SqlRow = Record<string, unknown>;
const number = (value: unknown) => Number(value ?? 0);
const string = (value: unknown) => String(value ?? "");

export function mapDashboardAggregateRows(rows: readonly SqlRow[]): {
  summary: DashboardSummary;
  leaderboard: RosterDashboardRow[];
} {
  const matchRows = rows.filter((row) => row.kind === "match");
  const playerRows = rows.filter((row) => row.kind === "player");
  const totalMatches = matchRows.length;
  const wins = matchRows.filter((row) => row.result === "WIN").length;
  const losses = matchRows.filter((row) => row.result === "LOSS").length;
  const draws = totalMatches - wins - losses;
  const totalKills = matchRows.reduce((sum, row) => sum + number(row.team_kills), 0);
  const totalDeaths = matchRows.reduce((sum, row) => sum + number(row.team_deaths), 0);
  const mapTotals = new Map<string, { total: number; wins: number; losses: number; draws: number }>();
  for (const row of matchRows) {
    const map = string(row.map);
    const totals = mapTotals.get(map) ?? { total: 0, wins: 0, losses: 0, draws: 0 };
    totals.total++;
    if (row.result === "WIN") totals.wins++;
    else if (row.result === "LOSS") totals.losses++;
    else totals.draws++;
    mapTotals.set(map, totals);
  }
  const mapBreakdown = [...mapTotals.entries()].map(([map, totals]) => ({
    map: map as ValorantMap,
    ...totals,
    winRate: Number(((totals.wins / totals.total) * 100).toFixed(1)),
  })).sort((a, b) => b.total - a.total);
  const kdTrend = [...matchRows]
    .sort((a, b) => string(a.match_date).localeCompare(string(b.match_date)) || string(a.group_id).localeCompare(string(b.group_id)))
    .map((row) => ({
      matchId: string(row.group_id),
      matchDate: string(row.match_date),
      map: string(row.map),
      opponent: string(row.opponent_name),
      result: string(row.result),
      score: `${number(row.score_team)}-${number(row.score_opponent)}`,
      teamKd: calculateKD(number(row.team_kills), number(row.team_deaths)),
    }));
  const leaderboard: RosterDashboardRow[] = playerRows.map((row) => {
    const matches = number(row.matches_played);
    const kills = number(row.kills);
    const deaths = number(row.deaths);
    const firstBloodSamples = number(row.first_blood_samples);
    const plantsSamples = number(row.plants_samples);
    const defusesSamples = number(row.defuses_samples);
    const firstBloodTotal = number(row.first_blood_total);
    const plantsTotal = number(row.plants_total);
    const defusesTotal = number(row.defuses_total);
    return {
      player: { id: string(row.group_id), name: string(row.player_name), primaryRole: string(row.primary_role), isActive: Boolean(number(row.is_active)) },
      matches,
      kdRatio: calculateKD(kills, deaths),
      avgKills: Number((kills / matches).toFixed(1)),
      avgDeaths: Number((deaths / matches).toFixed(1)),
      avgAssists: Number((number(row.assists) / matches).toFixed(1)),
      firstBloodTotal: firstBloodSamples ? firstBloodTotal : null,
      firstBloodAverage: firstBloodSamples ? Number((firstBloodTotal / firstBloodSamples).toFixed(1)) : null,
      firstBloodSamples,
      plantsTotal: plantsSamples ? plantsTotal : null,
      plantsAverage: plantsSamples ? Number((plantsTotal / plantsSamples).toFixed(1)) : null,
      plantsSamples,
      defusesTotal: defusesSamples ? defusesTotal : null,
      defusesAverage: defusesSamples ? Number((defusesTotal / defusesSamples).toFixed(1)) : null,
      defusesSamples,
    };
  }).sort((a, b) => b.kdRatio - a.kdRatio || a.player.name.localeCompare(b.player.name));
  return {
    summary: {
      totalMatches,
      wins,
      losses,
      draws,
      winRate: totalMatches ? Number(((wins / totalMatches) * 100).toFixed(1)) : 0,
      teamKdRatio: calculateKD(totalKills, totalDeaths),
      teamTotalKills: totalKills,
      teamTotalDeaths: totalDeaths,
      avgRoundDifference: totalMatches ? Number((matchRows.reduce((sum, row) => sum + number(row.score_team) - number(row.score_opponent), 0) / totalMatches).toFixed(1)) : 0,
      mapBreakdown,
      kdTrend,
    },
    leaderboard,
  };
}

export function mapMapAggregateRows(rows: readonly SqlRow[]): MapAggregateStats[] {
  return rows.map((row) => {
    const totalMatches = number(row.total_matches);
    const wins = number(row.wins);
    const teamKills = number(row.team_kills);
    const teamDeaths = number(row.team_deaths);
    return {
      map: string(row.map) as ValorantMap,
      totalMatches,
      wins,
      losses: number(row.losses),
      draws: number(row.draws),
      winRate: totalMatches ? Number(((wins / totalMatches) * 100).toFixed(1)) : 0,
      avgRoundDifference: totalMatches ? Number(number(row.avg_round_difference).toFixed(1)) : null,
      teamKdRatio: totalMatches ? calculateKD(teamKills, teamDeaths) : null,
      teamKills,
      teamDeaths,
    };
  }).sort((a, b) => b.totalMatches - a.totalMatches || a.map.localeCompare(b.map));
}

export function includeEmptyMaps(rows: MapAggregateStats[]): MapAggregateStats[] {
  const byMap = new Map(rows.map((row) => [row.map, row]));
  return VALORANT_MAPS.map((map) => byMap.get(map) ?? {
    map, totalMatches: 0, wins: 0, losses: 0, draws: 0, winRate: 0,
    avgRoundDifference: null, teamKdRatio: null, teamKills: 0, teamDeaths: 0,
  }).sort((a, b) => b.totalMatches - a.totalMatches || a.map.localeCompare(b.map));
}
