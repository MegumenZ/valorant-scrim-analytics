import React from "react";
import Link from "next/link";
import { Trophy, ChevronRight, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Player } from "@/lib/db/schema";
import { AGENT_ROLE_COLORS, ValorantRole } from "@/lib/data/valorant";

interface LeaderboardPlayerItem {
  player: Player;
  matches: number;
  avgAcs: number;
  avgAdr: number;
  kdRatio: number;
  hsPercent: number;
  firstKills: number;
  firstDeaths: number;
  clutchesWon: number;
}

interface RosterLeaderboardProps {
  leaderboard: LeaderboardPlayerItem[];
}

export function RosterLeaderboard({ leaderboard }: RosterLeaderboardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard Individu Roster</span>
          </CardTitle>
          <CardDescription>Akumulasi performa individu seluruh pemain dalam tim</CardDescription>
        </div>
        <Link href="/roster">
          <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
            <span>Kelola Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-y border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
              <th className="py-3 px-4 text-center w-12">#</th>
              <th className="py-3 px-4">Pemain</th>
              <th className="py-3 px-4">Role Utama</th>
              <th className="py-3 px-4 text-center">Match</th>
              <th className="py-3 px-4 text-right">Avg ACS</th>
              <th className="py-3 px-4 text-right">Avg ADR</th>
              <th className="py-3 px-4 text-right">K/D Ratio</th>
              <th className="py-3 px-4 text-right">HS %</th>
              <th className="py-3 px-4 text-center">FK / FD</th>
              <th className="py-3 px-4 text-center">Clutch (1vX)</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242e40]/70 font-medium">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500">
                  Belum ada data pemain.
                </td>
              </tr>
            ) : (
              leaderboard.map((item, idx) => {
                const roleColor =
                  AGENT_ROLE_COLORS[item.player.primaryRole as ValorantRole] ||
                  AGENT_ROLE_COLORS.Flex;

                return (
                  <tr
                    key={item.player.id}
                    className="hover:bg-[#1c2432]/60 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-extrabold text-xs">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 font-extrabold text-xs">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-extrabold text-xs">
                          3
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <Link
                          href={`/players/${item.player.id}`}
                          className="font-bold text-slate-100 group-hover:text-rose-400 transition-colors text-sm"
                        >
                          {item.player.name}
                        </Link>
                        {item.player.riotId && (
                          <p className="text-[11px] text-slate-400">
                            {item.player.riotId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleColor.badge}`}
                      >
                        {item.player.primaryRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-200">
                      {item.matches}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sky-400 tabular-nums text-sm">
                      {item.avgAcs}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 tabular-nums">
                      {item.avgAdr}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      <span
                        className={
                          item.kdRatio >= 1.2
                            ? "text-emerald-400"
                            : item.kdRatio >= 1.0
                            ? "text-slate-200"
                            : "text-rose-400"
                        }
                      >
                        {item.kdRatio.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {item.hsPercent}%
                    </td>
                    <td className="py-3 px-4 text-center text-slate-200 tabular-nums">
                      <span className="text-emerald-400 font-semibold">{item.firstKills}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400 font-semibold">{item.firstDeaths}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-400 tabular-nums">
                      {item.clutchesWon}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link href={`/players/${item.player.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-rose-400 hover:bg-rose-500/10">
                          <User className="w-3 h-3" />
                          <span>Profil</span>
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
  );
}
