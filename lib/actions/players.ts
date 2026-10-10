"use server";

import { db, ensureDbInitialized } from "../db";
import { players, matchPlayerStats, matches, Player } from "../db/schema";
import { and, count, desc, eq, notExists, ne } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { playerSchema, PlayerInput } from "../validations/player";
import type { AgentStatSummary, PlayerAggregateStats } from "../utils/analytics";
import { getPlayerKdTrend, summarizeAgentPool, summarizePlayerScoreboard, type PlayerScoreboardRecord } from "../utils/scoreboard-analytics";
import { ActionResponse } from "../types/action";
import { canPermanentlyDeletePlayer, shouldApplyPlayerStatus } from "../utils/roster-behavior";
import { invalidateScrimReadCache } from "../utils/cache-invalidation";

const readAllPlayers = unstable_cache(async () => db.query.players.findMany({
  orderBy: [desc(players.isActive), desc(players.createdAt)],
}), ["all-players"], { tags: ["players"] });

export async function getAllPlayers(): Promise<Player[]> {
  await ensureDbInitialized();
  return readAllPlayers();
}

const readActiveRoster = unstable_cache(async () => db.query.players.findMany({
  where: eq(players.isActive, true),
  orderBy: [desc(players.createdAt)],
}), ["active-roster"], { tags: ["players"] });

export async function getActiveRoster(): Promise<Player[]> {
  await ensureDbInitialized();
  return readActiveRoster();
}

export type RosterPlayer = Player & { matchCount: number };

const readRosterPlayers = unstable_cache(async () => {
  const rows = await db
    .select({ player: players, matchCount: count(matchPlayerStats.id) })
    .from(players)
    .leftJoin(matchPlayerStats, eq(matchPlayerStats.playerId, players.id))
    .groupBy(players.id)
    .orderBy(desc(players.isActive), desc(players.createdAt));
  return rows.map(({ player, matchCount }) => ({ ...player, matchCount }));
}, ["roster-players"], { tags: ["players", "matches"] });

export async function getRosterPlayers(): Promise<RosterPlayer[]> {
  await ensureDbInitialized();
  return readRosterPlayers();
}

const readLatestMatchPlayerIds = unstable_cache(async () => {
  const latestMatch = await db.query.matches.findFirst({
    columns: { id: true },
    orderBy: [desc(matches.createdAt), desc(matches.matchDate)],
    with: { playerStats: { columns: { playerId: true } } },
  });
  return latestMatch?.playerStats.map((stat) => stat.playerId) ?? [];
}, ["latest-match-player-ids"], { tags: ["matches"] });

export async function getLatestMatchPlayerIds(): Promise<string[]> {
  await ensureDbInitialized();
  return readLatestMatchPlayerIds();
}

const readPlayerProfile = unstable_cache(async (id: string) => {
  const playerWithStats = await db.query.players.findFirst({
    where: eq(players.id, id),
    with: {
      stats: {
        columns: { agent: true, kills: true, deaths: true, assists: true, firstKills: true, plants: true, defuses: true },
        with: { match: { columns: { id: true, matchDate: true, map: true, opponentName: true, result: true, scoreTeam: true, scoreOpponent: true } } },
      },
    },
  });
  if (!playerWithStats) return null;
  const player = (({ stats: _stats, ...profile }) => profile)(playerWithStats);
  const rows: PlayerScoreboardRecord[] = playerWithStats.stats.map((row) => ({
    matchId: row.match.id,
    matchDate: row.match.matchDate,
    map: row.match.map,
    opponentName: row.match.opponentName,
    result: row.match.result,
    scoreTeam: row.match.scoreTeam,
    scoreOpponent: row.match.scoreOpponent,
    agent: row.agent,
    kills: row.kills,
    deaths: row.deaths,
    assists: row.assists,
    firstKills: row.firstKills ?? null,
    plants: row.plants ?? null,
    defuses: row.defuses ?? null,
  }));
  const summary = summarizePlayerScoreboard(rows);
  const recentMatches = [...rows]
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate) || b.matchId.localeCompare(a.matchId))
    .map((row) => ({ ...row, kdRatio: summarizePlayerScoreboard([row]).kdRatio }));
  return {
    player,
    stats: { player, ...summary },
    agentPool: summarizeAgentPool(rows),
    kdTrend: getPlayerKdTrend(rows),
    recentMatches,
  };
}, ["player-profile"], { tags: ["players", "matches"] });

export async function getPlayerProfile(id: string): Promise<{
  player: Player;
  stats: PlayerAggregateStats;
  agentPool: AgentStatSummary[];
  kdTrend: ReturnType<typeof getPlayerKdTrend>;
  recentMatches: Array<PlayerScoreboardRecord & { kdRatio: number }>;
} | null> {
  await ensureDbInitialized();
  return readPlayerProfile(id);
}

