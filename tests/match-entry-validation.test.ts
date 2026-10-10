import { describe, expect, it } from "vitest";
import { getMatchWarnings, matchSchema } from "@/lib/validations/match";
import { resolveRoundTimelineForUpdate } from "@/lib/utils/match-timeline";

const team = [
  ["Andar", "Jett", 21, 21, 1, 1, 0, 0],
  ["Fleuryy", "Raze", 17, 22, 5, 5, 0, 0],
  ["MegumeN", "Omen", 16, 20, 4, 1, 0, 1],
  ["FourSevenZ", "Sova", 12, 19, 5, 1, 8, 1],
  ["Anandaa", "Cypher", 5, 23, 3, 1, 0, 0],
].map(([playerId, agent, kills, deaths, assists, firstKills, plants, defuses]) => ({ playerId, agent, kills, deaths, assists, firstKills, plants, defuses }));
const enemy = [
  ["DSR", "Jett", 30, 11, 8, 1, 7, 2],
  ["Kyle", "Raze", 25, 15, 4, 6, 3, 0],
  ["Frag1le", "Omen", 24, 14, 18, 3, 2, 0],
  ["asthazera", "Sova", 15, 17, 5, 4, 0, 0],
  ["FAYKOSKELLY", "Cypher", 11, 14, 5, 1, 0, 1],
].map(([displayName, agent, kills, deaths, assists, firstKills, plants, defuses]) => ({ displayName, agent, kills, deaths, assists, firstKills, plants, defuses }));
const validMatch = () => ({
  matchDate: "2026-10-06", map: "Lotus", opponentName: "Opponent", scoreTeam: 7, scoreOpponent: 17,
  playerStats: team.map((row) => ({ ...row })), opponentPlayerStats: enemy.map((row) => ({ ...row })),
});

