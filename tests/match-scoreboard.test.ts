import { describe, expect, it } from "vitest";
import { calculateMatchKdRatio, canShowMvp, getTopFraggers, getVisibleScoreboardColumns, sortScoreboardRows } from "@/lib/utils/match-scoreboard";

const fullMatchFixture = [
  { kills: 20, deaths: 10, assists: 5, firstKills: 3, plants: 1, defuses: 0, acs: 250, adr: 160, hsPercent: 25, kastPercent: 75, firstDeaths: 2, clutchesWon: 1 },
  { kills: 15, deaths: 12, assists: 8, firstKills: 1, plants: 0, defuses: 1, acs: 210, adr: 130, hsPercent: 20, kastPercent: 70, firstDeaths: 1, clutchesWon: 0 },
];
const compactMatchFixture = [
  { kills: 20, deaths: 10, assists: 5, firstKills: 3, plants: 1, defuses: 0, acs: null, adr: null, hsPercent: null, kastPercent: null, firstDeaths: null, clutchesWon: null },
  { kills: 15, deaths: 12, assists: 8, firstKills: 1, plants: 0, defuses: 1, acs: null, adr: null, hsPercent: null, kastPercent: null, firstDeaths: null, clutchesWon: null },
];

describe("match scoreboard rendering helpers", () => {
  it("shows all recorded columns for a full historical match", () => {
    expect(getVisibleScoreboardColumns(fullMatchFixture)).toEqual({
      firstKills: true, plants: true, defuses: true, acs: true, adr: true,
      hsPercent: true, kastPercent: true, firstDeaths: true, clutchesWon: true,
    });
    expect(canShowMvp(fullMatchFixture)).toBe(true);
  });

  it("shows only scoreboard event columns for a compact match and hides MVP without ACS", () => {
    expect(getVisibleScoreboardColumns(compactMatchFixture)).toEqual({
      firstKills: true, plants: true, defuses: true, acs: false, adr: false,
      hsPercent: false, kastPercent: false, firstDeaths: false, clutchesWon: false,
    });
    expect(canShowMvp(compactMatchFixture)).toBe(false);
    expect(sortScoreboardRows(compactMatchFixture).map((row) => row.kills)).toEqual([20, 15]);
  });

  it("calculates K/D to two decimals and keeps the existing zero-death guard", () => {
    expect(calculateMatchKdRatio({ kills: 7, deaths: 3 })).toBe(2.33);
    expect(calculateMatchKdRatio({ kills: 7, deaths: 0 })).toBe(7);
  });
});
