"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Trophy,
  Tv,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithStats, deleteMatch } from "@/lib/actions/matches";
import { MAP_METADATA, ValorantMap, VALORANT_AGENTS } from "@/lib/data/valorant";
import { calculateKD } from "@/lib/utils/analytics";
import { useUserRole } from "@/components/layout/role-context";

interface MatchDetailViewProps {
  match: MatchWithStats;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const [isDeleting, setIsDeleting] = useState(false);

  const mapMeta = MAP_METADATA[match.map as ValorantMap] || {
    name: match.map,
    location: "Valorant Protocol",
    color: "from-slate-900 to-slate-950",
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus data match ini secara permanen?")) return;
    setIsDeleting(true);
    await deleteMatch(match.id);
    router.push("/matches");
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between">
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Riwayat Match</span>
          </Button>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/matches/${match.id}/edit`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Match</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </Button>
          </div>
        )}
      </div>

      {/* MATCH HERO BANNER */}
      <div className={`relative overflow-hidden rounded-2xl border border-[#242e40] bg-gradient-to-r ${mapMeta.color} p-6 sm:p-8 shadow-xl`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg bg-black/50 border border-white/10 text-xs font-bold text-slate-100">
                {match.map}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {match.matchDate}
              </span>
              <Badge variant={match.startSide === "ATTACK" ? "attack" : "defense"}>
                Mulai: {match.startSide === "ATTACK" ? "Attack" : "Defense"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Team Alpha <span className="text-slate-400 font-normal">vs</span> <span className="text-rose-400">{match.opponentName}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Lokasi: {mapMeta.location}
            </p>
          </div>

          {/* Big Score Box */}
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-semibold uppercase">TIM KITA</div>
              <div className={`text-4xl font-black tabular-nums ${
                match.result === "WIN" ? "text-emerald-400" : match.result === "LOSS" ? "text-rose-400" : "text-amber-400"
              }`}>
                {match.scoreTeam}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">:</div>
            <div className="text-center">
              <div className="text-xs text-slate-400 font-semibold uppercase">LAWAN</div>
              <div className="text-4xl font-black text-slate-200 tabular-nums">
                {match.scoreOpponent}
              </div>
            </div>
            <div className="ml-2 pl-4 border-l border-slate-700/80">
              <Badge
                variant={
                  match.result === "WIN"
                    ? "win"
                    : match.result === "LOSS"
                    ? "loss"
                    : "draw"
                }
                className="text-xs px-3 py-1"
              >
                {match.result}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCOREBOARD TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Scoreboard Statistik 5 Pemain</span>
            </CardTitle>
            <CardDescription>
              Detail perolehan combat score, kills, damage, dan clutch per pemain
            </CardDescription>
          </div>
          <span className="text-xs text-slate-400">
            Diurutkan berdasarkan ACS tertinggi
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">Pemain</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4 text-right">ACS</th>
                <th className="py-3 px-4 text-center">K / D / A</th>
                <th className="py-3 px-4 text-right">K/D</th>
                <th className="py-3 px-4 text-right">ADR</th>
                <th className="py-3 px-4 text-right">HS %</th>
                <th className="py-3 px-4 text-center">FK / FD</th>
                <th className="py-3 px-4 text-center">Clutch (1vX)</th>
                <th className="py-3 px-4 text-right">KAST %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242e40]/70 font-medium">
              {match.playerStats.map((stat, idx) => {
                const kd = calculateKD(stat.kills, stat.deaths);
                const isMvp = idx === 0;
                const agentInfo = VALORANT_AGENTS.find((a) => a.name === stat.agent);

                return (
                  <tr
                    key={stat.id}
                    className={`transition-colors ${
                      isMvp
                        ? "bg-sky-500/5 hover:bg-sky-500/10"
                        : "hover:bg-[#1c2432]/60"
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {isMvp && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-[10px] font-bold border border-amber-400/30">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span>MVP</span>
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/players/${stat.player?.id}`}
                            className="font-bold text-slate-100 hover:text-rose-400 transition-colors text-sm"
                          >
                            {stat.player?.name || "Player"}
                          </Link>
                          {stat.player?.riotId && (
                            <p className="text-[11px] text-slate-400">
                              {stat.player.riotId}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: agentInfo?.color || "#38BDF8" }}
                        />
                        <span>{stat.agent}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-sky-400 text-sm tabular-nums">
                      {stat.acs}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-200">
                      <span className="text-emerald-400 font-bold">{stat.kills}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400 font-bold">{stat.deaths}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-300">{stat.assists}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                      <span
                        className={
                          kd >= 1.2
                            ? "text-emerald-400"
                            : kd >= 1.0
                            ? "text-slate-200"
                            : "text-rose-400"
                        }
                      >
                        {kd.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-200 tabular-nums">
                      {stat.adr}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-300 tabular-nums">
                      {stat.hsPercent != null ? `${stat.hsPercent}%` : "-"}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-200">
                      <span className="text-emerald-400">{stat.firstKills}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400">{stat.firstDeaths}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-amber-400 tabular-nums">
                      {stat.clutchesWon > 0 ? `${stat.clutchesWon} Menang` : "-"}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 tabular-nums">
                      {stat.kastPercent != null ? `${stat.kastPercent}%` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* TACTICAL EVALUATION & VOD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tactical Notes Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>Catatan Evaluasi Taktis IGL / Coach</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-300">
            {match.notes ? (
              <p className="whitespace-pre-wrap bg-[#0e131b] p-4 rounded-xl border border-[#242e40]">
                {match.notes}
              </p>
            ) : (
              <p className="text-slate-500 italic">
                Tidak ada catatan evaluasi untuk pertandingan ini.
              </p>
            )}
          </CardContent>
        </Card>

        {/* VOD Player / Link Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              <Tv className="w-4 h-4 text-sky-400" />
              <span>Video Rekaman VOD Scrim</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {match.vodUrl ? (
              <div className="space-y-3">
                <p className="text-slate-300">
                  Tautan video rekaman scrim tersedia untuk ditinjau:
                </p>
                <a
                  href={match.vodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all font-semibold break-all text-xs"
                >
                  <Tv className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Buka Video VOD ({match.vodUrl})</span>
                </a>
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Belum ada tautan video VOD yang dilampirkan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
