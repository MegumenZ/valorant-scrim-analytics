import { describe, expect, it } from "vitest";
import { hasMissingEventsForNewPlayers } from "@/lib/utils/match-edit-validation";

describe("scoreboard event validation during match edits", () => {
  it("allows unchanged legacy players to keep unknown event counts", () => {
    expect(hasMissingEventsForNewPlayers(
      [{ playerId: "legacy-player", plants: null, defuses: null }],
      new Set(["legacy-player"]),
    )).toBe(false);
  });

  it("requires Plants and Defuses for players newly added during an edit", () => {
    expect(hasMissingEventsForNewPlayers(
      [{ playerId: "replacement", plants: null, defuses: 0 }],
      new Set(["legacy-player"]),
    )).toBe(true);
    expect(hasMissingEventsForNewPlayers(
      [{ playerId: "replacement", plants: 0, defuses: 0 }],
      new Set(["legacy-player"]),
    )).toBe(false);
  });
});
