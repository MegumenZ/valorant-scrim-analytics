import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Swords,
  ExternalLink,
} from "lucide-react";
import { getPlayerProfile } from "@/lib/actions/players";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AgentPoolTable } from "@/components/players/agent-pool-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AGENT_ROLE_COLORS, ValorantRole, VALORANT_AGENTS, getAgentIcon } from "@/lib/data/valorant";

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

  const wins = recentMatches.filter((m) => m.result === "WIN").length;
  const losses = recentMatches.filter((m) => m.result === "LOSS").length;
  const winRate = stats.matchesPlayed > 0 ? Math.round((wins / stats.matchesPlayed) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* HEADER & BACK BUTTON */}
      <div className="flex flex-col gap-3">
        <Link href="/roster">
          <Button variant="ghost" size="sm" className="gap-2 text-[#94A3B8] hover:text-white pl-0">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Roster</span>
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#0C1017] border border-[#1C2433] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#090C10] border border-[#1C2433] flex items-center justify-center font-tactical text-2xl font-black text-white shadow-inner">
              {player.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="font-tactical text-3xl font-black tracking-wide text-white uppercase">
                  {player.name}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    player.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-[#1C2433] text-[#94A3B8] border-[#2A364F]"
                  }`}
                >
                  {player.isActive ? "Active Roster" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                {player.riotId && (
                  <span className="font-mono text-[#F1F5F9]">{player.riotId}</span>
                )}
                {player.riotId && <span>•</span>}
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${roleColor.badge}`}>
                  {player.primaryRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* K/D Ratio */}
        <KpiCard
          title="K/D Ratio"
          value={`${stats.kdRatio.toFixed(2)}`}
          subtitle={`${stats.totalKills} Kills · ${stats.totalDeaths} Deaths`}
          variant={stats.kdRatio >= 1.2 ? "win" : stats.kdRatio >= 1.0 ? "default" : "loss"}
        />

        {/* Combat Score */}
        <KpiCard
          title="Rata-rata Combat Score"
          value={`${stats.avgAcs} ACS`}
          subtitle={`${stats.totalKills} Total Kills (${stats.matchesPlayed} Game)`}
          variant="highlight"
        />

        {/* Win Rate */}
        <KpiCard
          title="Win Rate Scrim"
          value={`${winRate}%`}
          subtitle={`${wins} Menang · ${losses} Kalah`}
          variant={winRate >= 50 ? "win" : "loss"}
        />

        {/* First Bloods */}
        <KpiCard
          title="First Blood (FK)"
          value={`${stats.firstKills} FK`}
          subtitle={`Rata-rata ${(stats.firstKills / (stats.matchesPlayed || 1)).toFixed(1)} FK per match`}
          variant="amber"
        />
      </div>

      {/* AGENT POOL EFFICIENCY TABLE */}
      <AgentPoolTable agentPool={agentPool} />

      {/* MATCH HISTORY FOR THIS PLAYER */}
      <Card className="bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
                Riwayat Pertandingan Pemain
              </CardTitle>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Catatan performa individu pada setiap scrim yang diikuti
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-semibold text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 sticky left-0 bg-[#090C10] z-10">Map</th>
                <th className="py-3 px-4">Tim Lawan</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4 text-center">ACS</th>
                <th className="py-3 px-4 text-center">K / D / A</th>
                <th className="py-3 px-4 text-center">K/D Ratio</th>
                <th className="py-3 px-4 text-center">First Blood (FK)</th>
                <th className="py-3 px-4 text-center">Clutch (1vX)</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433]">
              {recentMatches.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#94A3B8]">
                    Pemain ini belum memiliki catatan pertandingan.
                  </td>
                </tr>
              ) : (
                recentMatches.map((m) => {
                  return (
                    <tr key={m.matchId} className="hover:bg-[#141A24] transition-colors group">
                      <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-tactical text-base font-black text-white uppercase tracking-wide sticky left-0 bg-[#0C1017] group-hover:bg-[#141A24] z-10 transition-colors">
                        {m.map}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        vs {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase inline-flex items-center gap-1 ${
                            m.result === "WIN"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : m.result === "LOSS"
                              ? "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <span>{m.result === "WIN" ? "✓" : m.result === "LOSS" ? "✕" : "−"}</span>
                          <span>{m.result} ({m.scoreTeam}-{m.scoreOpponent})</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <img
                            src={getAgentIcon(m.agent)}
                            alt={m.agent}
                            className="w-5 h-5 rounded-full bg-[#161D28] border border-[#2A364F] object-cover shrink-0"
                          />
                          <span>{m.agent}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-base font-bold text-sky-400 tabular-nums">
                        {m.acs}
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums font-semibold">
                        <span className="text-emerald-400">{m.kills}</span>
                        <span className="text-[#64748B] mx-1">/</span>
                        <span className="text-[#FF4655]">{m.deaths}</span>
                        <span className="text-[#64748B] mx-1">/</span>
                        <span className="text-[#94A3B8]">{m.assists}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-base font-bold tabular-nums">
                        <span
                          className={
                            m.kdRatio >= 1.2
                              ? "text-emerald-400"
                              : m.kdRatio >= 1.0
                              ? "text-white"
                              : "text-[#FF4655]"
                          }
                        >
                          {m.kdRatio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-tactical text-base font-bold tabular-nums">
                        {m.firstKills}
                      </td>
                      <td className="py-3.5 px-4 text-center text-amber-400 font-tactical text-base font-bold tabular-nums">
                        {m.clutchesWon > 0 ? `${m.clutchesWon} W` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/matches/${m.matchId}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-white hover:bg-[#1C2433]">
                            <span>Detail</span>
                            <ExternalLink className="w-3 h-3" />
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
