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
