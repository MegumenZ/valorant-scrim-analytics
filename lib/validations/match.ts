import { z } from "zod";
import { VALORANT_AGENTS, VALORANT_MAPS } from "../data/valorant";

const optionalStat = (max: number) => z.preprocess((value) => value === "" || value == null ? undefined : value, z.number().int().min(0).max(max).optional()).transform((value) => value ?? null);
const scoreboardNumber = z.number().int().min(0).max(99);
const optionalScoreboardNumber = z.preprocess((value) => value === "" || value == null ? undefined : value, scoreboardNumber.optional()).transform((value) => value ?? null);

export const playerStatSchema = z.object({
  playerId: z.string().min(1),
  agent: z.enum(VALORANT_AGENTS.map((agent) => agent.name) as [string, ...string[]]),
  kills: scoreboardNumber,
  deaths: scoreboardNumber,
  assists: scoreboardNumber,
  firstKills: scoreboardNumber,
  plants: optionalScoreboardNumber,
  defuses: optionalScoreboardNumber,
  acs: optionalStat(999),
  adr: optionalStat(999),
  hsPercent: optionalStat(100),
  kastPercent: optionalStat(100),
  firstDeaths: optionalStat(99),
  clutchesWon: optionalStat(99),
});

export const opponentPlayerStatSchema = z.object({
  displayName: z.string().trim().min(1).max(50),
  agent: z.enum(VALORANT_AGENTS.map((agent) => agent.name) as [string, ...string[]]),
  kills: scoreboardNumber,
  deaths: scoreboardNumber,
  assists: scoreboardNumber,
  firstKills: scoreboardNumber,
  plants: scoreboardNumber,
  defuses: scoreboardNumber,
});

const MAX_NEW_ATTACHMENT_BYTES = 600 * 1024;
const MAX_NEW_ATTACHMENTS_TOTAL_BYTES = 1536 * 1024;
const attachmentFormats = {
  "image/jpeg": ["/9j/"],
  "image/png": ["iVBORw0KGgo"],
  "image/webp": ["UklGR"],
  "application/pdf": ["JVBERi0"],
} as const;

export const attachmentSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().min(1).max(255),
  type: z.enum(["image", "pdf"]), mimeType: z.string(), dataUrl: z.string().max(7_000_100),
  sizeBytes: z.number().int().nonnegative().max(5 * 1024 * 1024),
  originalSize: z.number().int().nonnegative(), uploadedAt: z.string().datetime(),
}).superRefine((attachment, ctx) => {
  const prefixes = attachmentFormats[attachment.mimeType as keyof typeof attachmentFormats];
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/]*={0,2})$/.exec(attachment.dataUrl);
  if (!prefixes || !match || match[1] !== attachment.mimeType || !prefixes.some((prefix) => match[2].startsWith(prefix))) {
    ctx.addIssue({ code: "custom", path: ["dataUrl"], message: "Format lampiran tidak didukung atau tidak valid" });
    return;
  }
  if (attachment.mimeType === "image/webp") {
    const signature = atob(match[2].slice(0, 16));
    if (signature.slice(0, 4) !== "RIFF" || signature.slice(8, 12) !== "WEBP") {
      ctx.addIssue({ code: "custom", path: ["dataUrl"], message: "Signature WebP tidak valid" });
      return;
    }
  }
  const decodedBytes = Math.floor((match[2].length * 3) / 4) - (match[2].endsWith("==") ? 2 : match[2].endsWith("=") ? 1 : 0);
  // Legacy compressor metadata rounded base64 sizes and can differ by up to 2 bytes.
  if (Math.abs(decodedBytes - attachment.sizeBytes) > 2 || decodedBytes > 5 * 1024 * 1024) {
    ctx.addIssue({ code: "custom", path: ["sizeBytes"], message: "Ukuran lampiran tidak valid atau melebihi batas historis 5 MiB" });
  }
  if ((attachment.mimeType === "application/pdf") !== (attachment.type === "pdf")) {
    ctx.addIssue({ code: "custom", path: ["type"], message: "Jenis lampiran tidak cocok dengan format" });
  }
  if (attachment.id.startsWith("att-webp-")) {
    if (attachment.mimeType !== "image/webp" || attachment.type !== "image") {
      ctx.addIssue({ code: "custom", path: ["mimeType"], message: "Lampiran baru wajib menggunakan WebP" });
    }
    if (decodedBytes > MAX_NEW_ATTACHMENT_BYTES) {
      ctx.addIssue({ code: "custom", path: ["sizeBytes"], message: "Ukuran screenshot baru maksimal 600 KB" });
    }
  }
});

