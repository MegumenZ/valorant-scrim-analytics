"use server";

import { client, db, ensureDbInitialized } from "../db";
import { matches, matchPlayerStats, opponentMatchPlayerStats, players, Match, Player, MatchPlayerStat, MatchAttachment, OpponentMatchPlayerStat } from "../db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { matchSchema, MatchInput, RoundItem, getMatchWarnings } from "../validations/match";
import { calculateMatchResult, DashboardSummary, MapAggregateStats } from "../utils/analytics";
import { RosterDashboardRow } from "../utils/dashboard-aggregates";
import { ActionResponse } from "../types/action";
import { resolveRoundTimelineForUpdate } from "../utils/match-timeline";
import { resolvePreservedAttachments } from "../utils/preserved-attachments";
import { hasMissingEventsForNewPlayers } from "../utils/match-edit-validation";
import { invalidateScrimReadCache } from "../utils/cache-invalidation";
import { DASHBOARD_AGGREGATE_SQL, MAP_AGGREGATE_SQL, includeEmptyMaps, mapDashboardAggregateRows, mapMapAggregateRows } from "../utils/sql-analytics";

export interface MatchWithStats extends Omit<Match, "attachments"> {
  attachments?: string | null;
  playerStats: Array<MatchPlayerStat & { player: Player }>;
  opponentPlayerStats?: OpponentMatchPlayerStat[];
  parsedAttachments?: MatchAttachment[];
  parsedRoundTimeline?: RoundItem[];
}

export type DashboardRecentMatch = Pick<Match, "id" | "matchDate" | "map" | "opponentName" | "scoreTeam" | "scoreOpponent" | "result"> & {
  playerStats: Array<MatchPlayerStat & { player: Player }>;
};

type DashboardPeriod = "7d" | "30d" | "all";

function getDashboardCutoff(period: DashboardPeriod): string | null {
  if (period === "all") return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const cutoff = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
  cutoff.setUTCDate(cutoff.getUTCDate() - (period === "7d" ? 6 : 29));
  return cutoff.toISOString().slice(0, 10);
}

const readDashboardSummary = unstable_cache(async (cutoff: string | null) => {
  const aggregateResult = await client.execute({ sql: DASHBOARD_AGGREGATE_SQL, args: [cutoff, cutoff] });
  const { summary, leaderboard } = mapDashboardAggregateRows(aggregateResult.rows as unknown as Array<Record<string, unknown>>);
  const recentMatches = await db.query.matches.findMany({
    columns: {
      id: true, matchDate: true, map: true, opponentName: true, scoreTeam: true,
      scoreOpponent: true, result: true, attachments: false, roundTimeline: false,
    },
    where: cutoff ? gte(matches.matchDate, cutoff) : undefined,
    orderBy: [desc(matches.matchDate), desc(matches.createdAt)],
    limit: 10,
    with: {
      playerStats: {
        columns: { id: true, matchId: true, playerId: true, agent: true, acs: true, kills: true, deaths: true, assists: true },
        with: { player: { columns: { id: true, name: true, riotId: true, primaryRole: true, discordId: true, isActive: true, createdAt: true } } },
      },
    },
  }) as DashboardRecentMatch[];
  return { summary, recentMatches, leaderboard };
}, ["dashboard-summary-by-period"], { tags: ["matches", "players"] });

export async function getDashboardSummary(period: DashboardPeriod = "all"): Promise<{
  summary: DashboardSummary;
  recentMatches: DashboardRecentMatch[];
  leaderboard: RosterDashboardRow[];
}> {
  await ensureDbInitialized();
  return readDashboardSummary(getDashboardCutoff(period));
}

const readAllMatches = unstable_cache(async (params?: { map?: string; result?: string; opponent?: string }) => {
  const conditions = [];
  if (params?.map && params.map !== "ALL") conditions.push(eq(matches.map, params.map as typeof matches.$inferSelect.map));
  if (params?.result && params.result !== "ALL") conditions.push(eq(matches.result, params.result as typeof matches.$inferSelect.result));
  if (params?.opponent) conditions.push(sql`instr(lower(${matches.opponentName}), lower(${params.opponent})) > 0`);
  const all = await db.query.matches.findMany({
    columns: {
      id: true, matchDate: true, map: true, opponentName: true, scoreTeam: true,
      scoreOpponent: true, result: true, startSide: true, vodUrl: true, notes: true,
      createdAt: true, attachments: false, roundTimeline: false,
    },
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(matches.matchDate), desc(matches.createdAt)],
    with: {
      playerStats: {
        columns: {
          id: true, matchId: true, playerId: true, agent: true, acs: true, kills: true,
          deaths: true, assists: true, adr: true, hsPercent: true, firstKills: true,
          firstDeaths: true, clutchesWon: true, kastPercent: true, plants: true, defuses: true,
        },
        with: { player: { columns: { id: true, name: true, riotId: true, primaryRole: true, discordId: true, isActive: true, createdAt: true } } },
      },
    },
  });
  return all.map((m) => ({ ...m, playerStats: [...m.playerStats].sort((a, b) => (b.acs ?? -1) - (a.acs ?? -1)) })) as unknown as MatchWithStats[];
}, ["match-history"], { tags: ["matches", "players"] });

