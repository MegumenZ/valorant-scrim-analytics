import { describe, expect, it } from "vitest";
import {
  canPermanentlyDeletePlayer,
  getInitialPlayerSelection,
  getRosterStatusLabel,
  hasProfileMatchData,
  shouldApplyPlayerStatus,
} from "@/lib/utils/roster-behavior";

describe("roster status and profile behavior", () => {
  it("uses explicit status targets and treats repeated targets as idempotent", () => {
    expect(shouldApplyPlayerStatus(true, false)).toBe(true);
    expect(shouldApplyPlayerStatus(false, true)).toBe(true);
    expect(shouldApplyPlayerStatus(true, true)).toBe(false);
    expect(shouldApplyPlayerStatus(false, false)).toBe(false);
  });

  it("allows permanent deletion only when match history is empty", () => {
    expect(canPermanentlyDeletePlayer(0)).toBe(true);
    expect(canPermanentlyDeletePlayer(1)).toBe(false);
    expect(canPermanentlyDeletePlayer(8)).toBe(false);
  });

  it("labels inactive leaderboard players", () => {
    expect(getRosterStatusLabel(false, "id")).toBe("Nonaktif");
    expect(getRosterStatusLabel(false, "en")).toBe("Inactive");
  });

  it("initializes player IDs from the latest recorded lineup and keeps stats separate", () => {
    const players = [
      { id: "active-a", isActive: true },
      { id: "sub-a", isActive: false },
      { id: "active-b", isActive: true },
      { id: "sub-b", isActive: false },
      { id: "active-c", isActive: true },
      { id: "active-d", isActive: true },
    ];
    expect(getInitialPlayerSelection(players, ["sub-a", "active-c", "active-b", "missing", "sub-b"])).toEqual([
      "sub-a", "active-c", "active-b", "sub-b", "active-a",
    ]);
    expect(getInitialPlayerSelection(players)).toEqual(["active-a", "active-b", "active-c", "active-d", "sub-a"]);
  });

  it("shows analytics only when the player has at least one match", () => {
    expect(hasProfileMatchData(0)).toBe(false);
    expect(hasProfileMatchData(1)).toBe(true);
  });
});
