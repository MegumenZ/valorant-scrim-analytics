import { MatchWithStats } from "@/lib/actions/matches";
import { RoundItem, RoundOutcomeType } from "@/lib/validations/match";
import { Language } from "@/lib/i18n/types";

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

const GRADE_CONFIG: Record<TacticalGrade, { labelId: string; labelEn: string; color: string; bg: string; border: string }> = {
  "S": { labelId: "Masterclass (S)", labelEn: "Masterclass (S)", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/40" },
  "A+": { labelId: "Sangat Disiplin (A+)", labelEn: "Highly Disciplined (A+)", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40" },
  "A": { labelId: "Solid & Rapi (A)", labelEn: "Solid & Structured (A)", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  "B+": { labelId: "Cukup Baik (B+)", labelEn: "Above Average (B+)", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
  "B": { labelId: "Standar (B)", labelEn: "Standard (B)", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
  "C+": { labelId: "Kurang Rapi (C+)", labelEn: "Inconsistent (C+)", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  "C": { labelId: "Banyak Blunder (C)", color: "text-rose-400", labelEn: "Frequent Blunders (C)", bg: "bg-rose-500/15", border: "border-rose-500/30" },
  "D": { labelId: "Struktur Kolaps (D)", labelEn: "Collapsed Structure (D)", color: "text-rose-500", bg: "bg-rose-500/20", border: "border-rose-500/50" },
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
 * Menganalisis sebuah pertandingan secara deterministik dan membandingkannya dengan riwayat masa lalu (Bilingual ID / EN)
 */
export function evaluateMatchTactics(
  currentMatch: MatchWithStats,
  pastMatches: MatchWithStats[] = [],
  lang: Language = "id"
): TacticalMatchReport {
  const isEn = lang === "en";
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
  const pistolRate = pistolCount > 0 ? Math.round((pistolWins / pistolCount) * 100) : 50;

  // 3. Pilar Side Asymmetry Balance
  let attackWins = 0;
  let attackTotal = 0;
  let defenseWins = 0;
  let defenseTotal = 0;

  if (timeline.length > 0) {
    for (const r of timeline) {
      if (r.side === "ATTACK") {
        attackTotal++;
        if (r.winner === "TEAM") attackWins++;
      } else {
        defenseTotal++;
        if (r.winner === "TEAM") defenseWins++;
      }
    }
  } else {
    // Estimasi jika data kronologi kosong
    const isAttStart = currentMatch.startSide === "ATTACK";
    attackWins = isAttStart ? Math.min(12, Math.round(currentMatch.scoreTeam * 0.5)) : Math.round(currentMatch.scoreTeam * 0.5);
    defenseWins = currentMatch.scoreTeam - attackWins;
    attackTotal = 12;
    defenseTotal = totalRounds - 12;
  }

  const attackWinRate = attackTotal > 0 ? (attackWins / attackTotal) * 100 : 50;
  const defenseWinRate = defenseTotal > 0 ? (defenseWins / defenseTotal) * 100 : 50;
  const sideDifference = Math.abs(attackWinRate - defenseWinRate);
  const sideBalanceScore = Math.max(0, Math.min(100, Math.round(100 - sideDifference * 0.8)));

  // 4. Pilar Post-Plant & Retake Quality
  let defuseWins = 0;
  let defusedLosses = 0;
  let timeoutLosses = 0;

  if (timeline.length > 0) {
    for (const r of timeline) {
      if (r.winner === "TEAM" && r.outcomeType === "DEFUSE") defuseWins++;
      if (r.winner === "OPPONENT" && r.outcomeType === "DEFUSE") defusedLosses++;
      if (r.winner === "OPPONENT" && r.outcomeType === "TIME") timeoutLosses++;
    }
  }

  const postPlantRetakeScore = Math.min(
    100,
    Math.max(20, Math.round(60 + defuseWins * 8 - defusedLosses * 10 - timeoutLosses * 15))
  );

  // 5. Rumus Nilai Taktis Komposit
  const weightedScore =
    roundWinRate * 0.35 +
    tradeRate * 0.25 +
    pistolRate * 0.15 +
    sideBalanceScore * 0.15 +
    postPlantRetakeScore * 0.10;

  const score = Math.min(100, Math.max(0, Math.round(weightedScore)));
  const grade = determineGrade(score);
  const gradeConf = GRADE_CONFIG[grade];

  // Hitung tren momentum dibanding scrim terdahulu
  const previousMatches = pastMatches.filter((m) => m.id !== currentMatch.id);
  let deltaScore = 0;
  let deltaTradeRate = 0;

  if (previousMatches.length > 0) {
    const recentScores = previousMatches.slice(0, 3).map((m) => {
      const totR = m.scoreTeam + m.scoreOpponent;
      const wr = totR > 0 ? (m.scoreTeam / totR) * 100 : 50;
      return wr;
    });
    const avgPrevWr = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    deltaScore = Math.round(roundWinRate - avgPrevWr);
  }

  const isImproving = deltaScore >= 0;
  const trendLabel =
    previousMatches.length === 0
      ? isEn ? "Initial Evaluation Match" : "Pertandingan Evaluasi Awal"
      : deltaScore > 5
      ? isEn ? `📈 Performance Up (+${deltaScore}% vs Baseline)` : `📈 Performa Naik (+${deltaScore}% vs Baseline)`
      : deltaScore < -5
      ? isEn ? `📉 Performance Down (${deltaScore}% vs Baseline)` : `📉 Performa Turun (${deltaScore}% vs Baseline)`
      : isEn ? "⚖️ Stable Performance (Consistent)" : "⚖️ Performa Stabil (Konsisten)";

  // 6. Heuristic Insights Generator (Strengths, Weaknesses, Drills)
  const strengths: TacticalInsight[] = [];
  const weaknesses: TacticalInsight[] = [];
  const drills: TacticalInsight[] = [];

  // Evaluasi Trade & Spacing
  if (tradeRate >= 60) {
    strengths.push({
      category: "STRENGTH",
      title: isEn ? `Tight Crosshair Spacing (${tradeRate}% Trade Rate)` : `Crosshair Spacing Rapat (${tradeRate}% Trade Rate)`,
      desc: isEn
        ? "Refrag coordination was highly disciplined. Teammate losses were immediately traded without conceding man advantages."
        : "Koordinasi refrag sangat disiplin. Setiap kehilangan anggota tim langsung dibalas cepat tanpa memberi keuntungan orang pada musuh.",
      icon: "Swords",
      impact: "HIGH",
    });
  } else if (tradeRate < 45) {
    weaknesses.push({
      category: "FLAW",
      title: isEn ? `Excessive Dry Deaths (${untradedDeaths} Untraded Deaths)` : `Banyak Kematian Terisolasi (${untradedDeaths} Dry Deaths)`,
      desc: isEn
        ? "Players were repeatedly picked off alone during rotations or site hits without teammate support in trading distance."
        : "Pemain terlalu sering ter-pick-off sendirian saat rotasi atau eksekusi site tanpa rekan di jarak pendukung (refrag distance).",
      icon: "AlertTriangle",
      impact: "HIGH",
    });
    drills.push({
      category: "DRILL",
      title: isEn ? "Buddy-System & Spacing Execution Drill" : "Buddy-System & Spacing Execution Drill",
      desc: isEn
        ? "Practice paired site entries (max 3-5m spacing) so opening duels are always covered by a teammate's crossfire."
        : "Latihan masuk site berpasangan (jarak maksimal 3-5 meter) agar duel pertama selalu terlindungi crossfire teman.",
      icon: "Users",
      impact: "HIGH",
    });
  }

  // Evaluasi Pistol
  if (pistolWins === 2 && pistolCount === 2) {
    strengths.push({
      category: "STRENGTH",
      title: isEn ? "Pistol Round Clean Sweep (2/2 Won)" : "Pistol Round Clean Sweep (2/2 Menang)",
      desc: isEn
        ? "Total dominance in both half opening pistol rounds, securing rolling economic advantages into subsequent rounds."
        : "Dominasi penuh di ronde pembuka kedua babak, memberikan keunggulan ekonomi beruntun untuk ronde berikutnya.",
      icon: "Crosshair",
      impact: "MEDIUM",
    });
  } else if (pistolWins === 0 && pistolCount > 0) {
    weaknesses.push({
      category: "FLAW",
      title: isEn ? "Lost All Pistol Rounds (0/2)" : "Kalah di Seluruh Pistol Round (0/2)",
      desc: isEn
        ? "Conceding both pistol rounds strained the team economy and forced frequent eco/semi-buy scenarios."
        : "Kehilangan kedua ronde pistol membebani ekonomi tim dan memaksa tim bermain eco/semi-buy lebih sering.",
      icon: "TrendingDown",
      impact: "MEDIUM",
    });
    drills.push({
      category: "DRILL",
      title: isEn ? "Pistol Round Default & Crossfire Setup" : "Pistol Round Default & Crossfire Setup",
      desc: isEn
        ? "Revamp round 1 defaults with crossfire setups and tight angle positioning rather than taking isolated 50/50 duels."
        : "Perbaiki strategi round 1 dengan setup crossfire dan positioning sudut rapat daripada adu duel satu lawan satu.",
      icon: "ShieldAlert",
      impact: "MEDIUM",
    });
  }

  // Evaluasi Retake & Post Plant
  if (defuseWins >= 3) {
    strengths.push({
      category: "STRENGTH",
      title: isEn ? `Solid Retake Protocol (${defuseWins} Successful Defuses)` : `Retake Protocol Sangat Solid (${defuseWins} Kali Defuse)`,
      desc: isEn
        ? "Defensive retake protocols were executed cleanly when clearing site angles and securing defuses."
        : "Koordinasi retake defensif berjalan rapi saat membersihkan site dan mengamankan defuse spike.",
      icon: "ShieldCheck",
      impact: "HIGH",
    });
  }

  if (defusedLosses >= 3) {
    weaknesses.push({
      category: "FLAW",
      title: isEn ? `Vulnerable Post-Plant (${defusedLosses} Failed Spike Holds)` : `Post-Plant Rentan Dibongkar (${defusedLosses} Kali Gagal Tahan Spike)`,
      desc: isEn
        ? "Spikes were planted but post-plant holding positions were easily dismantled by enemy retake utility."
        : "Spike sudah terpasang namun posisi penjagaan pasca-plant mudah diisolasi oleh manuver retake tim lawan.",
      icon: "Bomb",
      impact: "HIGH",
    });
    drills.push({
      category: "DRILL",
      title: isEn ? "Post-Plant Crossfire & Delay Positioning" : "Post-Plant Crossfire & Delay Position",
      desc: isEn
        ? "Establish layered post-plant crossfire positions designed specifically to bleed the enemy defuse timer."
        : "Terapkan setup posisi crossfire pasca-plant yang saling melindungi untuk menghabiskan timer defuse lawan.",
      icon: "Timer",
      impact: "HIGH",
    });
  }

  if (timeoutLosses >= 1) {
    weaknesses.push({
      category: "FLAW",
      title: isEn ? "Delayed Execution (Loss to 0:00 Timer Expired)" : "Eksekusi Terlambat (Kalah Kehabisan Waktu 0:00)",
      desc: isEn
        ? "Mid-round decision making and rotations were overly hesitant, causing time to expire before getting the spike down."
        : "Rotasi dan pengambilan keputusan mid-round terlalu lambat sehingga waktu habis sebelum sempat memasang spike.",
      icon: "Clock",
      impact: "MEDIUM",
    });
  }

  // Evaluasi Side Asymmetry
  if (sideDifference >= 35) {
    const weakerSide = attackWinRate < defenseWinRate ? "Attack" : "Defense";
    weaknesses.push({
      category: "FLAW",
      title: isEn
        ? `${weakerSide} Side Deficit (${Math.round(weakerSide === "Attack" ? attackWinRate : defenseWinRate)}% Winrate)`
        : `Ketimpangan Sisi ${weakerSide} (${Math.round(weakerSide === "Attack" ? attackWinRate : defenseWinRate)}% Winrate)`,
      desc: isEn
        ? `The team dominated on one side but struggled severely to convert rounds after swapping to ${weakerSide}.`
        : `Tim bermain jauh lebih dominan di satu sisi namun kesulitan beradaptasi saat bertukar peran ke sisi ${weakerSide}.`,
      icon: "Split",
      impact: "HIGH",
    });
    drills.push({
      category: "DRILL",
      title: isEn ? `${weakerSide} Side Tactical Drill on ${currentMatch.map}` : `Khusus Drill Sisi ${weakerSide} di Map ${currentMatch.map}`,
      desc: isEn
        ? `Run a targeted 12-round scrim block specifically on ${weakerSide} to expand default playbook variations.`
        : `Lakukan scrim khusus 12 ronde berturut-turut pada sisi ${weakerSide} untuk memperkaya variasi default setup.`,
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
      title: isEn ? `Dominant Impact Fragging (${mvp.agent} - ${mvp.acs} ACS)` : `Impact Fragging Dominan (${mvp.agent} - ${mvp.acs} ACS)`,
      desc: isEn
        ? `Opening duels and heavy combat damage from ${mvp.agent} consistently generated map control and space.`
        : `Kontribusi opening kill dan damage dari ${mvp.agent} sangat konsisten membuka ruang bagi tim.`,
      icon: "Trophy",
      impact: "MEDIUM",
    });
  }

  // Fallback insights jika data sangat seimbang
  if (strengths.length === 0) {
    strengths.push({
      category: "STRENGTH",
      title: isEn ? "Stable Tactical Fundamentals" : "Struktur Permainan Fundamental Stabil",
      desc: isEn
        ? "No major individual mistakes noticed; team fundamentals operated consistently according to playbook."
        : "Tidak ada kesalahan individual fatal yang mencolok, fundamental tim berjalan sesuai rencana standar.",
      icon: "CheckCircle2",
      impact: "LOW",
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      category: "FLAW",
      title: isEn ? "Micro Detail & Positional Discipline" : "Optimasi Detail Mikro & Disiplin Posisi",
      desc: isEn
        ? "Tactically clean match without glaring leaks. Maintain angle discipline and rotation pacing."
        : "Secara taktis pertandingan berjalan sangat bersih tanpa kesalahan fatal. Pertahankan disiplin sudut duel dan tempo rotasi.",
      icon: "Sparkles",
      impact: "LOW",
    });
  }

  if (drills.length === 0) {
    drills.push({
      category: "DRILL",
      title: isEn ? "Maintain Structure & Polish Mid-Round Calling" : "Pertahankan Struktur & Poles Komunikasi Mid-Round",
      desc: isEn
        ? "Preserve solid rotation architecture and sharpen crucial information comms under high-pressure seconds."
        : "Pertahankan struktur rotasi yang sudah solid dan pertajam calling informasi di detik-detik krusial.",
      icon: "Flame",
      impact: "LOW",
    });
  }

  // Ringkasan Eksekutif Otomatis
  const summary = isEn
    ? currentMatch.result === "WIN"
      ? `Convincing ${currentMatch.scoreTeam}-${currentMatch.scoreOpponent} victory on ${currentMatch.map}. ${defenseWinRate >= attackWinRate ? "Defense" : "Attack"} side performed solidly with a ${tradeRate}% trade rate. Maintain refrag discipline and retake protocols.`
      : `Tight ${currentMatch.scoreTeam}-${currentMatch.scoreOpponent} match on ${currentMatch.map}. Key leak stemmed from ${weaknesses[0]?.title.toLowerCase() || "spacing coordination"}. Address immediately before the next scrim block.`
    : currentMatch.result === "WIN"
      ? `Kemenangan meyakinkan ${currentMatch.scoreTeam}-${currentMatch.scoreOpponent} di ${currentMatch.map}. Sisi ${defenseWinRate >= attackWinRate ? "Defense" : "Attack"} berjalan solid dengan trade rate ${tradeRate}%. Pertahankan disiplin refrag dan setup retake.`
      : `Pertandingan ketat ${currentMatch.scoreTeam}-${currentMatch.scoreOpponent} di ${currentMatch.map}. Celah utama terletak pada ${weaknesses[0]?.title.toLowerCase() || "koordinasi spacing"}. Segera benahi sebelum scrim berikutnya.`;

  return {
    score,
    grade,
    gradeLabel: isEn ? gradeConf.labelEn : gradeConf.labelId,
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
 * Menghitung ringkasan kesehatan taktis tim secara keseluruhan dari seluruh riwayat pertandingan (Bilingual ID / EN)
 */
export function evaluateTeamTacticalHealth(matches: MatchWithStats[], lang: Language = "id"): TeamTacticalOverview {
  const isEn = lang === "en";

  if (!matches || matches.length === 0) {
    return {
      averageScore: 70,
      overallGrade: "B",
      totalMatchesAnalyzed: 0,
      tradeRateTrend: { current: 50, baseline: 50, delta: 0, isImproving: true },
      strongestMap: null,
      weakestMap: null,
      topTeamPriorities: [
        {
          title: isEn ? "Start Recording Scrim Matches" : "Mulai Rekam Pertandingan Scrim",
          desc: isEn ? "Record several scrim matches to activate the Tactical Engine." : "Catat beberapa game scrim untuk mengaktifkan Tactical Engine.",
          icon: "Sparkles",
          urgency: "LOW",
        },
      ],
    };
  }

  // Hitung score per match
  const reports = matches.map((m) => evaluateMatchTactics(m, matches, lang));
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
      title: isEn ? "Improve Crosshair Spacing & Refrag Speed" : "Perbaiki Crosshair Spacing & Refrag Speed",
      desc: isEn
        ? `Team trade average (${currTrade}%) sits below competitive threshold (55%). Prioritize buddy-system drills.`
        : `Rata-rata trade tim (${currTrade}%) masih berada di bawah ambang standar kompetitif (55%). Prioritaskan drill buddy-system.`,
      icon: "Swords",
      urgency: "HIGH",
    });
  } else {
    topTeamPriorities.push({
      title: isEn ? "Maintain Spacing Consistency" : "Pertahankan Konsistensi Spacing",
      desc: isEn
        ? `Team trade discipline (${currTrade}%) is solid. Continue polishing site hit timings and rotation tempo.`
        : `Disiplin trade tim (${currTrade}%) sudah sangat solid. Terus asah koordinasi eksekusi site dan tempo rotasi.`,
      icon: "ShieldCheck",
      urgency: "MEDIUM",
    });
  }

  if (weakestMap && weakestMap.winrate < 45) {
    topTeamPriorities.push({
      title: isEn ? `Revamp Playbook for Map ${weakestMap.map}` : `Rombak Playbook Map ${weakestMap.map}`,
      desc: isEn
        ? `Team winrate on ${weakestMap.map} is only ${weakestMap.winrate}% across ${weakestMap.matchCount} games. Needs a dedicated tactical theory session.`
        : `Winrate tim di ${weakestMap.map} hanya ${weakestMap.winrate}% (${weakestMap.matchCount} game). Butuh sesi teori & evaluasi setup default.`,
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

export const calculateTacticalMetrics = evaluateTeamTacticalHealth;
