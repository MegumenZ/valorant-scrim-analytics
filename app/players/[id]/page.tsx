import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Swords,
  Crosshair,
  Flame,
  Zap,
  Target,
} from "lucide-react";
import { getPlayerProfile } from "@/lib/actions/players";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AgentPoolTable } from "@/components/players/agent-pool-table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENT_ROLE_COLORS, ValorantRole, VALORANT_AGENTS } from "@/lib/data/valorant";

export const dynamic = "force-dynamic";

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params;
  const data = await getPlayerProfile(id);

  if (!data) {
    notFound();
  }

  const { player, stats, agentPool, recentMatches } = data;
  const roleColor =
    AGENT_ROLE_COLORS[player.primaryRole as ValorantRole] ||
    AGENT_ROLE_COLORS.Flex;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Navigation Back */}
      <div>
        <Link href="/roster">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Roster Tim</span>
          </Button>
        </Link>
      </div>

      {/* PLAYER HERO HEADER */}
      <div className="rounded-2xl border border-[#242e40] bg-[#141a24] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1c2432] border border-[#242e40] flex items-center justify-center text-slate-100 font-black text-xl shadow-md">
              {player.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {player.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleColor.badge}`}>
                  {player.primaryRole}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    player.isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#1c2432] text-slate-400 border border-[#242e40]"
                  }`}
                >
                  {player.isActive ? "Starter Aktif" : "Cadangan"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                {player.riotId && <span>Riot ID: <strong className="text-slate-200">{player.riotId}</strong></span>}
                {player.discordId && <span>Discord: <strong className="text-slate-200">{player.discordId}</strong></span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* K/D Ratio */}
        <KpiCard
          title="K/D Ratio & Match"
          value={`${stats.kdRatio.toFixed(2)} KD`}
          subtitle={`${stats.totalKills} Kills / ${stats.totalDeaths} Deaths`}
          detail={`Total ${stats.matchesPlayed} Game Scrim`}
          icon={Crosshair}
          variant={stats.kdRatio >= 1.2 ? "win" : stats.kdRatio >= 1.0 ? "default" : "loss"}
        />

        {/* Combat Score */}
        <KpiCard
          title="Rata-rata Combat Score"
          value={`${stats.avgAcs} ACS`}
          subtitle={`Avg ADR: ${stats.avgAdr}`}
          detail="Damage output rata-rata per round"
          icon={Zap}
          variant="highlight"
        />

        {/* Accuracy & Consistency */}
        <KpiCard
          title="Headshot & KAST"
          value={`${stats.avgHsPercent}% HS`}
          subtitle={`KAST: ${stats.avgKastPercent > 0 ? `${stats.avgKastPercent}%` : "-"}`}
          detail="Presisi tembakan & kontribusi ronde"
          icon={Target}
          variant="amber"
        />

        {/* Opening Duels & Clutches */}
        <KpiCard
          title="Opening Duel (FK/FD)"
          value={`${stats.odr.toFixed(2)} Ratio`}
          subtitle={`${stats.firstKills} FK / ${stats.firstDeaths} FD`}
          detail={`${stats.clutchesWon} Kali Clutch 1vX Menang`}
          icon={Flame}
          variant="default"
        />
      </div>

      {/* AGENT POOL EFFICIENCY TABLE */}
      <AgentPoolTable agentPool={agentPool} />

      {/* MATCH HISTORY FOR THIS PLAYER */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Swords className="w-4 h-4 text-sky-400" />
            <span>Riwayat Pertandingan Pemain</span>
          </CardTitle>
          <CardDescription>
            Catatan performa individu pada setiap scrim yang diikuti
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Map</th>
                <th className="py-3 px-4">Tim Lawan</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4 text-right">ACS</th>
                <th className="py-3 px-4 text-center">K / D / A</th>
                <th className="py-3 px-4 text-right">K/D</th>
                <th className="py-3 px-4 text-right">ADR</th>
                <th className="py-3 px-4 text-right">HS %</th>
                <th className="py-3 px-4 text-center">FK / FD</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242e40]/70 font-medium">
              {recentMatches.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    Pemain ini belum memiliki catatan pertandingan.
                  </td>
                </tr>
              ) : (
                recentMatches.map((m) => {
                  const agentInfo = VALORANT_AGENTS.find((a) => a.name === m.agent);

                  return (
                    <tr key={m.matchId} className="hover:bg-[#1c2432]/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <span className="px-2 py-0.5 rounded-md bg-[#1c2432] border border-[#242e40] text-xs">
                          {m.map}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 whitespace-nowrap">
                        {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            m.result === "WIN"
                              ? "win"
                              : m.result === "LOSS"
                              ? "loss"
                              : "draw"
                          }
                        >
                          {m.result} ({m.scoreTeam}-{m.scoreOpponent})
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: agentInfo?.color || "#38BDF8" }}
                          />
                          <span>{m.agent}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sky-400 tabular-nums">
                        {m.acs}
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-200">
                        <span className="text-emerald-400 font-bold">{m.kills}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-rose-400 font-bold">{m.deaths}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-slate-400">{m.assists}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                        <span
                          className={
                            m.kdRatio >= 1.2
                              ? "text-emerald-400"
                              : m.kdRatio >= 1.0
                              ? "text-slate-200"
                              : "text-rose-400"
                          }
                        >
                          {m.kdRatio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-200 tabular-nums">
                        {m.adr}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300 tabular-nums">
                        {m.hsPercent != null ? `${m.hsPercent}%` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-200">
                        <span className="text-emerald-400">{m.firstKills}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-rose-400">{m.firstDeaths}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/matches/${m.matchId}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:text-rose-400 hover:bg-rose-500/10">
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
