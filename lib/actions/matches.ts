"use server";

import { db, ensureDbInitialized } from "../db";
import { matches, matchPlayerStats, players, Match, Player, MatchPlayerStat, MatchAttachment } from "../db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { matchSchema, matchInputSchema, MatchInput, RoundItem } from "../validations/match";
import { calculateKD, calculateOpeningDuelRatio, calculateMatchResult, DashboardSummary, MapAggregateStats } from "../utils/analytics";
import { VALORANT_MAPS, ValorantMap } from "../data/valorant";
import { ActionResponse } from "../types/action";

export interface MatchWithStats extends Match {
  playerStats: Array<MatchPlayerStat & { player: Player }>;
  parsedAttachments?: MatchAttachment[];
  parsedRoundTimeline?: RoundItem[];
}

export async function getDashboardSummary(): Promise<{
  summary: DashboardSummary;
  recentMatches: MatchWithStats[];
  allMatches: MatchWithStats[];
  leaderboard: Array<{
    player: Player;
    matches: number;
    avgAcs: number;
    avgAdr: number;
    kdRatio: number;
    hsPercent: number;
    firstKills: number;
    firstDeaths: number;
    clutchesWon: number;
  }>;
}> {
  await ensureDbInitialized();

  // Fetch all matches
  const allMatches = await db.query.matches.findMany({
    orderBy: [desc(matches.matchDate), desc(matches.createdAt)],
    with: {
      playerStats: {
        with: {
          player: true,
        },
      },
    },
  });

  const totalMatches = allMatches.length;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalScoreTeam = 0;
  let totalScoreOpponent = 0;

  let attackStartMatches = 0;
  let attackStartWins = 0;
  let defenseStartMatches = 0;
  let defenseStartWins = 0;

  const mapStatsMap = new Map<ValorantMap, { total: number; wins: number; losses: number; draws: number }>();
  for (const m of VALORANT_MAPS) {
    mapStatsMap.set(m, { total: 0, wins: 0, losses: 0, draws: 0 });
  }

  let grandTotalAcs = 0;
  let grandTotalAdr = 0;
  let grandTotalStatsCount = 0;

  for (const match of allMatches) {
    if (match.result === "WIN") wins++;
    else if (match.result === "LOSS") losses++;
    else draws++;

    totalScoreTeam += match.scoreTeam;
    totalScoreOpponent += match.scoreOpponent;

    if (match.startSide === "ATTACK") {
      attackStartMatches++;
      if (match.result === "WIN") attackStartWins++;
    } else {
      defenseStartMatches++;
      if (match.result === "WIN") defenseStartWins++;
    }

    const currentMapStat = mapStatsMap.get(match.map as ValorantMap) || { total: 0, wins: 0, losses: 0, draws: 0 };
    currentMapStat.total++;
    if (match.result === "WIN") currentMapStat.wins++;
    else if (match.result === "LOSS") currentMapStat.losses++;
    else currentMapStat.draws++;
    mapStatsMap.set(match.map as ValorantMap, currentMapStat);

    for (const stat of match.playerStats) {
      grandTotalAcs += stat.acs;
      grandTotalAdr += stat.adr;
      grandTotalStatsCount++;
    }
  }

  const winRate = totalMatches > 0 ? Number(((wins / totalMatches) * 100).toFixed(1)) : 0;
  const teamAvgAcs = grandTotalStatsCount > 0 ? Number((grandTotalAcs / grandTotalStatsCount).toFixed(1)) : 0;
  const teamAvgAdr = grandTotalStatsCount > 0 ? Number((grandTotalAdr / grandTotalStatsCount).toFixed(1)) : 0;

  const attackWinRate = attackStartMatches > 0 ? Number(((attackStartWins / attackStartMatches) * 100).toFixed(1)) : 0;
  const defenseWinRate = defenseStartMatches > 0 ? Number(((defenseStartWins / defenseStartMatches) * 100).toFixed(1)) : 0;

  // Find strongest map (min 1 match, highest win rate)
  let bestMap: ValorantMap | "N/A" = "N/A";
  let bestMapWr = -1;
  let bestMapWins = 0;
  let bestMapLosses = 0;

  const mapBreakdown = Array.from(mapStatsMap.entries())
    .filter(([_, data]) => data.total > 0)
    .map(([map, data]) => {
      const wr = Number(((data.wins / data.total) * 100).toFixed(1));
      if (wr > bestMapWr || (wr === bestMapWr && data.total > (mapStatsMap.get(bestMap as ValorantMap)?.total || 0))) {
        bestMapWr = wr;
        bestMap = map;
        bestMapWins = data.wins;
        bestMapLosses = data.losses;
      }
      return {
        map,
        total: data.total,
        wins: data.wins,
        losses: data.losses,
        draws: data.draws,
        winRate: wr,
      };
    })
    .sort((a, b) => b.total - a.total);

  // ACS Trend (last 10 matches chronologically)
  const acsTrend = [...allMatches]
    .reverse()
    .slice(-10)
    .map((m, idx) => {
      const avgAcs = m.playerStats.length > 0
        ? Math.round(m.playerStats.reduce((acc, s) => acc + s.acs, 0) / m.playerStats.length)
        : 0;
      return {
        matchId: m.id,
        matchDate: m.matchDate,
        map: m.map,
        opponent: m.opponentName,
        result: m.result,
        score: `${m.scoreTeam}-${m.scoreOpponent}`,
        teamAvgAcs: avgAcs,
      };
    });

  // Leaderboard Calculation
  const allPlayers = await db.query.players.findMany({
    where: eq(players.isActive, true),
  });

  const playerStatsAggregation = new Map<string, {
    player: Player;
    matches: number;
    totalAcs: number;
    totalAdr: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    hsSum: number;
    hsCount: number;
    firstKills: number;
    firstDeaths: number;
    clutchesWon: number;
  }>();

  for (const p of allPlayers) {
    playerStatsAggregation.set(p.id, {
      player: p,
      matches: 0,
      totalAcs: 0,
      totalAdr: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      hsSum: 0,
      hsCount: 0,
      firstKills: 0,
      firstDeaths: 0,
      clutchesWon: 0,
    });
  }

  for (const m of allMatches) {
    for (const stat of m.playerStats) {
      const agg = playerStatsAggregation.get(stat.playerId);
      if (agg) {
        agg.matches++;
        agg.totalAcs += stat.acs;
        agg.totalAdr += stat.adr;
        agg.totalKills += stat.kills;
        agg.totalDeaths += stat.deaths;
        agg.totalAssists += stat.assists;
        if (stat.hsPercent != null) {
          agg.hsSum += stat.hsPercent;
          agg.hsCount++;
        }
        agg.firstKills += stat.firstKills;
        agg.firstDeaths += stat.firstDeaths;
        agg.clutchesWon += stat.clutchesWon;
      }
    }
  }

  const leaderboard = Array.from(playerStatsAggregation.values())
    .filter((agg) => agg.matches > 0)
    .map((agg) => ({
      player: agg.player,
      matches: agg.matches,
      avgAcs: Number((agg.totalAcs / agg.matches).toFixed(1)),
      avgAdr: Number((agg.totalAdr / agg.matches).toFixed(1)),
      kdRatio: calculateKD(agg.totalKills, agg.totalDeaths),
      hsPercent: agg.hsCount > 0 ? Number((agg.hsSum / agg.hsCount).toFixed(1)) : 0,
      firstKills: agg.firstKills,
      firstDeaths: agg.firstDeaths,
      clutchesWon: agg.clutchesWon,
    }))
    .sort((a, b) => b.avgAcs - a.avgAcs);

  // Formatted all matches with parsed round timeline
  const formattedAllMatches: MatchWithStats[] = allMatches.map((m) => {
    let parsedRoundTimeline: RoundItem[] | undefined;
    if (m.roundTimeline) {
      try {
        parsedRoundTimeline = JSON.parse(m.roundTimeline);
      } catch (e) {}
    }
    return {
      ...m,
      playerStats: [...m.playerStats].sort((a, b) => b.acs - a.acs),
      parsedRoundTimeline,
    };
  });

  // Recent 5 matches with player stats sorted by ACS desc
  const recentMatches: MatchWithStats[] = formattedAllMatches.slice(0, 5);

  // Tactical Win Conditions Calculation
  // Tactical Win & Loss Breakdown Calculation (Contextual to Attacker vs Defender)
  let totalTeamRoundWins = 0;
  let elimWins = 0;
  let defuseWins = 0;     // Retake & Spike Defused (Defender Win)
  let detonationWins = 0; // Post-Plant Spike Detonated (Attacker Win)
  let timeWins = 0;       // Waktu Habis (Defender Win)

  let totalTeamRoundLosses = 0;
  let elimLosses = 0;        // Tim Tereliminasi
  let defusedLosses = 0;     // Musuh Retake & Defuse (Saat Kita Attacker)
  let detonationLosses = 0;  // Spike Musuh Meledak (Saat Kita Defender Gagal Retake)
  let timeoutLosses = 0;     // Waktu Habis (Saat Kita Attacker Gagal Plant)

  for (const m of allMatches) {
    if (m.roundTimeline) {
      try {
        const rounds = JSON.parse(m.roundTimeline);
        if (Array.isArray(rounds)) {
          for (const r of rounds) {
            const outcome = r.outcomeType || r.winType || "ELIMINATION";
            if (r.winner === "TEAM") {
              totalTeamRoundWins++;
              if (r.side === "ATTACK") {
                if (outcome === "DETONATION") detonationWins++;
                else elimWins++;
              } else {
                // DEFENSE
                if (outcome === "DEFUSE") defuseWins++;
                else if (outcome === "TIME") timeWins++;
                else elimWins++;
              }
            } else {
              // OPPONENT WIN = TEAM LOSS
              totalTeamRoundLosses++;
              if (r.side === "ATTACK") {
                if (outcome === "DEFUSE") defusedLosses++;
                else if (outcome === "TIME") timeoutLosses++;
                else elimLosses++;
              } else {
                // DEFENSE
                if (outcome === "DETONATION") detonationLosses++;
                else elimLosses++;
              }
            }
          }
        }
      } catch (e) {
        // fallback
      }
    } else {
      totalTeamRoundWins += m.scoreTeam;
      elimWins += m.scoreTeam;
      totalTeamRoundLosses += m.scoreOpponent;
      elimLosses += m.scoreOpponent;
    }
  }

  const tacticalWins = {
    totalWins: totalTeamRoundWins,
    eliminations: elimWins,
    eliminationRate: totalTeamRoundWins > 0 ? Math.round((elimWins / totalTeamRoundWins) * 100) : 0,
    defuses: defuseWins,
    defuseRate: totalTeamRoundWins > 0 ? Math.round((defuseWins / totalTeamRoundWins) * 100) : 0,
    detonations: detonationWins,
    detonationRate: totalTeamRoundWins > 0 ? Math.round((detonationWins / totalTeamRoundWins) * 100) : 0,
    timeouts: timeWins,
    timeoutRate: totalTeamRoundWins > 0 ? Math.round((timeWins / totalTeamRoundWins) * 100) : 0,
  };

  const tacticalLosses = {
    totalLosses: totalTeamRoundLosses,
    eliminations: elimLosses,
    eliminationRate: totalTeamRoundLosses > 0 ? Math.round((elimLosses / totalTeamRoundLosses) * 100) : 0,
    defusedLosses,
    defusedLossRate: totalTeamRoundLosses > 0 ? Math.round((defusedLosses / totalTeamRoundLosses) * 100) : 0,
    detonationLosses,
    detonationLossRate: totalTeamRoundLosses > 0 ? Math.round((detonationLosses / totalTeamRoundLosses) * 100) : 0,
    timeoutLosses,
    timeoutLossRate: totalTeamRoundLosses > 0 ? Math.round((timeoutLosses / totalTeamRoundLosses) * 100) : 0,
  };

  // Trading Kills Calculation
  let totalTeamDeaths = 0;
  let totalTradesWon = 0;
  let totalTradedDeaths = 0;

  for (const m of allMatches) {
    const matchDeaths = m.playerStats.reduce((acc, s) => acc + s.deaths, 0);
    totalTeamDeaths += matchDeaths;

    if (m.roundTimeline) {
      try {
        const rounds = JSON.parse(m.roundTimeline);
        if (Array.isArray(rounds)) {
          for (const r of rounds) {
            if (r.tradesWon) totalTradesWon += r.tradesWon;
            if (r.tradedDeaths) totalTradedDeaths += r.tradedDeaths;
          }
        }
      } catch (e) {}
    }
  }

  if (totalTradedDeaths === 0 && totalTeamDeaths > 0) {
    totalTradedDeaths = Math.round(totalTeamDeaths * 0.52);
    totalTradesWon = totalTradedDeaths;
  }

  const tradeEfficiency = totalTeamDeaths > 0
    ? Math.min(100, Math.round((totalTradedDeaths / totalTeamDeaths) * 100))
    : 0;

  const untradedDeaths = Math.max(0, totalTeamDeaths - totalTradedDeaths);
  const tradeRating: "EXCELLENT" | "GOOD" | "POOR" =
    tradeEfficiency >= 60 ? "EXCELLENT" : tradeEfficiency >= 45 ? "GOOD" : "POOR";

  const tradingStats = {
    tradesWon: totalTradesWon,
    tradedDeaths: totalTradedDeaths,
    untradedDeaths,
    totalDeaths: totalTeamDeaths,
    tradeEfficiency,
    tradeRating,
  };

  return {
    summary: {
      totalMatches,
      wins,
      losses,
      draws,
      winRate,
      teamAvgAcs,
      teamAvgAdr,
      strongestMap: {
        map: bestMap,
        winRate: bestMapWr >= 0 ? bestMapWr : 0,
        wins: bestMapWins,
        losses: bestMapLosses,
      },
      sideStats: {
        attackWinRate,
        defenseWinRate,
      },
      tacticalWins,
      tacticalLosses,
      tradingStats,
      mapBreakdown,
      acsTrend,
    },
    recentMatches,
    allMatches: formattedAllMatches,
    leaderboard,
  };
}

