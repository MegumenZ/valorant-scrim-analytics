"use server";

import { db, ensureDbInitialized } from "../db";
import { players, matchPlayerStats, matches, Player, MatchPlayerStat } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { playerSchema, PlayerInput } from "../validations/player";
import { calculateKD, calculateOpeningDuelRatio, AgentStatSummary, PlayerAggregateStats } from "../utils/analytics";

export async function getAllPlayers(): Promise<Player[]> {
  await ensureDbInitialized();
  return db.query.players.findMany({
    orderBy: [desc(players.isActive), desc(players.createdAt)],
  });
}

export async function getActiveRoster(): Promise<Player[]> {
  await ensureDbInitialized();
  return db.query.players.findMany({
    where: eq(players.isActive, true),
    orderBy: [desc(players.createdAt)],
  });
}

export async function getPlayerProfile(id: string): Promise<{
  player: Player;
  stats: PlayerAggregateStats;
  agentPool: AgentStatSummary[];
  recentMatches: Array<{
    matchId: string;
    matchDate: string;
    map: string;
    opponentName: string;
    scoreTeam: number;
    scoreOpponent: number;
    result: string;
    agent: string;
    acs: number;
    kills: number;
    deaths: number;
    assists: number;
    adr: number;
    hsPercent: number | null;
    kdRatio: number;
    firstKills: number;
    firstDeaths: number;
    clutchesWon: number;
  }>;
} | null> {
  await ensureDbInitialized();

  const player = await db.query.players.findFirst({
    where: eq(players.id, id),
  });

  if (!player) return null;

  // Fetch all match stats for this player
  const playerStatsRows = await db.query.matchPlayerStats.findMany({
    where: eq(matchPlayerStats.playerId, id),
    with: {
      match: true,
    },
  });

  let totalAcs = 0;
  let totalAdr = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let hsSum = 0;
  let hsCount = 0;
  let firstKills = 0;
  let firstDeaths = 0;
  let clutchesWon = 0;
  let kastSum = 0;
  let kastCount = 0;

  const agentMap = new Map<string, {
    agent: string;
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    totalAcs: number;
    totalAdr: number;
    totalKills: number;
    totalDeaths: number;
  }>();

  const recentMatches: Array<any> = [];

  for (const row of playerStatsRows) {
    totalAcs += row.acs;
    totalAdr += row.adr;
    totalKills += row.kills;
    totalDeaths += row.deaths;
    totalAssists += row.assists;

    if (row.hsPercent != null) {
      hsSum += row.hsPercent;
      hsCount++;
    }
    if (row.kastPercent != null) {
      kastSum += row.kastPercent;
      kastCount++;
    }

    firstKills += row.firstKills;
    firstDeaths += row.firstDeaths;
    clutchesWon += row.clutchesWon;

    // Agent pool aggregation
    const curAgent = agentMap.get(row.agent) || {
      agent: row.agent,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalAcs: 0,
      totalAdr: 0,
      totalKills: 0,
      totalDeaths: 0,
    };

    curAgent.matchesPlayed++;
    if (row.match.result === "WIN") curAgent.wins++;
    else if (row.match.result === "LOSS") curAgent.losses++;
    else curAgent.draws++;

    curAgent.totalAcs += row.acs;
    curAgent.totalAdr += row.adr;
    curAgent.totalKills += row.kills;
    curAgent.totalDeaths += row.deaths;
    agentMap.set(row.agent, curAgent);

    recentMatches.push({
      matchId: row.match.id,
      matchDate: row.match.matchDate,
      map: row.match.map,
      opponentName: row.match.opponentName,
      scoreTeam: row.match.scoreTeam,
      scoreOpponent: row.match.scoreOpponent,
      result: row.match.result,
      agent: row.agent,
      acs: row.acs,
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      adr: row.adr,
      hsPercent: row.hsPercent,
      kdRatio: calculateKD(row.kills, row.deaths),
      firstKills: row.firstKills,
      firstDeaths: row.firstDeaths,
      clutchesWon: row.clutchesWon,
    });
  }

  // Sort matches by date descending
  recentMatches.sort((a, b) => (a.matchDate < b.matchDate ? 1 : -1));

  const matchesPlayed = playerStatsRows.length;
  const stats: PlayerAggregateStats = {
    player,
    matchesPlayed,
    avgAcs: matchesPlayed > 0 ? Number((totalAcs / matchesPlayed).toFixed(1)) : 0,
    avgAdr: matchesPlayed > 0 ? Number((totalAdr / matchesPlayed).toFixed(1)) : 0,
    kdRatio: calculateKD(totalKills, totalDeaths),
    avgHsPercent: hsCount > 0 ? Number((hsSum / hsCount).toFixed(1)) : 0,
    totalKills,
    totalDeaths,
    totalAssists,
    firstKills,
    firstDeaths,
    odr: calculateOpeningDuelRatio(firstKills, firstDeaths),
    clutchesWon,
    avgKastPercent: kastCount > 0 ? Number((kastSum / kastCount).toFixed(1)) : 0,
  };

  const agentPool: AgentStatSummary[] = Array.from(agentMap.values()).map((a) => ({
    agent: a.agent,
    matchesPlayed: a.matchesPlayed,
    wins: a.wins,
    losses: a.losses,
    draws: a.draws,
    winRate: Number(((a.wins / a.matchesPlayed) * 100).toFixed(1)),
    avgAcs: Number((a.totalAcs / a.matchesPlayed).toFixed(1)),
    avgAdr: Number((a.totalAdr / a.matchesPlayed).toFixed(1)),
    kdRatio: calculateKD(a.totalKills, a.totalDeaths),
    totalKills: a.totalKills,
    totalDeaths: a.totalDeaths,
  })).sort((a, b) => b.matchesPlayed - a.matchesPlayed);

  return {
    player,
    stats,
    agentPool,
    recentMatches,
  };
}

