"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AgentPoolTable } from "@/components/players/agent-pool-table";
import { PlayerKdTrendChart } from "@/components/players/player-kd-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AGENT_ROLE_COLORS, ValorantRole } from "@/lib/data/valorant";
import { useTranslation } from "@/lib/i18n/context";
import { Player } from "@/lib/db/schema";
import { AgentStatSummary, PlayerAggregateStats } from "@/lib/utils/analytics";
import { PlayerKdTrendPoint } from "@/components/players/player-kd-trend-chart";
import { hasProfileMatchData } from "@/lib/utils/roster-behavior";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/utils/ui-constants";

interface PlayerProfileViewProps {
  player: Player;
  stats: PlayerAggregateStats;
  agentPool: AgentStatSummary[];
  kdTrend: PlayerKdTrendPoint[];
  recentMatches: Array<{ matchId: string; matchDate: string; map: string; opponentName: string; scoreTeam: number; scoreOpponent: number; result: string; agent: string; kills: number; deaths: number; assists: number; kdRatio: number }>;
}

function ObjectiveMetric({ title, total, average, samples, matches, isEn }: { title: string; total: number | null; average: number | null; samples: number; matches: number; isEn: boolean }) {
  return <div className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4"><div className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{title}</div><div className="mt-2 font-tactical text-2xl font-bold tabular-nums text-white">{total == null ? "—" : total}</div><div className="mt-1 text-xs text-[#94A3B8]">{average == null ? (isEn ? "No recorded samples" : "Tidak ada sampel") : `${isEn ? "Avg" : "Rata-rata"} ${average.toFixed(1)} / ${isEn ? "match" : "match"}`}</div><div className="mt-1 text-[10px] text-[#CBD5E1]">{samples}/{matches} {isEn ? "matches" : "match"}</div></div>;
}

export function PlayerProfileView({ player, stats, agentPool, kdTrend, recentMatches }: PlayerProfileViewProps) {
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const roleColor = AGENT_ROLE_COLORS[player.primaryRole as ValorantRole] || AGENT_ROLE_COLORS.Flex;
  return <div className="mx-auto max-w-6xl space-y-6 pb-12">
    <div className="flex flex-col gap-3"><Link href="/roster"><Button variant="ghost" size="sm" className="gap-2 pl-0 text-[#94A3B8] hover:text-white"><ArrowLeft className="h-4 w-4" />{isEn ? "Back to Roster" : "Kembali ke Roster"}</Button></Link><div className="flex flex-col gap-4 rounded-lg border border-[#1C2433] bg-[#0C1017] p-5 sm:flex-row sm:items-center"><div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#1C2433] bg-[#090C10] font-tactical text-2xl font-black text-white">{player.name.substring(0, 2).toUpperCase()}</div><div><div className="flex flex-wrap items-center gap-2.5"><h1 className="font-tactical text-3xl font-black uppercase tracking-wide text-white">{player.name}</h1><span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${player.isActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-[#2A364F] bg-[#1C2433] text-[#94A3B8]"}`}>{player.isActive ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}</span></div><div className="mt-1 flex items-center gap-3 text-xs text-[#94A3B8]">{player.riotId && <><span className="font-mono text-white">{player.riotId}</span><span>•</span></>}<span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${roleColor.badge}`}>{player.primaryRole}</span></div></div></div></div>
    {hasProfileMatchData(stats.matchesPlayed) ? <>
      <section aria-label={isEn ? "Player scoreboard summary" : "Ringkasan scoreboard pemain"} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="K/D Ratio" value={stats.kdRatio.toFixed(2)} subtitle={`${stats.totalKills} Kills · ${stats.totalDeaths} Deaths`} detail={stats.matchesPlayed < SMALL_SAMPLE_THRESHOLD ? `${isEn ? "Small sample" : "Sampel kecil"} (n=${stats.matchesPlayed})` : undefined} variant={stats.kdRatio >= 1.2 ? "win" : stats.kdRatio >= 1 ? "default" : "loss"} />
        <KpiCard title={isEn ? "Average Kills / match" : "Rata-rata Kill / match"} value={stats.avgKills.toFixed(1)} subtitle={`${stats.matchesPlayed} ${isEn ? "matches" : "match"}`} />
        <KpiCard title={isEn ? "Average Deaths / match" : "Rata-rata Death / match"} value={stats.avgDeaths.toFixed(1)} subtitle={`${stats.matchesPlayed} ${isEn ? "matches" : "match"}`} variant="loss" />
        <KpiCard title={isEn ? "Average Assists / match" : "Rata-rata Assist / match"} value={stats.avgAssists.toFixed(1)} subtitle={`${stats.matchesPlayed} ${isEn ? "matches" : "match"}`} variant="highlight" />
      </section>
      <section aria-label={isEn ? "Objective statistics" : "Statistik objektif"} className="grid grid-cols-1 gap-3 sm:grid-cols-3"><ObjectiveMetric title={t.matchForm.firstKills} {...stats.firstBlood} matches={stats.matchesPlayed} isEn={isEn} /><ObjectiveMetric title={isEn ? "Plants" : "Plant"} {...stats.plants} matches={stats.matchesPlayed} isEn={isEn} /><ObjectiveMetric title={isEn ? "Defuses" : "Defuse"} {...stats.defuses} matches={stats.matchesPlayed} isEn={isEn} /></section>
      <PlayerKdTrendChart data={kdTrend} />
      <AgentPoolTable agentPool={agentPool} />
      <Card className="overflow-hidden border-[#1C2433] bg-[#0C1017]"><CardHeader className="border-b border-[#1C2433] bg-[#090C10] py-3.5 px-5"><CardTitle className="text-sm font-bold tracking-tight text-white">{isEn ? "Player Match History" : "Riwayat Pertandingan Pemain"}</CardTitle><p className="mt-0.5 text-xs text-[#94A3B8]">{isEn ? "Scoreboard records for each match played" : "Catatan scoreboard dari setiap pertandingan yang diikuti"}</p></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[780px] border-collapse text-left text-xs"><thead><tr className="border-b border-[#1C2433] bg-[#090C10] text-[11px] font-semibold text-[#94A3B8]"><th className="px-4 py-3">{t.matches.date}</th><th className="px-4 py-3">{t.matches.map}</th><th className="px-4 py-3">{t.matches.opponent}</th><th className="px-4 py-3">{t.matchDetail.agent}</th><th className="px-4 py-3 text-center">{t.matchDetail.kda}</th><th className="px-4 py-3 text-center">{t.matches.result}</th><th className="px-4 py-3 text-right" /></tr></thead><tbody className="divide-y divide-[#1C2433]">{recentMatches.map((m) => <tr key={m.matchId} className="group hover:bg-[#141A24]"><td className="whitespace-nowrap px-4 py-3.5 text-[#94A3B8]">{m.matchDate}</td><td className="px-4 py-3.5 font-tactical font-bold uppercase text-white">{m.map}</td><td className="whitespace-nowrap px-4 py-3.5 font-semibold text-white">vs {m.opponentName}<div className="text-[10px] font-normal text-[#94A3B8]">{m.scoreTeam}-{m.scoreOpponent}</div></td><td className="px-4 py-3.5 font-semibold text-white">{m.agent}</td><td className="px-4 py-3.5 text-center font-semibold tabular-nums"><span className="text-emerald-400">{m.kills}</span><span className="mx-1 text-[#CBD5E1]">/</span><span className="text-[#FF4655]">{m.deaths}</span><span className="mx-1 text-[#CBD5E1]">/</span><span className="text-[#94A3B8]">{m.assists}</span></td><td className="px-4 py-3.5 text-center"><span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>{m.result}</span></td><td className="whitespace-nowrap px-4 py-3.5 text-right"><Link href={`/matches/${m.matchId}`}><Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs"><span>{t.common.detail}</span><ChevronRight aria-hidden="true" className="h-3 w-3" /></Button></Link></td></tr>)}</tbody></table></CardContent></Card>
    </> : <Card className="border-[#1C2433] bg-[#0C1017] p-6 sm:p-8"><CardContent className="p-0 text-center"><h2 className="text-base font-semibold text-white">{isEn ? "No match data yet" : "Belum ada data match"}</h2><p className="mt-2 text-sm text-[#94A3B8]">{isEn ? "Player statistics will appear here after this player is included in a recorded match." : "Statistik pemain akan muncul setelah pemain ini tercatat dalam match."}</p></CardContent></Card>}
  </div>;
}