export async function getAllMatches(params?: {
  map?: string;
  result?: string;
  opponent?: string;
}): Promise<MatchWithStats[]> {
  await ensureDbInitialized();
  return readAllMatches(params);
}

const readMatchById = unstable_cache(async (id: string) => {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    columns: {
      id: true, matchDate: true, map: true, opponentName: true, scoreTeam: true, scoreOpponent: true,
      result: true, startSide: true, vodUrl: true, notes: true, attachments: true,
      roundTimeline: true, createdAt: true,
    },
    with: {
      playerStats: {
        columns: {
          id: true, matchId: true, playerId: true, agent: true, acs: true, kills: true,
          deaths: true, assists: true, adr: true, hsPercent: true, firstKills: true,
          firstDeaths: true, clutchesWon: true, kastPercent: true, plants: true, defuses: true,
        },
        with: { player: { columns: { id: true, name: true } } },
      },
      opponentPlayerStats: {
        columns: { id: true, matchId: true, displayName: true, agent: true, kills: true, deaths: true, assists: true, firstKills: true, plants: true, defuses: true },
      },
    },
  });
  if (!match) return null;
  let parsedAttachments: MatchAttachment[] = [];
  if (match.attachments) {
    try { parsedAttachments = JSON.parse(match.attachments); }
    catch (err) { console.error("Failed to parse attachments JSON:", err); }
  }
  let parsedRoundTimeline: RoundItem[] = [];
  if (match.roundTimeline) {
    try { parsedRoundTimeline = JSON.parse(match.roundTimeline); }
    catch (err) { console.error("Failed to parse roundTimeline JSON:", err); }
  }
  return {
    ...match,
    parsedAttachments,
    parsedRoundTimeline,
    playerStats: [...match.playerStats].sort((a, b) => (b.acs ?? -1) - (a.acs ?? -1)),
  } as unknown as MatchWithStats;
}, ["match-detail"], { tags: ["matches", "players"] });

export async function getMatchById(id: string): Promise<MatchWithStats | null> {
  await ensureDbInitialized();
  return readMatchById(id);
}

import { getCurrentUser, isDemoAccount } from "../auth/session";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || isDemoAccount(user.discordId) || (user.role !== "ADMIN" && user.role !== "COACH")) {
    throw new Error("Akses ditolak: Anda harus login sebagai Admin / IGL untuk melakukan aksi ini.");
  }
  return user;
}

function revalidateMatchData(matchId?: string) {
  invalidateScrimReadCache();
  revalidatePath("/");
  revalidatePath("/matches");
  if (matchId) revalidatePath(`/matches/${matchId}`);
  revalidatePath("/maps");
  revalidatePath("/roster");
}

