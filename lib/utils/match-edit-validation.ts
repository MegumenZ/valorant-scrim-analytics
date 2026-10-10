export interface ScoreboardEventValues {
  playerId: string;
  plants: number | null | undefined;
  defuses: number | null | undefined;
}

/** New players added while editing must provide event counts; legacy rows may remain unknown. */
export function hasMissingEventsForNewPlayers(
  rows: readonly ScoreboardEventValues[],
  previousPlayerIds: ReadonlySet<string>,
): boolean {
  return rows.some((row) =>
    !previousPlayerIds.has(row.playerId) && (row.plants == null || row.defuses == null),
  );
}
