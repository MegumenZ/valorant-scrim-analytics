import { Match, MatchPlayerStat, Player } from "../db/schema";
import { ValorantMap } from "../data/valorant";

export function calculateKD(kills: number, deaths: number): number {
  return Number((kills / Math.max(1, deaths)).toFixed(2));
}

export function calculateOpeningDuelRatio(fk: number, fd: number): number {
  return Number((fk / Math.max(1, fd)).toFixed(2));
}

export function calculateMatchResult(scoreTeam: number, scoreOpponent: number): "WIN" | "LOSS" | "DRAW" {
  if (scoreTeam > scoreOpponent) return "WIN";
  if (scoreTeam < scoreOpponent) return "LOSS";
  return "DRAW";
}

export interface PlayerAggregateStats {
  player: Player;
  matchesPlayed: number;
  avgAcs: number;
  avgAdr: number;
  kdRatio: number;
  avgHsPercent: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  firstKills: number;
  firstDeaths: number;
  odr: number;
  clutchesWon: number;
  avgKastPercent: number;
}

export interface AgentStatSummary {
  agent: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgAcs: number;
  avgAdr: number;
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
  roundsWon: number;
  roundsLost: number;
  roundWinRate: number;
  attackStartMatches: number;
  attackStartWins: number;
  defenseStartMatches: number;
  defenseStartWins: number;
}

export interface TacticalWinBreakdown {
  totalWins: number;
  eliminations: number;
  eliminationRate: number;
  defuses: number;       // Retake & Spike Defused (Defender)
  defuseRate: number;
  detonations: number;   // Post-Plant Spike Detonated (Attacker)
  detonationRate: number;
  timeouts: number;      // Waktu Habis (Defender)
  timeoutRate: number;
}

export interface TacticalLossBreakdown {
  totalLosses: number;
  eliminations: number;      // Tim tereliminasi
  eliminationRate: number;
  defusedLosses: number;     // Musuh Retake & Defuse Spike (Saat kita Attacker)
  defusedLossRate: number;
  detonationLosses: number;  // Spike Musuh Meledak (Saat kita Defender gagal retake)
  detonationLossRate: number;
  timeoutLosses: number;     // Waktu Habis saat Attacker gagal plant
  timeoutLossRate: number;
}

export interface TradingKillStats {
  tradesWon: number;        // Total kill trade balasan oleh tim
  tradedDeaths: number;     // Kematian tim yang berhasil di-trade oleh rekan
  untradedDeaths: number;   // Kematian tanpa trade (dry death / terisolasi)
  totalDeaths: number;      // Total kematian tim
  tradeEfficiency: number;  // % kematian yang berhasil di-trade (0-100%)
  tradeRating: "EXCELLENT" | "GOOD" | "POOR";
}

export interface DashboardSummary {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  teamAvgAcs: number;
  teamAvgAdr: number;
  strongestMap: {
    map: ValorantMap | "N/A";
    winRate: number;
    wins: number;
    losses: number;
  };
  sideStats: {
    attackWinRate: number;
    defenseWinRate: number;
  };
  tacticalWins: TacticalWinBreakdown;
  tacticalLosses: TacticalLossBreakdown;
  tradingStats: TradingKillStats;
  mapBreakdown: Array<{
    map: ValorantMap;
    total: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  }>;
  acsTrend: Array<{
    matchId: string;
    matchDate: string;
    map: string;
    opponent: string;
    result: string;
    score: string;
    teamAvgAcs: number;
  }>;
}