export async function createMatchAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  await ensureDbInitialized();
  try {
    await requireAdmin();
  } catch (authErr: any) {
    return {
      success: false,
      error: authErr.message || "Akses ditolak.",
    };
  }

  // 1. Validasi Zod tanpa throw exception fatal
  const parsed = matchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi form gagal. Periksa kembali input Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validated = parsed.data;
  if (validated.preservedAttachmentIds.length > 0 || validated.attachments.some((attachment) => !attachment.id.startsWith("att-webp-"))) {
    return { success: false, error: "Lampiran baru wajib berupa screenshot WebP yang telah dikompresi." };
  }
  if (!validated.idempotencyKey) {
    return { success: false, error: "Kunci pengiriman tidak valid. Muat ulang form lalu coba lagi." };
  }
  const warnings = getMatchWarnings(validated);
  if (warnings.length && !validated.confirmWarnings) {
    return { success: false, error: "Konfirmasi diperlukan sebelum menyimpan skor/statistik yang tidak biasa.", confirmationRequired: true, warnings };
  }
  const existingPlayers = await db.query.players.findMany({ columns: { id: true } });
  const knownPlayerIds = new Set(existingPlayers.map((player) => player.id));
  if (validated.playerStats.some((stat) => !knownPlayerIds.has(stat.playerId))) {
    return { success: false, error: "Pemain tidak ditemukan pada roster." };
  }
  if (validated.playerStats.some((stat) => stat.plants == null || stat.defuses == null)) {
    return { success: false, error: "Plants dan defuses wajib diisi untuk scoreboard baru." };
  }
  const priorSubmission = await db.query.matches.findFirst({
    where: eq(matches.idempotencyKey, validated.idempotencyKey),
    columns: { id: true },
  });
  if (priorSubmission) {
    revalidateMatchData(priorSubmission.id);
    return { success: true, data: { id: priorSubmission.id } };
  }
  const matchId = createId();
  const result = calculateMatchResult(validated.scoreTeam, validated.scoreOpponent);

  // 2. Eksekusi Atomic Batch Insert ke Turso (1 Single HTTP Roundtrip)
  try {
    await db.batch([
      // Insert Match Entity
      db.insert(matches).values({
        id: matchId,
        matchDate: validated.matchDate,
        map: validated.map,
        opponentName: validated.opponentName,
        scoreTeam: validated.scoreTeam,
        scoreOpponent: validated.scoreOpponent,
        result,
        startSide: validated.startSide,
        vodUrl: validated.vodUrl || null,
        notes: validated.notes || null,
        attachments: validated.attachments && validated.attachments.length > 0
          ? JSON.stringify(validated.attachments)
          : null,
        roundTimeline: validated.roundsTimeline && validated.roundsTimeline.length > 0
          ? JSON.stringify(validated.roundsTimeline)
          : null,
        idempotencyKey: validated.idempotencyKey,
      }),
      // Insert Player Stats via .map()
      ...validated.playerStats.map((stat) =>
        db.insert(matchPlayerStats).values({
          id: createId(),
          matchId,
          playerId: stat.playerId,
          agent: stat.agent,
          acs: stat.acs,
          kills: stat.kills,
          deaths: stat.deaths,
          assists: stat.assists,
          adr: stat.adr,
          hsPercent: stat.hsPercent ?? null,
          firstKills: stat.firstKills ?? 0,
          firstDeaths: stat.firstDeaths,
          clutchesWon: stat.clutchesWon,
          kastPercent: stat.kastPercent ?? null,
          plants: stat.plants,
          defuses: stat.defuses,
        })
      ),
      ...(validated.opponentPlayerStats ?? []).map((stat) => db.insert(opponentMatchPlayerStats).values({ id: createId(), matchId, ...stat })),
    ]);
  } catch (err) {
    // Concurrent retries can collide on the unique idempotency key after one commits.
    const committedRetry = await db.query.matches.findFirst({
      where: eq(matches.idempotencyKey, validated.idempotencyKey),
      columns: { id: true },
    }).catch(() => undefined);
    if (committedRetry) {
      revalidateMatchData(committedRetry.id);
      return { success: true, data: { id: committedRetry.id } };
    }
    console.error("[DATABASE_ERROR] Batch insert match failed:", err);
    return {
      success: false,
      error: "Terjadi kegagalan saat menyimpan data match ke database. Silakan coba lagi.",
    };
  }

  // 3. Invalidate Cache Analitik & Paths
  revalidateMatchData(matchId);

  return {
    success: true,
    data: { id: matchId },
  };
}

export async function createMatch(
  input: MatchInput
): Promise<ActionResponse<{ id: string }> & { matchId?: string }> {
  const res = await createMatchAction(input);
  if (res.success) {
    return {
      ...res,
      matchId: res.data.id,
    };
  }
  return res;
}

