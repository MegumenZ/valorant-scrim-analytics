import { z } from "zod";
import { VALORANT_MAPS } from "../data/valorant";

export const playerStatSchema = z.object({
  playerId: z.string().min(1, "Player ID wajib diisi"),
  agent: z.string().min(1, "Pilihan Agent wajib diisi"),
  acs: z.coerce.number().int().min(0, "ACS harus positif"),
  kills: z.coerce.number().int().min(0, "Kills harus positif"),
  deaths: z.coerce.number().int().min(0, "Deaths harus positif"),
  assists: z.coerce.number().int().min(0, "Assists harus positif"),
  adr: z.coerce.number().min(0, "ADR harus positif"),
  hsPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  firstKills: z.coerce.number().int().min(0).default(0),
  firstDeaths: z.coerce.number().int().min(0).default(0),
  clutchesWon: z.coerce.number().int().min(0).default(0),
  kastPercent: z.coerce.number().min(0).max(100).optional().nullable(),
});

export const matchSchema = z.object({
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  map: z.enum(VALORANT_MAPS),
  opponentName: z.string().min(1, "Nama tim lawan wajib diisi").max(50),
  scoreTeam: z.coerce.number().int().min(0, "Skor tim harus positif"),
  scoreOpponent: z.coerce.number().int().min(0, "Skor lawan harus positif"),
  startSide: z.enum(["ATTACK", "DEFENSE"]).default("ATTACK"),
  vodUrl: z.string().url("URL VOD tidak valid").optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  playerStats: z
    .array(playerStatSchema)
    .min(1, "Minimal 1 pemain")
    .max(5, "Maksimal 5 pemain")
    .refine(
      (stats) => {
        const ids = stats.map((s) => s.playerId).filter(Boolean);
        return new Set(ids).size === ids.length;
      },
      { message: "Terdapat duplikasi pemain dalam match ini" }
    ),
});

export type MatchInput = z.infer<typeof matchSchema>;
export type PlayerStatInput = z.infer<typeof playerStatSchema>;
