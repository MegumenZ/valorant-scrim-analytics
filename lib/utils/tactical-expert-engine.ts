import { MatchWithStats } from "@/lib/actions/matches";
import { RoundItem, RoundOutcomeType } from "@/lib/validations/match";

export type TacticalGrade = "S" | "A+" | "A" | "B+" | "B" | "C+" | "C" | "D";

export interface TacticalInsight {
  category: "STRENGTH" | "FLAW" | "DRILL";
  title: string;
  desc: string;
  icon: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
}

export interface TacticalMatchReport {
  score: number; // 0 - 100
  grade: TacticalGrade;
  gradeLabel: string;
  gradeColor: string;
  gradeBg: string;
  gradeBorder: string;
  summary: string;
  momentum: {
    deltaScore: number;
    deltaTradeRate: number;
    trendLabel: string;
    isImproving: boolean;
  };
  strengths: TacticalInsight[];
  weaknesses: TacticalInsight[];
  drills: TacticalInsight[];
  pillars: {
    roundWinRate: number; // %
    tradeRate: number; // %
    pistolConversionRate: number; // %
    sideBalanceScore: number; // %
    postPlantRetakeScore: number; // %
  };
  standouts: {
    mvp?: { name: string; agent: string; acs: number };
    clutchHero?: { name: string; clutchesWon: number };
    entryFragger?: { name: string; firstKills: number };
  };
}

export interface TeamTacticalOverview {
  averageScore: number;
  overallGrade: TacticalGrade;
  totalMatchesAnalyzed: number;
  tradeRateTrend: {
    current: number;
    baseline: number;
    delta: number;
    isImproving: boolean;
  };
  strongestMap: { map: string; winrate: number; matchCount: number } | null;
  weakestMap: { map: string; winrate: number; matchCount: number } | null;
  topTeamPriorities: Array<{ title: string; desc: string; icon: string; urgency: "HIGH" | "MEDIUM" | "LOW" }>;
}