describe("post-match scoreboard validation", () => {
  it("accepts the 7–17 MR24 fixture with no warnings and leaves advanced stats unknown", () => {
    const parsed = matchSchema.parse(validMatch());
    expect(parsed.playerStats[0]).toMatchObject({ acs: null, adr: null, hsPercent: null, kastPercent: null, firstDeaths: null, clutchesWon: null });
    expect(getMatchWarnings(parsed)).toEqual([]);
  });

  it("accepts Team SC-only scoreboards", () => {
    expect(matchSchema.safeParse({ ...validMatch(), opponentPlayerStats: null }).success).toBe(true);
  });

  it("normalizes every omitted advanced statistic to NULL", () => {
    const parsed = matchSchema.parse(validMatch());
    expect(parsed.playerStats.every((row) => row.acs === null && row.adr === null && row.hsPercent === null && row.kastPercent === null && row.firstDeaths === null && row.clutchesWon === null)).toBe(true);
  });

  it("accepts valid compressed WebP and enforces count, per-file, total, and MIME limits", () => {
    const webp = (id: string, bytes: number, mimeType = "image/webp", type: "image" | "pdf" = "image") => {
      const payload = new Uint8Array(bytes);
      payload.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
      const dataUrl = `data:${mimeType};base64,${Buffer.from(payload).toString("base64")}`;
      return { id, name: "screen.webp", type, mimeType, dataUrl, sizeBytes: bytes, originalSize: bytes, uploadedAt: "2026-10-10T00:00:00.000Z" };
    };
    const valid = webp("att-webp-a", 400_000);
    expect(matchSchema.safeParse({ ...validMatch(), attachments: [valid] }).success).toBe(true);
    expect(matchSchema.safeParse({ ...validMatch(), attachments: [webp("att-webp-b", 600 * 1024 + 1)] }).success).toBe(false);
    expect(matchSchema.safeParse({ ...validMatch(), attachments: [webp("att-webp-b", 600_000), webp("att-webp-c", 600_000), webp("att-webp-d", 400_000)] }).success).toBe(false);
    expect(matchSchema.safeParse({ ...validMatch(), attachments: [valid, valid, valid, valid] }).success).toBe(false);
    expect(matchSchema.safeParse({ ...validMatch(), attachments: [webp("att-webp-png", 20, "image/png")] }).success).toBe(false);
  });

  it("keeps legacy JPEG, PNG, and PDF attachments valid when editing old matches", () => {
    const legacy = (id: string, mimeType: string, prefix: string, type: "image" | "pdf", bytes: number) => {
      const payload = Buffer.alloc(bytes);
      payload.set(Buffer.from(prefix, "base64"));
      const dataUrl = `data:${mimeType};base64,${payload.toString("base64")}`;
      return { id, name: "legacy", type, mimeType, dataUrl, sizeBytes: bytes, originalSize: bytes, uploadedAt: "2025-01-01T00:00:00.000Z" };
    };
    const oldFiles = [legacy("att-old-jpg", "image/jpeg", "/9j/", "image", 700_000), legacy("att-old-png", "image/png", "iVBORw0KGgo", "image", 700_000), legacy("att-pdf-old", "application/pdf", "JVBERi0", "pdf", 700_000)];
    expect(matchSchema.safeParse({ ...validMatch(), attachments: oldFiles }).success).toBe(true);
  });

  it("preserves legacy round and trade payloads when an edit omits timeline data", () => {
    const legacy = JSON.stringify([{ round: 1, side: "ATTACK", winner: "TEAM", tradesWon: 1, tradedDeaths: 1 }]);
    expect(resolveRoundTimelineForUpdate(null, legacy)).toBe(legacy);
    expect(resolveRoundTimelineForUpdate([], legacy)).toBeNull();
  });

  it("allows legacy rows without the new Plants/Defuses fields to pass edit validation", () => {
    const legacyRows = team.map((row) => ({ ...row, plants: null, defuses: null }));
    expect(matchSchema.safeParse({ ...validMatch(), playerStats: legacyRows, opponentPlayerStats: null }).success).toBe(true);
  });

  it.each([
    ["requires five Team SC players", (data: any) => { data.playerStats.pop(); }],
    ["rejects duplicate Team SC players", (data: any) => { data.playerStats[4].playerId = data.playerStats[0].playerId; }],
    ["rejects unsupported agents", (data: any) => { data.playerStats[0].agent = "Unknown"; }],
    ["rejects unsupported maps", (data: any) => { data.map = "Training"; }],
    ["rejects negative values", (data: any) => { data.playerStats[0].kills = -1; }],
    ["rejects negative scores", (data: any) => { data.scoreTeam = -1; }],
    ["rejects incomplete opponent rows", (data: any) => { data.opponentPlayerStats.pop(); }],
    ["rejects a total Team SC First Blood count over rounds", (data: any) => { data.playerStats[0].firstKills = 25; }],
    ["rejects a total Team SC plant count over rounds", (data: any) => { data.playerStats[0].plants = 25; }],
    ["rejects defuses beyond opposing plants", (data: any) => { data.playerStats[0].defuses = 13; }],
    ["rejects opponent defuses beyond Team SC plants", (data: any) => { data.opponentPlayerStats[0].defuses = 13; }],
    ["rejects both teams' First Bloods exceeding total rounds", (data: any) => { data.opponentPlayerStats[0].firstKills = 25; }],
    ["rejects invalid calendar dates", (data: any) => { data.matchDate = "2026-02-30"; }],
  ])("%s", (_label, mutate) => {
    const data = validMatch();
    mutate(data);
    expect(matchSchema.safeParse(data).success).toBe(false);
  });

  it("requires confirmation for nonstandard regulation scores and mismatched K/D when opponent data is entered", () => {
    const input = validMatch();
    const shortTeam = input.playerStats.map((row) => ({ ...row, firstKills: 1 }));
    const shortEnemy = input.opponentPlayerStats.map((row) => ({ ...row, firstKills: 1, kills: Number(row.kills) + 1 }));
    const data = matchSchema.parse({ ...input, playerStats: shortTeam, opponentPlayerStats: shortEnemy, scoreTeam: 10, scoreOpponent: 8 });
    expect(getMatchWarnings(data).length).toBeGreaterThan(0);
  });
});