export const roundOutcomeTypeSchema = z.enum(["ELIMINATION", "DEFUSE", "DETONATION", "TIME"]);
export type RoundOutcomeType = z.infer<typeof roundOutcomeTypeSchema>;
export type RoundWinType = RoundOutcomeType;
export const roundItemSchema = z.object({
  round: z.number(), side: z.enum(["ATTACK", "DEFENSE"]), winner: z.enum(["TEAM", "OPPONENT"]),
  winType: roundOutcomeTypeSchema.optional().nullable(), outcomeType: roundOutcomeTypeSchema.optional().nullable(),
  tradedDeaths: z.coerce.number().int().min(0).max(10).optional().nullable(),
  tradesWon: z.coerce.number().int().min(0).max(10).optional().nullable(),
});

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, "Tanggal kalender tidak valid");

export const matchSchema = z.object({
  matchDate: calendarDate,
  map: z.enum(VALORANT_MAPS),
  opponentName: z.string().trim().min(1, "Nama tim lawan wajib diisi").max(50),
  scoreTeam: scoreboardNumber,
  scoreOpponent: scoreboardNumber,
  startSide: z.enum(["ATTACK", "DEFENSE"]).default("ATTACK"),
  vodUrl: z.string().url().refine((value) => /^https?:\/\//i.test(value)).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  attachments: z.array(attachmentSchema).max(3).optional().default([]),
  preservedAttachmentIds: z.array(z.string().min(1).max(100)).max(3).optional().default([]),
  idempotencyKey: z.string().uuid().optional(),
  // Timeline is accepted only to preserve legacy matches during edits; new forms omit it.
  roundsTimeline: z.array(roundItemSchema).optional().nullable(),
  playerStats: z.array(playerStatSchema).length(5).refine((rows) => new Set(rows.map((row) => row.playerId)).size === 5, "Pilih 5 pemain yang berbeda"),
  opponentPlayerStats: z.array(opponentPlayerStatSchema).length(5).optional().nullable(),
  confirmWarnings: z.boolean().optional().default(false),
}).superRefine((match, ctx) => {
  if (match.attachments.length > 3) ctx.addIssue({ code: "custom", path: ["attachments"], message: "Maksimal 3 lampiran" });
  if (match.attachments.length + match.preservedAttachmentIds.length > 3 || new Set(match.preservedAttachmentIds).size !== match.preservedAttachmentIds.length) {
    ctx.addIssue({ code: "custom", path: ["preservedAttachmentIds"], message: "Maksimal 3 lampiran unik" });
  }
  const newAttachmentBytes = match.attachments.filter((attachment) => attachment.id.startsWith("att-webp-")).reduce((sum, attachment) => {
    const base64 = attachment.dataUrl.split(",", 2)[1] ?? "";
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
    return sum + Math.floor((base64.length * 3) / 4) - padding;
  }, 0);
  if (newAttachmentBytes > MAX_NEW_ATTACHMENTS_TOTAL_BYTES) {
    ctx.addIssue({ code: "custom", path: ["attachments"], message: "Total ukuran screenshot baru maksimal 1,5 MiB" });
  }
  const rounds = match.scoreTeam + match.scoreOpponent;
  const teamFirstKills = match.playerStats.reduce((sum, row) => sum + row.firstKills, 0);
  const teamPlants = match.playerStats.reduce((sum, row) => sum + (row.plants ?? 0), 0);
  const teamDefuses = match.playerStats.reduce((sum, row) => sum + (row.defuses ?? 0), 0);
  if (teamFirstKills > rounds) ctx.addIssue({ code: "custom", path: ["playerStats"], message: "Total First Blood melebihi total ronde" });
  if (teamPlants > rounds) ctx.addIssue({ code: "custom", path: ["playerStats"], message: "Total plant melebihi total ronde" });
  if (match.opponentPlayerStats) {
    const enemyFirstKills = match.opponentPlayerStats.reduce((sum, row) => sum + row.firstKills, 0);
    const enemyPlants = match.opponentPlayerStats.reduce((sum, row) => sum + row.plants, 0);
    const enemyDefuses = match.opponentPlayerStats.reduce((sum, row) => sum + row.defuses, 0);
    if (enemyFirstKills > rounds) ctx.addIssue({ code: "custom", path: ["opponentPlayerStats"], message: "Total First Blood lawan melebihi total ronde" });
    if (enemyPlants > rounds) ctx.addIssue({ code: "custom", path: ["opponentPlayerStats"], message: "Total plant lawan melebihi total ronde" });
    if (teamDefuses > enemyPlants) ctx.addIssue({ code: "custom", path: ["playerStats"], message: "Defuse Team SC melebihi plant lawan" });
    if (enemyDefuses > teamPlants) ctx.addIssue({ code: "custom", path: ["opponentPlayerStats"], message: "Defuse lawan melebihi plant Team SC" });
    if (teamFirstKills + enemyFirstKills > rounds) ctx.addIssue({ code: "custom", path: ["playerStats"], message: "Total First Blood kedua tim melebihi total ronde" });
  }
});

export type MatchInput = z.infer<typeof matchSchema>;
export type PlayerStatInput = z.infer<typeof playerStatSchema>;
export type AttachmentInput = z.infer<typeof attachmentSchema>;
export type RoundItem = z.infer<typeof roundItemSchema>;
export function getMatchWarnings(match: Pick<MatchInput, "scoreTeam" | "scoreOpponent" | "playerStats" | "opponentPlayerStats">, language: "id" | "en" = "id") {
  const warnings: string[] = [];
  const winnerScore = Math.max(match.scoreTeam, match.scoreOpponent);
  const totalRounds = match.scoreTeam + match.scoreOpponent;
  const en = language === "en";
  // MR24 can legitimately end at any score totaling 24 (including 7–17).
  if (totalRounds < 24 && match.scoreTeam !== match.scoreOpponent && winnerScore !== 13) {
    warnings.push(en ? "The winning score is not 13." : "Skor pemenang bukan 13.");
  }
  if (totalRounds > 24 && Math.abs(match.scoreTeam - match.scoreOpponent) !== 2) {
    warnings.push(en ? "Overtime score margin is not 2 rounds." : "Margin skor overtime bukan 2 ronde.");
  }
  if (match.opponentPlayerStats) {
    const teamKills = match.playerStats.reduce((sum, row) => sum + row.kills, 0);
    const teamDeaths = match.playerStats.reduce((sum, row) => sum + row.deaths, 0);
    const enemyKills = match.opponentPlayerStats.reduce((sum, row) => sum + row.kills, 0);
    const enemyDeaths = match.opponentPlayerStats.reduce((sum, row) => sum + row.deaths, 0);
    if (teamKills !== enemyDeaths || enemyKills !== teamDeaths) warnings.push(en ? "Kills and deaths do not match between teams." : "Total kill dan death kedua tim tidak cocok.");
  }
  return warnings;
}
export const matchInputSchema = matchSchema;
export const createMatchSchema = matchSchema;