export async function updateMatch(
  id: string,
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  await ensureDbInitialized();
  try {
    await requireAdmin();
  } catch (authErr: any) {
    return {
      success: false,
      error: authErr.message || "Akses ditolak.",
    };
  }

  const parsed = matchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi form gagal. Periksa kembali input Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validated = parsed.data;
  if (validated.attachments.some((attachment) => !attachment.id.startsWith("att-webp-"))) {
    return { success: false, error: "Unggahan baru wajib berupa screenshot WebP yang telah dikompresi." };
  }
  const warnings = getMatchWarnings(validated);
  if (warnings.length && !validated.confirmWarnings) {
    return { success: false, error: "Konfirmasi diperlukan sebelum menyimpan skor/statistik yang tidak biasa.", confirmationRequired: true, warnings };
  }
  const existingPlayers = await db.query.players.findMany({ columns: { id: true } });
  const knownPlayerIds = new Set(existingPlayers.map((player) => player.id));
  if (validated.playerStats.some((stat) => !knownPlayerIds.has(stat.playerId))) {
    return { success: false, error: "Pemain tidak ditemukan pada roster." };
  }

  const existingMatch = await db.query.matches.findFirst({
    // Attachments are stored in the match JSON column, so this query scopes IDs to the edited match.
    where: eq(matches.id, id),
    columns: { id: true, roundTimeline: true, attachments: true },
    with: { playerStats: { columns: { playerId: true, plants: true, defuses: true } } },
  });
  if (!existingMatch) return { success: false, error: "Match tidak ditemukan." };
  const previousScoreboardStats = new Map(existingMatch.playerStats.map((stat) => [stat.playerId, stat]));
  if (hasMissingEventsForNewPlayers(validated.playerStats, new Set(previousScoreboardStats.keys()))) {
    return { success: false, error: "Plants dan defuses wajib diisi untuk pemain baru pada scoreboard." };
  }
  let existingAttachments: unknown[] = [];
  try {
    existingAttachments = existingMatch.attachments ? JSON.parse(existingMatch.attachments) : [];
  } catch (error) {
    console.error("[MATCH_ATTACHMENT] Failed to parse existing attachments:", error);
    return { success: false, error: "Lampiran match lama tidak dapat dibaca; perubahan belum disimpan." };
  }
  const preserved = resolvePreservedAttachments(existingAttachments, validated.preservedAttachmentIds);
  if (!preserved.success) {
    return { success: false, error: preserved.error };
  }
  const attachmentsToSave = [
    ...preserved.attachments,
    ...validated.attachments,
  ];
  const preservedTimeline = resolveRoundTimelineForUpdate(validated.roundsTimeline, existingMatch.roundTimeline);
  const result = calculateMatchResult(validated.scoreTeam, validated.scoreOpponent);

  try {
    await db.batch([
      db
        .update(matches)
        .set({
          matchDate: validated.matchDate,
          map: validated.map,
          opponentName: validated.opponentName,
          scoreTeam: validated.scoreTeam,
          scoreOpponent: validated.scoreOpponent,
          result,
          startSide: validated.startSide,
          vodUrl: validated.vodUrl || null,
          notes: validated.notes || null,
          attachments: attachmentsToSave.length > 0
            ? JSON.stringify(attachmentsToSave)
            : null,
          roundTimeline: preservedTimeline,
        })
        .where(eq(matches.id, id)),
      db.delete(matchPlayerStats).where(eq(matchPlayerStats.matchId, id)),
      db.delete(opponentMatchPlayerStats).where(eq(opponentMatchPlayerStats.matchId, id)),
      ...validated.playerStats.map((stat) =>
        db.insert(matchPlayerStats).values({
          id: createId(),
          matchId: id,
          playerId: stat.playerId,
          agent: stat.agent,
          acs: stat.acs,
          kills: stat.kills,
          deaths: stat.deaths,
          assists: stat.assists,
          adr: stat.adr,
          hsPercent: stat.hsPercent ?? null,
          firstKills: stat.firstKills ?? 0,
          firstDeaths: stat.firstDeaths,
          clutchesWon: stat.clutchesWon,
          kastPercent: stat.kastPercent ?? null,
          plants: stat.plants ?? previousScoreboardStats.get(stat.playerId)?.plants ?? null,
          defuses: stat.defuses ?? previousScoreboardStats.get(stat.playerId)?.defuses ?? null,
        })
      ),
      ...(validated.opponentPlayerStats ?? []).map((stat) => db.insert(opponentMatchPlayerStats).values({ id: createId(), matchId: id, ...stat })),
    ]);
  } catch (err) {
    console.error("[DATABASE_ERROR] Batch update match failed:", err);
    return {
      success: false,
      error: "Terjadi kegagalan saat memperbarui data match di database. Silakan coba lagi.",
    };
  }

  revalidateMatchData(id);

  return {
    success: true,
    data: { id },
  };
}

export async function deleteMatch(id: string): Promise<ActionResponse<{ id: string }>> {
  await ensureDbInitialized();
  try {
    await requireAdmin();
  } catch (authErr: any) {
    return {
      success: false,
      error: authErr.message || "Akses ditolak.",
    };
  }

  try {
    await db.delete(matches).where(eq(matches.id, id));
  } catch (err) {
    console.error("[DATABASE_ERROR] Delete match failed:", err);
    return {
      success: false,
      error: "Terjadi kegagalan saat menghapus data match dari database.",
    };
  }

  revalidateMatchData(id);

  return { success: true, data: { id } };
}

export async function getMapAnalyticsData(): Promise<MapAggregateStats[]> {
  await ensureDbInitialized();
  return readMapAnalytics();
}

const readMapAnalytics = unstable_cache(async () => {
  const result = await client.execute(MAP_AGGREGATE_SQL);
  return includeEmptyMaps(mapMapAggregateRows(result.rows as unknown as Array<Record<string, unknown>>));
}, ["map-analytics"], { tags: ["matches"] });
