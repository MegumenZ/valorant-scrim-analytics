import { Player } from "../db/schema";
import { ValorantMap } from "../data/valorant";

export { calculateKD, calculateMatchResult } from "./calculations";

export interface PlayerAggregateStats {
  player: Player;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  kdRatio: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  firstBlood: { total: number | null; average: number | null; samples: number };
  plants: { total: number | null; average: number | null; samples: number };
  defuses: { total: number | null; average: number | null; samples: number };
}

export interface AgentStatSummary {
  agent: string;
  matchesPlayed: number;
  kdRatio: number;
  totalKills: number;
  totalDeaths: number;
}

export interface MapAggregateStats {
  map: ValorantMap;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgRoundDifference: number | null;
  teamKdRatio: number | null;
  teamKills: number;
  teamDeaths: number;
}

export interface DashboardSummary {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  teamKdRatio: number;
  teamTotalKills: number;
  teamTotalDeaths: number;
  avgRoundDifference: number;
  mapBreakdown: Array<{ map: ValorantMap; total: number; wins: number; losses: number; draws: number; winRate: number }>;
  kdTrend: Array<{ matchId: string; matchDate: string; map: string; opponent: string; result: string; score: string; teamKd: number }>;
}