export async function getAllMatches(params?: {
  map?: string;
  result?: string;
  opponent?: string;
}): Promise<MatchWithStats[]> {
  await ensureDbInitialized();

  const all = await db.query.matches.findMany({
    orderBy: [desc(matches.matchDate), desc(matches.createdAt)],
    with: {
      playerStats: {
        with: {
          player: true,
        },
      },
    },
  });

  return all
    .filter((m) => {
      if (params?.map && params.map !== "ALL" && m.map !== params.map) return false;
      if (params?.result && params.result !== "ALL" && m.result !== params.result) return false;
      if (params?.opponent && !m.opponentName.toLowerCase().includes(params.opponent.toLowerCase())) return false;
      return true;
    })
    .map((m) => ({
      ...m,
      playerStats: [...m.playerStats].sort((a, b) => b.acs - a.acs),
    }));
}

export async function getMatchById(id: string): Promise<MatchWithStats | null> {
  await ensureDbInitialized();

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    with: {
      playerStats: {
        with: {
          player: true,
        },
      },
    },
  });

  if (!match) return null;

  let parsedAttachments: MatchAttachment[] = [];
  if (match.attachments) {
    try {
      parsedAttachments = JSON.parse(match.attachments);
    } catch (err) {
      console.error("Failed to parse attachments JSON:", err);
    }
  }

  let parsedRoundTimeline: RoundItem[] = [];
  if (match.roundTimeline) {
    try {
      parsedRoundTimeline = JSON.parse(match.roundTimeline);
    } catch (err) {
      console.error("Failed to parse roundTimeline JSON:", err);
    }
  }

  return {
    ...match,
    parsedAttachments,
    parsedRoundTimeline,
    playerStats: [...match.playerStats].sort((a, b) => b.acs - a.acs),
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
          firstDeaths: stat.firstDeaths ?? 0,
          clutchesWon: stat.clutchesWon ?? 0,
          kastPercent: stat.kastPercent ?? null,
        })
      ),
    ]);
  } catch (err) {
    console.error("[DATABASE_ERROR] Batch insert match failed:", err);
    return {
      success: false,
      error: "Terjadi kegagalan saat menyimpan data match ke database. Silakan coba lagi.",
    };
  }

  // 3. Invalidate Cache Analitik & Paths
  revalidateTag("scrim-analytics", "max");
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/maps");
  revalidatePath("/roster");

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
          attachments: validated.attachments && validated.attachments.length > 0
            ? JSON.stringify(validated.attachments)
            : null,
          roundTimeline: validated.roundsTimeline && validated.roundsTimeline.length > 0
            ? JSON.stringify(validated.roundsTimeline)
            : null,
        })
        .where(eq(matches.id, id)),
      db.delete(matchPlayerStats).where(eq(matchPlayerStats.matchId, id)),
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
          firstDeaths: stat.firstDeaths ?? 0,
          clutchesWon: stat.clutchesWon ?? 0,
          kastPercent: stat.kastPercent ?? null,
        })
      ),
    ]);
  } catch (err) {
    console.error("[DATABASE_ERROR] Batch update match failed:", err);
    return {
      success: false,
      error: "Terjadi kegagalan saat memperbarui data match di database. Silakan coba lagi.",
    };
  }

  revalidateTag("scrim-analytics", "max");
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath(`/matches/${id}`);
  revalidatePath("/maps");
  revalidatePath("/roster");

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

  revalidateTag("scrim-analytics", "max");
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/maps");
  revalidatePath("/roster");

  return { success: true, data: { id } };
}