const GRADE_CONFIG: Record<TacticalGrade, { label: string; color: string; bg: string; border: string }> = {
  "S": { label: "Masterclass (S)", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/40" },
  "A+": { label: "Sangat Disiplin (A+)", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40" },
  "A": { label: "Solid & Rapi (A)", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  "B+": { label: "Cukup Baik (B+)", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
  "B": { label: "Standar (B)", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
  "C+": { label: "Kurang Rapi (C+)", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  "C": { label: "Banyak Blunder (C)", color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/30" },
  "D": { label: "Struktur Kolaps (D)", color: "text-rose-500", bg: "bg-rose-500/20", border: "border-rose-500/50" },
};

function determineGrade(score: number): TacticalGrade {
  if (score >= 90) return "S";
  if (score >= 82) return "A+";
  if (score >= 74) return "A";
  if (score >= 66) return "B+";
  if (score >= 58) return "B";
  if (score >= 50) return "C+";
  if (score >= 42) return "C";
  return "D";
}

/**
 * Menganalisis sebuah pertandingan secara deterministik dan membandingkannya dengan riwayat masa lalu
 */
export function evaluateMatchTactics(
  currentMatch: MatchWithStats,
  pastMatches: MatchWithStats[] = []
): TacticalMatchReport {
  const totalRounds = currentMatch.scoreTeam + currentMatch.scoreOpponent;
  const roundWinRate = totalRounds > 0 ? (currentMatch.scoreTeam / totalRounds) * 100 : 50;

  const playerStats = currentMatch.playerStats || [];
  const totalDeaths = playerStats.reduce((acc, p) => acc + (p.deaths || 0), 0);
  const totalFirstKills = playerStats.reduce((acc, p) => acc + (p.firstKills || 0), 0);
  const totalClutches = playerStats.reduce((acc, p) => acc + (p.clutchesWon || 0), 0);

  const timeline: RoundItem[] = (currentMatch as any).parsedRoundTimeline || [];

  // 1. Pilar Trade Efficiency
  let tradedDeaths = 0;
  if (timeline.length > 0) {
    for (const r of timeline) {
      if (r.tradedDeaths) tradedDeaths += r.tradedDeaths;
    }
  }
  if (tradedDeaths === 0 && totalDeaths > 0) {
    tradedDeaths = Math.round(totalDeaths * 0.52);
  }
  const tradeRate = totalDeaths > 0 ? Math.min(100, Math.round((tradedDeaths / totalDeaths) * 100)) : 50;
  const untradedDeaths = Math.max(0, totalDeaths - tradedDeaths);

  // 2. Pilar Pistol Conversion
  let pistolWins = 0;
  let pistolCount = 0;
  const r1 = timeline.find((r) => r.round === 1);
  const r13 = timeline.find((r) => r.round === 13);
  if (r1) {
    pistolCount++;
    if (r1.winner === "TEAM") pistolWins++;
  }
  if (r13) {
    pistolCount++;
    if (r13.winner === "TEAM") pistolWins++;
  }
  const pistolRate = pistolCount > 0 ? Math.round((pistolWins / pistolCount) * 100) : (currentMatch.scoreTeam >= 13 ? 50 : 35);

  // 3. Pilar Side Balance (Attack vs Defense)
  const attackRounds = timeline.filter((r) => r.side === "ATTACK");
  const defenseRounds = timeline.filter((r) => r.side === "DEFENSE");
  const attackWins = attackRounds.filter((r) => r.winner === "TEAM").length;
  const defenseWins = defenseRounds.filter((r) => r.winner === "TEAM").length;

  const attackWinRate = attackRounds.length > 0 ? (attackWins / attackRounds.length) * 100 : 50;
  const defenseWinRate = defenseRounds.length > 0 ? (defenseWins / defenseRounds.length) * 100 : 50;
  const sideDifference = Math.abs(attackWinRate - defenseWinRate);
  const sideBalanceScore = Math.max(0, Math.round(100 - sideDifference * 0.8));

  // 4. Pilar Post-Plant & Retake Quality
  const teamWins = timeline.filter((r) => r.winner === "TEAM");
  const teamLosses = timeline.filter((r) => r.winner === "OPPONENT");

  const defuseWins = teamWins.filter((r) => (r.outcomeType || r.winType) === "DEFUSE").length;
  const detonationWins = teamWins.filter((r) => (r.outcomeType || r.winType) === "DETONATION").length;
  const defusedLosses = teamLosses.filter((r) => (r.outcomeType || r.winType) === "DEFUSE").length;
  const timeoutLosses = teamLosses.filter((r) => (r.outcomeType || r.winType) === "TIME").length;

  let postPlantRetakeScore = 70;
  if (defuseWins >= 3) postPlantRetakeScore += 15;
  if (detonationWins >= 4) postPlantRetakeScore += 15;
  if (defusedLosses >= 3) postPlantRetakeScore -= 20;
  if (timeoutLosses >= 1) postPlantRetakeScore -= 10;
  postPlantRetakeScore = Math.max(20, Math.min(100, postPlantRetakeScore));

  // HITUNG TACTICAL SCORE (0 - 100)
  const rawScore =
    roundWinRate * 0.30 +
    tradeRate * 0.25 +
    pistolRate * 0.15 +
    sideBalanceScore * 0.15 +
    postPlantRetakeScore * 0.15;

  const score = Math.max(10, Math.min(100, Math.round(rawScore)));
  const grade = determineGrade(score);
  const gradeConf = GRADE_CONFIG[grade];

  // 5. Komparasi Tren Historis (Moving Average dari 5 game sebelumnya)
  const previousMatches = pastMatches.filter((m) => m.id !== currentMatch.id).slice(0, 5);
  let deltaScore = 0;
  let deltaTradeRate = 0;

  if (previousMatches.length > 0) {
    const prevScores = previousMatches.map((m) => {
      const tot = m.scoreTeam + m.scoreOpponent;
      const wr = tot > 0 ? (m.scoreTeam / tot) * 100 : 50;
      return wr;
    });
    const avgPrevWinRate = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
    deltaScore = Math.round(roundWinRate - avgPrevWinRate);
    deltaTradeRate = Math.round(tradeRate - 50); // Baseline normal 50%
  }

  const isImproving = deltaScore >= 0;
  const trendLabel =
    previousMatches.length === 0
      ? "Pertandingan Evaluasi Awal"
      : deltaScore > 5
      ? `📈 Performa Naik (+${deltaScore}% vs Baseline)`
      : deltaScore < -5
      ? `📉 Performa Turun (${deltaScore}% vs Baseline)`
      : `⚖️ Performa Stabil (Konsisten)`;

  // 6. Heuristic Insights Generator (Strengths, Weaknesses, Drills)
  const strengths: TacticalInsight[] = [];
  const weaknesses: TacticalInsight[] = [];
  const drills: TacticalInsight[] = [];

  // Evaluasi Trade & Spacing
  if (tradeRate >= 60) {
    strengths.push({
      category: "STRENGTH",
      title: `Crosshair Spacing Rapat (${tradeRate}% Trade Rate)`,
      desc: "Koordinasi refrag sangat disiplin. Setiap kehilangan anggota tim langsung dibalas cepat tanpa memberi keuntungan orang pada musuh.",
      icon: "Swords",
      impact: "HIGH",
    });
  } else if (tradeRate < 45) {
    weaknesses.push({
      category: "FLAW",
      title: `Banyak Kematian Terisolasi (${untradedDeaths} Dry Deaths)`,
      desc: "Pemain terlalu sering ter-pick-off sendirian saat rotasi atau eksekusi site tanpa rekan di jarak pendukung (refrag distance).",
      icon: "AlertTriangle",
      impact: "HIGH",
    });
    drills.push({
      category: "DRILL",
      title: "Buddy-System & Spacing Execution Drill",
      desc: "Latihan masuk site berpasangan (jarak maksimal 3-5 meter) agar duel pertama selalu terlindungi crossfire teman.",
      icon: "Users",
      impact: "HIGH",
    });
  }

  // Evaluasi Pistol
  if (pistolWins === 2 && pistolCount === 2) {
    strengths.push({
      category: "STRENGTH",
      title: "Pistol Round Clean Sweep (2/2 Menang)",
      desc: "Dominasi penuh di ronde pembuka kedua babak, memberikan keunggulan ekonomi beruntun untuk ronde berikutnya.",
      icon: "Crosshair",
      impact: "MEDIUM",
    });
  } else if (pistolWins === 0 && pistolCount > 0) {
    weaknesses.push({
      category: "FLAW",
      title: "Kalah di Seluruh Pistol Round (0/2)",
      desc: "Kehilangan kedua ronde pistol membebani ekonomi tim dan memaksa tim bermain eco/semi-buy lebih sering.",
      icon: "TrendingDown",
      impact: "MEDIUM",
    });
    drills.push({
      category: "DRILL",
      title: "Pistol Round Default & Micro-Utility Setup",
      desc: "Perbaiki strategi round 1 dengan setup utility flash/smoke yang lebih terstruktur daripada adu tembak mentah.",
      icon: "ShieldAlert",
      impact: "MEDIUM",
    });
  }

  // Evaluasi Retake & Post Plant
  if (defuseWins >= 3) {
    strengths.push({
      category: "STRENGTH",
      title: `Retake Protocol Sangat Solid (${defuseWins} Kali Defuse)`,
      desc: "Koordinasi utility retake defensif berjalan rapi saat membersihkan site yang sudah dikuasai musuh.",
      icon: "ShieldCheck",
      impact: "HIGH",
    });
  }

  if (defusedLosses >= 3) {
    weaknesses.push({
      category: "FLAW",
      title: `Post-Plant Rentan Dibongkar (${defusedLosses} Kali Gagal Tahan Spike)`,
      desc: "Spike sudah terpasang namun posisi penjagaan pasca-plant mudah diisolasi oleh utilitas retake tim lawan.",
      icon: "Bomb",
      impact: "HIGH",
    });
    drills.push({
      category: "DRILL",
      title: "Post-Plant Crossfire & Delay Lineup",
      desc: "Terapkan setup posisi crossfire pasca-plant yang saling melindungi serta delay lineup utilitas untuk menghabiskan timer defuse.",
      icon: "Timer",
      impact: "HIGH",
    });
  }

  if (timeoutLosses >= 1) {
    weaknesses.push({
      category: "FLAW",
      title: "Eksekusi Terlambat (Kalah Kehabisan Waktu 0:00)",
      desc: "Rotasi dan pengambilan keputusan mid-round terlalu lambat sehingga waktu habis sebelum sempat memasang spike.",
      icon: "Clock",
      impact: "MEDIUM",
    });
  }

  // Evaluasi Side Asymmetry
  if (sideDifference >= 35) {
    const weakerSide = attackWinRate < defenseWinRate ? "Attack" : "Defense";
    weaknesses.push({
      category: "FLAW",
      title: `Ketimpangan Sisi ${weakerSide} (${Math.round(weakerSide === "Attack" ? attackWinRate : defenseWinRate)}% Winrate)`,
      desc: `Tim bermain jauh lebih dominan di satu sisi namun kesulitan beradaptasi saat bertukar peran ke sisi ${weakerSide}.`,
      icon: "Split",
      impact: "HIGH",
    });
    drills.push({
      category: "DRILL",
      title: `Khusus Drill Sisi ${weakerSide} di Map ${currentMatch.map}`,
      desc: `Lakukan scrim khusus 12 ronde berturut-turut pada sisi ${weakerSide} untuk memperkaya variasi default setup.`,
      icon: "Target",
      impact: "HIGH",
    });
  }

  // Standout Players
  const sortedByACS = [...playerStats].sort((a, b) => b.acs - a.acs);
  const mvp = sortedByACS[0];
  const clutchLeader = [...playerStats].sort((a, b) => (b.clutchesWon || 0) - (a.clutchesWon || 0))[0];
  const entryFragger = [...playerStats].sort((a, b) => (b.firstKills || 0) - (a.firstKills || 0))[0];

  if (mvp && mvp.acs >= 270) {
    strengths.push({
      category: "STRENGTH",
      title: `Impact Fragging Dominan (${mvp.agent} - ${mvp.acs} ACS)`,
      desc: `Kontribusi opening kill dan damage dari ${mvp.agent} sangat konsisten membuka ruang bagi tim.`,
      icon: "Trophy",
      impact: "MEDIUM",
    });
  }

  // Fallback insights jika data sangat seimbang
  if (strengths.length === 0) {
    strengths.push({
      category: "STRENGTH",
      title: "Struktur Permainan Fundamental Stabil",
      desc: "Tidak ada kesalahan individual fatal yang mencolok, fundamental tim berjalan sesuai rencana standar.",
      icon: "CheckCircle2",
      impact: "LOW",
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      category: "FLAW",
      title: "Optimasi Detail Mikro Pertarungan",
      desc: "Secara taktis pertandingan berjalan sangat bersih. Fokus evaluasi berikutnya ada pada timing utility mikro.",
      icon: "Sparkles",
      impact: "LOW",
    });
  }

  if (drills.length === 0) {
    drills.push({
      category: "DRILL",
      title: "Retain Current Playbook & Refine Timing",
      desc: "Pertahankan struktur rotasi yang sudah solid dan poles komunikasi calling di detik-detik krusial.",
      icon: "Flame",
      impact: "LOW",
    });
  }

  // Ringkasan Eksekutif Otomatis
  const summary = currentMatch.result === "WIN"
    ? `Kemenangan meyakinkan ${currentMatch.scoreTeam}-${currentMatch.scoreOpponent} di ${currentMatch.map}. Sisi ${defenseWinRate >= attackWinRate ? "Defense" : "Attack"} berjalan solid dengan trade rate ${tradeRate}%. Pertahankan disiplin refrag dan setup retake.`
    : `Pertandingan ketat ${currentMatch.scoreTeam}-${currentMatch.scoreOpponent} di ${currentMatch.map}. Celah utama terletak pada ${weaknesses[0]?.title.toLowerCase() || "koordinasi spacing"}. Segera benahi sebelum scrim berikutnya.`;

  return {
    score,
    grade,
    gradeLabel: gradeConf.label,
    gradeColor: gradeConf.color,
    gradeBg: gradeConf.bg,
    gradeBorder: gradeConf.border,
    summary,
    momentum: {
      deltaScore,
      deltaTradeRate,
      trendLabel,
      isImproving,
    },
    strengths,
    weaknesses,
    drills,
    pillars: {
      roundWinRate: Math.round(roundWinRate),
      tradeRate,
      pistolConversionRate: pistolRate,
      sideBalanceScore,
      postPlantRetakeScore,
    },
    standouts: {
      mvp: mvp ? { name: mvp.playerId, agent: mvp.agent, acs: mvp.acs } : undefined,
      clutchHero: clutchLeader && (clutchLeader.clutchesWon || 0) > 0 ? { name: clutchLeader.playerId, clutchesWon: clutchLeader.clutchesWon || 0 } : undefined,
      entryFragger: entryFragger && (entryFragger.firstKills || 0) > 0 ? { name: entryFragger.playerId, firstKills: entryFragger.firstKills || 0 } : undefined,
    },
  };
}

/**
 * Menghitung ringkasan kesehatan taktis tim secara keseluruhan dari seluruh riwayat pertandingan
 */
export function evaluateTeamTacticalHealth(matches: MatchWithStats[]): TeamTacticalOverview {
  if (!matches || matches.length === 0) {
    return {
      averageScore: 70,
      overallGrade: "B",
      totalMatchesAnalyzed: 0,
      tradeRateTrend: { current: 50, baseline: 50, delta: 0, isImproving: true },
      strongestMap: null,
      weakestMap: null,
      topTeamPriorities: [
        { title: "Mulai Rekam Pertandingan Scrim", desc: "Catat beberapa game scrim untuk mengaktifkan Tactical Engine.", icon: "Sparkles", urgency: "LOW" },
      ],
    };
  }

  // Hitung score per match
  const reports = matches.map((m) => evaluateMatchTactics(m, matches));
  const avgScore = Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length);
  const overallGrade = determineGrade(avgScore);

  // Trade rate trend
  const recentReports = reports.slice(0, 5);
  const baselineReports = reports.slice(5, 15);

  const currTrade = Math.round(recentReports.reduce((acc, r) => acc + r.pillars.tradeRate, 0) / Math.max(1, recentReports.length));
  const baseTrade = baselineReports.length > 0
    ? Math.round(baselineReports.reduce((acc, r) => acc + r.pillars.tradeRate, 0) / baselineReports.length)
    : currTrade;

  const deltaTrade = currTrade - baseTrade;

  // Map performance aggregation
  const mapStats: Record<string, { wins: number; total: number }> = {};
  for (const m of matches) {
    if (!mapStats[m.map]) mapStats[m.map] = { wins: 0, total: 0 };
    mapStats[m.map].total++;
    if (m.result === "WIN") mapStats[m.map].wins++;
  }

  const mapList = Object.entries(mapStats).map(([map, stat]) => ({
    map,
    winrate: Math.round((stat.wins / stat.total) * 100),
    matchCount: stat.total,
  }));

  mapList.sort((a, b) => b.winrate - a.winrate);
  const strongestMap = mapList.length > 0 ? mapList[0] : null;
  const weakestMap = mapList.length > 1 ? mapList[mapList.length - 1] : null;

  // Top priorities
  const topTeamPriorities: Array<{ title: string; desc: string; icon: string; urgency: "HIGH" | "MEDIUM" }> = [];

  if (currTrade < 48) {
    topTeamPriorities.push({
      title: "Perbaiki Crosshair Spacing & Refrag Speed",
      desc: `Rata-rata trade tim (${currTrade}%) masih berada di bawah ambang standar kompetitif (55%). Prioritaskan drill buddy-system.`,
      icon: "Swords",
      urgency: "HIGH",
    });
  } else {
    topTeamPriorities.push({
      title: "Pertahankan Konsistensi Spacing",
      desc: `Disiplin trade tim (${currTrade}%) sudah sangat solid. Terus asah timing eksekusi utility pendukung.`,
      icon: "ShieldCheck",
      urgency: "MEDIUM",
    });
  }

  if (weakestMap && weakestMap.winrate < 45) {
    topTeamPriorities.push({
      title: `Rombak Playbook Map ${weakestMap.map}`,
      desc: `Winrate tim di ${weakestMap.map} hanya ${weakestMap.winrate}% (${weakestMap.matchCount} game). Butuh sesi teori & evaluasi setup default.`,
      icon: "MapPin",
      urgency: "HIGH",
    });
  }

  return {
    averageScore: avgScore,
    overallGrade,
    totalMatchesAnalyzed: matches.length,
    tradeRateTrend: {
      current: currTrade,
      baseline: baseTrade,
      delta: deltaTrade,
      isImproving: deltaTrade >= 0,
    },
    strongestMap,
    weakestMap,
    topTeamPriorities,
  };
}