import { getCurrentUser, isDemoAccount } from "../auth/session";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || isDemoAccount(user.discordId) || (user.role !== "ADMIN" && user.role !== "COACH")) {
    throw new Error("Akses ditolak: Anda harus login sebagai Admin / IGL untuk melakukan aksi ini.");
  }
  return user;
}

export async function createPlayer(
  input: PlayerInput
): Promise<ActionResponse<{ id: string }> & { id?: string }> {
  await ensureDbInitialized();
  try {
    await requireAdmin();
  } catch (authErr: any) {
    return {
      success: false,
      error: authErr.message || "Akses ditolak.",
    };
  }

  const parsed = playerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi pemain gagal. Periksa kembali input Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validated = parsed.data;
  const id = createId();

  try {
    await db.insert(players).values({
      id,
      name: validated.name,
      riotId: validated.riotId || null,
      primaryRole: validated.primaryRole,
      discordId: validated.discordId || null,
      isActive: validated.isActive,
    });
  } catch (err) {
    console.error("[DATABASE_ERROR] Create player failed:", err);
    return {
      success: false,
      error: "Gagal menyimpan data pemain ke database.",
    };
  }

  invalidateScrimReadCache();
  revalidatePath("/roster");
  revalidatePath("/matches/new");
  revalidatePath("/");

  return { success: true, data: { id }, id };
}

export async function updatePlayer(
  id: string,
  input: PlayerInput
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

  const parsed = playerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi pemain gagal. Periksa kembali input Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validated = parsed.data;

  try {
    await db
      .update(players)
      .set({
        name: validated.name,
        riotId: validated.riotId || null,
        primaryRole: validated.primaryRole,
        discordId: validated.discordId || null,
      })
      .where(eq(players.id, id));
  } catch (err) {
    console.error("[DATABASE_ERROR] Update player failed:", err);
    return {
      success: false,
      error: "Gagal memperbarui data pemain di database.",
    };
  }

  invalidateScrimReadCache();
  revalidatePath("/roster");
  revalidatePath(`/players/${id}`);
  revalidatePath("/matches/new");
  revalidatePath("/");

  return { success: true, data: { id } };
}

export async function setPlayerActiveStatus(
  id: string,
  targetStatus: boolean
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

  try {
    if (typeof targetStatus !== "boolean") {
      return { success: false, error: "Status pemain tidak valid." };
    }
    const current = await db.query.players.findFirst({
      where: eq(players.id, id),
      columns: { id: true, isActive: true },
    });
    if (!current) return { success: false, error: "Pemain tidak ditemukan." };
    if (shouldApplyPlayerStatus(current.isActive, targetStatus)) {
      await db.update(players)
        .set({ isActive: targetStatus })
        .where(and(eq(players.id, id), ne(players.isActive, targetStatus)));
    }
  } catch (err) {
    console.error("[DATABASE_ERROR] Update player status failed:", err);
    return {
      success: false,
      error: "Gagal memperbarui status pemain.",
    };
  }

  invalidateScrimReadCache();
  revalidatePath("/roster");
  revalidatePath("/matches/new");
  revalidatePath("/");

  return { success: true, data: { id } };
}

export async function deletePlayer(
  id: string
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

  try {
    const deleted = await db.delete(players)
      .where(and(
        eq(players.id, id),
        notExists(db.select({ id: matchPlayerStats.id })
          .from(matchPlayerStats)
          .where(eq(matchPlayerStats.playerId, id))),
      ))
      .returning({ id: players.id });
    if (!deleted.length) {
      const playerExists = await db.query.players.findFirst({ where: eq(players.id, id), columns: { id: true } });
      if (!playerExists) return { success: false, error: "Pemain tidak ditemukan." };
      const statExists = await db.query.matchPlayerStats.findFirst({ where: eq(matchPlayerStats.playerId, id), columns: { id: true } });
      if (!canPermanentlyDeletePlayer(statExists ? 1 : 0)) {
        return { success: false, error: "Pemain memiliki riwayat match. Nonaktifkan pemain agar riwayat tetap utuh." };
      }
      return { success: false, error: "Pemain tidak dapat dihapus. Muat ulang roster lalu coba lagi." };
    }
  } catch (err) {
    console.error("[DATABASE_ERROR] Delete player failed:", err);
    return {
      success: false,
      error: "Gagal menghapus data pemain dari database.",
    };
  }

  invalidateScrimReadCache();
  revalidatePath("/roster");
  revalidatePath("/matches/new");
  revalidatePath("/matches");
  revalidatePath("/maps");
  revalidatePath("/");

  return { success: true, data: { id } };
}
