import { describe, it, expect } from "vitest";
import { id } from "@/lib/i18n/dictionaries/id";
import { en } from "@/lib/i18n/dictionaries/en";
import { translateCoachNotes } from "@/lib/utils/note-translator";
import {
  evaluateMatchTactics,
} from "@/lib/utils/tactical-expert-engine";
import { MatchWithStats } from "@/lib/actions/matches";

// Recursive function to test that two objects have matching keys
function getObjectKeysDeep(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  if (!obj || typeof obj !== "object") return keys;
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getObjectKeysDeep(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

describe("i18n Dictionary Parity & Quality", () => {
  it("should have complete symmetry between ID and EN dictionary keys", () => {
    const idKeys = getObjectKeysDeep(id).sort();
    const enKeys = getObjectKeysDeep(en).sort();

    expect(idKeys).toEqual(enKeys);
  });

  it("should not have empty strings in ID dictionary", () => {
    const idKeys = getObjectKeysDeep(id);
    for (const keyPath of idKeys) {
      const parts = keyPath.split(".");
      let val: any = id;
      for (const part of parts) {
        val = val[part];
      }
      expect(typeof val).toBe("string");
      expect(val.trim().length).toBeGreaterThan(0);
    }
  });

  it("should not have empty strings in EN dictionary", () => {
    const enKeys = getObjectKeysDeep(en);
    for (const keyPath of enKeys) {
      const parts = keyPath.split(".");
      let val: any = en;
      for (const part of parts) {
        val = val[part];
      }
      expect(typeof val).toBe("string");
      expect(val.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("Indonesian to English Coach Note Translator", () => {
  it("should translate common tactical coach notes accurately", () => {
    const indoNote = "Komunikasi di site A sangat lambat. Perlu perbaiki crosshair placement saat retake.";
    const translated = translateCoachNotes(indoNote);

    expect(translated.toLowerCase()).toContain("site a");
    expect(translated.toLowerCase()).toContain("slow");
    expect(translated.toLowerCase()).toContain("crosshair placement");
    expect(translated.toLowerCase()).toContain("retake");
  });

  it("should translate economic and rotation notes", () => {
    const indoNote = "Rotasi lambat, jangan buang ulti saat round eco/save.";
    const translated = translateCoachNotes(indoNote);

    expect(translated.toLowerCase()).toContain("rotation");
    expect(translated.toLowerCase()).toContain("slow");
    expect(translated.toLowerCase()).toContain("ultimate");
    expect(translated.toLowerCase()).toContain("eco");
  });

  it("should handle empty or null notes safely", () => {
    expect(translateCoachNotes("")).toBe("");
    expect(translateCoachNotes("   ")).toBe("");
  });
});

describe("Tactical Expert Engine Localization", () => {
  const dummyMatch = {
    id: "match-test-1",
    matchDate: "2026-08-27",
    map: "Ascent",
    opponentName: "Team Secret",
    scoreTeam: 13,
    scoreOpponent: 7,
    roundTimeline: JSON.stringify([
      { round: 1, side: "ATTACK", winner: "TEAM", outcomeType: "ELIMINATION", tradesWon: 1, tradedDeaths: 1 },
      { round: 2, side: "ATTACK", winner: "TEAM", outcomeType: "DETONATION", tradesWon: 1, tradedDeaths: 1 },
      { round: 3, side: "ATTACK", winner: "OPPONENT", outcomeType: "DEFUSE", tradesWon: 0, tradedDeaths: 0 },
    ]),
    result: "WIN",
    startSide: "ATTACK",
    rounds: [
      { id: "r1", matchId: "match-test-1", roundNumber: 1, winningSide: "ATTACK", winCondition: "ELIMINATION", teamSide: "ATTACK", tradeKillsCount: 2, untradedDeathsCount: 0, playerNotes: null, createdAt: "2026-08-27" },
      { id: "r2", matchId: "match-test-1", roundNumber: 2, winningSide: "ATTACK", winCondition: "DETONATE", teamSide: "ATTACK", tradeKillsCount: 1, untradedDeathsCount: 1, playerNotes: null, createdAt: "2026-08-27" },
      { id: "r3", matchId: "match-test-1", roundNumber: 3, winningSide: "DEFENSE", winCondition: "DEFUSE", teamSide: "ATTACK", tradeKillsCount: 0, untradedDeathsCount: 3, playerNotes: null, createdAt: "2026-08-27" },
    ],
    playerStats: [
      { id: "ps1", matchId: "match-test-1", playerId: "p1", agent: "Jett", acs: 280, kills: 22, deaths: 12, assists: 4, firstKills: 4, firstDeaths: 2, clutchesWon: 1, adr: 180, createdAt: "2026-08-27", player: { id: "p1", name: "f0rsakeN", riotId: "f0rsaken#PRX", primaryRole: "Duelist", discordId: null, isActive: true, createdAt: "2026-08-27" } },
      { id: "ps2", matchId: "match-test-1", playerId: "p2", agent: "Sova", acs: 210, kills: 15, deaths: 10, assists: 11, firstKills: 1, firstDeaths: 0, clutchesWon: 0, adr: 140, createdAt: "2026-08-27", player: { id: "p2", name: "d4v41", riotId: "d4v41#PRX", primaryRole: "Initiator", discordId: null, isActive: true, createdAt: "2026-08-27" } },
    ],
    notes: null,
    attachmentUrl: null,
    attachmentName: null,
    attachmentSize: null,
    createdAt: "2026-08-27",
    updatedAt: "2026-08-27",
  } as unknown as MatchWithStats;

  it("should evaluate individual match in Indonesian", () => {
    const reportId = evaluateMatchTactics(dummyMatch, [], "id");
    expect(reportId).not.toBeNull();
    if (!reportId) throw new Error("Expected tactical report when match has recorded timeline and trade stats");
    expect(reportId.grade).toBeDefined();
    expect(reportId.gradeLabel).toBeDefined();
    expect(reportId.summary).toBeDefined();
    expect(reportId.strengths.length).toBeGreaterThan(0);
    expect(reportId.weaknesses.length).toBeGreaterThan(0);
    expect(reportId.drills.length).toBeGreaterThan(0);
  });

  it("should evaluate individual match in English", () => {
    const reportEn = evaluateMatchTactics(dummyMatch, [], "en");
    expect(reportEn).not.toBeNull();
    if (!reportEn) throw new Error("Expected tactical report when match has recorded timeline and trade stats");
    expect(reportEn.grade).toBeDefined();
    expect(reportEn.gradeLabel).toBeDefined();
    expect(reportEn.summary).toBeDefined();
    expect(reportEn.strengths.length).toBeGreaterThan(0);
    expect(reportEn.weaknesses.length).toBeGreaterThan(0);
    expect(reportEn.drills.length).toBeGreaterThan(0);
    expect(reportEn.gradeLabel).toMatch(/Masterclass|Disciplined|Solid|Average|Standard|Inconsistent|Blunders|Structure/i);
  });

});