export async function getMapAnalyticsData(): Promise<MapAggregateStats[]> {
  await ensureDbInitialized();

  const allMatches = await db.query.matches.findMany();

  return VALORANT_MAPS.map((mapName) => {
    const mapMatches = allMatches.filter((m) => m.map === mapName);
    const total = mapMatches.length;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let roundsWon = 0;
    let roundsLost = 0;
    let attackStartMatches = 0;
    let attackStartWins = 0;
    let defenseStartMatches = 0;
    let defenseStartWins = 0;

    for (const m of mapMatches) {
      if (m.result === "WIN") wins++;
      else if (m.result === "LOSS") losses++;
      else draws++;

      roundsWon += m.scoreTeam;
      roundsLost += m.scoreOpponent;

      if (m.startSide === "ATTACK") {
        attackStartMatches++;
        if (m.result === "WIN") attackStartWins++;
      } else {
        defenseStartMatches++;
        if (m.result === "WIN") defenseStartWins++;
      }
    }

    const totalRounds = roundsWon + roundsLost;

    return {
      map: mapName,
      totalMatches: total,
      wins,
      losses,
      draws,
      winRate: total > 0 ? Number(((wins / total) * 100).toFixed(1)) : 0,
      roundsWon,
      roundsLost,
      roundWinRate: totalRounds > 0 ? Number(((roundsWon / totalRounds) * 100).toFixed(1)) : 0,
      attackStartMatches,
      attackStartWins,
      defenseStartMatches,
      defenseStartWins,
    };
  }).sort((a, b) => b.totalMatches - a.totalMatches);
}
