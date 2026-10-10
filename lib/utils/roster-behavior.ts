export interface RosterOption {
  id: string;
  isActive: boolean;
}

export function getInitialPlayerSelection(
  players: readonly RosterOption[],
  latestMatchPlayerIds: readonly string[] = [],
  size = 5,
): string[] {
  const availableIds = new Set(players.map((player) => player.id));
  const selected = [...new Set(latestMatchPlayerIds)].filter((id) => availableIds.has(id)).slice(0, size);
  for (const player of [...players].sort((a, b) => Number(b.isActive) - Number(a.isActive))) {
    if (selected.length >= size) break;
    if (!selected.includes(player.id)) selected.push(player.id);
  }
  return selected;
}

export function shouldApplyPlayerStatus(currentStatus: boolean, targetStatus: boolean) {
  return currentStatus !== targetStatus;
}

export function canPermanentlyDeletePlayer(matchCount: number) {
  return matchCount === 0;
}

export function hasProfileMatchData(matchesPlayed: number) {
  return matchesPlayed > 0;
}

export function getRosterStatusLabel(isActive: boolean, language: "id" | "en") {
  if (isActive) return language === "en" ? "Active" : "Aktif";
  return language === "en" ? "Inactive" : "Nonaktif";
}
