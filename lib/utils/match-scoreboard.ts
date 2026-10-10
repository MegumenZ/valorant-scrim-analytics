import type { MatchPlayerStat, OpponentMatchPlayerStat } from "../db/schema";
import { calculateKD } from "./calculations";

export type ScoreboardRow = Pick<MatchPlayerStat, "kills" | "deaths" | "assists"> & {
  acs?: number | null;
  adr?: number | null;
  hsPercent?: number | null;
  kastPercent?: number | null;
  firstKills?: number | null;
  firstDeaths?: number | null;
  clutchesWon?: number | null;
  plants?: number | null;
  defuses?: number | null;
};

export type ScoreboardColumns = ReturnType<typeof getVisibleScoreboardColumns>;

export function getVisibleScoreboardColumns(rows: readonly ScoreboardRow[]) {
  const hasValue = (key: keyof ScoreboardRow) => rows.some((row) => row[key] != null);
  return {
    firstKills: hasValue("firstKills"),
    plants: hasValue("plants"),
    defuses: hasValue("defuses"),
    acs: hasValue("acs"),
    adr: hasValue("adr"),
    hsPercent: hasValue("hsPercent"),
    kastPercent: hasValue("kastPercent"),
    firstDeaths: hasValue("firstDeaths"),
    clutchesWon: hasValue("clutchesWon"),
  };
}

export function hasAdvancedMatchStats(rows: readonly ScoreboardRow[]): boolean {
  return rows.some((row) => row.acs != null || row.adr != null || row.hsPercent != null || row.kastPercent != null || row.firstDeaths != null || row.clutchesWon != null);
}

export function sortScoreboardRows<T extends ScoreboardRow>(rows: readonly T[]): T[] {
  if (rows.some((row) => row.acs != null)) {
    return [...rows].sort((a, b) => {
      if (a.acs == null) return b.acs == null ? 0 : 1;
      if (b.acs == null) return -1;
      return b.acs - a.acs;
    });
  }
  return [...rows].sort((a, b) => b.kills - a.kills);
}

export function canShowMvp(rows: readonly ScoreboardRow[]): boolean {
  return rows.length > 0 && rows.every((row) => row.acs != null);
}

export function calculateMatchKdRatio(row: Pick<ScoreboardRow, "kills" | "deaths">): number {
  return calculateKD(row.kills, row.deaths);
}

export type OpponentScoreboardRow = Pick<OpponentMatchPlayerStat, "kills" | "deaths" | "assists" | "firstKills" | "plants" | "defuses">;

export function getTopFraggers<T extends { kills: number }>(rows: readonly T[]): T[] {
  if (!rows.length) return [];
  const maxKills = Math.max(...rows.map((row) => row.kills));
  return rows.filter((row) => row.kills === maxKills);
}