import { getCurrentUser } from "../auth/session";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    throw new Error("Akses ditolak: Anda harus login sebagai Admin / IGL untuk melakukan aksi ini.");
  }
  return user;
}

export async function createPlayer(input: PlayerInput) {
  await ensureDbInitialized();
  await requireAdmin();

  const validated = playerSchema.parse(input);
  const id = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(players).values({
    id,
    name: validated.name,
    riotId: validated.riotId || null,
    primaryRole: validated.primaryRole,
    discordId: validated.discordId || null,
    isActive: validated.isActive,
  });

  revalidatePath("/roster");
  revalidatePath("/matches/new");
  revalidatePath("/");

  return { success: true, id };
}

export async function updatePlayer(id: string, input: PlayerInput) {
  await ensureDbInitialized();
  await requireAdmin();

  const validated = playerSchema.parse(input);

  await db
    .update(players)
    .set({
      name: validated.name,
      riotId: validated.riotId || null,
      primaryRole: validated.primaryRole,
      discordId: validated.discordId || null,
      isActive: validated.isActive,
    })
    .where(eq(players.id, id));

  revalidatePath("/roster");
  revalidatePath(`/players/${id}`);
  revalidatePath("/matches/new");
  revalidatePath("/");

  return { success: true };
}

export async function togglePlayerActive(id: string, currentStatus: boolean) {
  await ensureDbInitialized();
  await requireAdmin();

  await db
    .update(players)
    .set({ isActive: !currentStatus })
    .where(eq(players.id, id));

  revalidatePath("/roster");
  revalidatePath("/matches/new");
  revalidatePath("/");

  return { success: true };
}

export async function deletePlayer(id: string) {
  await ensureDbInitialized();
  await requireAdmin();

  // Delete any associated player stats first to maintain DB integrity
  await db.delete(matchPlayerStats).where(eq(matchPlayerStats.playerId, id));
  await db.delete(players).where(eq(players.id, id));

  revalidatePath("/roster");
  revalidatePath("/matches/new");
  revalidatePath("/matches");
  revalidatePath("/maps");
  revalidatePath("/");

  return { success: true };
}
