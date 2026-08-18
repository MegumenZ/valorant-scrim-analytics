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
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
        <div>
          <CardTitle className="text-base">
            Leaderboard Roster
          </CardTitle>
        </div>
        <Link href="/roster">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 font-medium">
            <span>Kelola Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW: Leaderboard Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1C2433]">
          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-[#64748B] text-xs">
              Belum ada data pemain.
            </div>
          ) : (
            leaderboard.map((item, idx) => {
              const roleColor =
                AGENT_ROLE_COLORS[item.player.primaryRole as ValorantRole] ||
                AGENT_ROLE_COLORS.Flex;

              return (
                <Link
                  key={item.player.id}
                  href={`/players/${item.player.id}`}
                  className="block p-4 hover:bg-[#161D28] active:bg-[#202A3B] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Rank & Player Info */}
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 font-bold text-xs">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/15 text-slate-300 font-bold text-xs">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-[#64748B] font-semibold text-xs">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{item.player.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${roleColor.badge}`}>
                            {item.player.primaryRole}
                          </span>
                        </div>
                        {item.player.riotId && (
                          <div className="text-[11px] text-[#94A3B8] truncate max-w-[150px]">
                            {item.player.riotId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Matches Count */}
                    <div className="text-xs text-[#94A3B8] shrink-0 font-medium">
                      {item.matches} Match
                    </div>
                  </div>

                  {/* 3-Stat Metric Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#1C2433] text-center">
                    <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
                      <div className="text-[10px] text-[#94A3B8] font-medium">Avg ACS</div>
                      <div className="font-bold text-sm text-sky-400 tabular-nums">
                        {item.avgAcs}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
                      <div className="text-[10px] text-[#94A3B8] font-medium">K/D Ratio</div>
                      <div className={`font-bold text-sm tabular-nums ${
                        item.kdRatio >= 1.2 ? "text-emerald-400" : item.kdRatio >= 1.0 ? "text-white" : "text-rose-400"
                      }`}>
                        {item.kdRatio.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
                      <div className="text-[10px] text-[#94A3B8] font-medium">First Bloods</div>
                      <div className="font-bold text-sm text-emerald-400 tabular-nums">
                        {item.firstKills} FK
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* DESKTOP VIEW: Full Data Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C2433] bg-[#090C10]/50 text-[#94A3B8] font-medium text-[11px]">
                <th className="py-3 px-4 text-center w-10">#</th>
                <th className="py-3 px-4">Pemain</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Match</th>
                <th className="py-3 px-4 text-right">Avg ACS</th>
                <th className="py-3 px-4 text-right">K/D Ratio</th>
                <th className="py-3 px-4 text-center">First Bloods (FK)</th>
                <th className="py-3 px-4 text-center">Clutch (1vX)</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433] font-medium">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#64748B]">
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
                      className="hover:bg-[#161D28] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-[#94A3B8]">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 font-bold text-xs">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/15 text-slate-300 font-bold text-xs">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold text-xs">
                            3
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <Link
                            href={`/players/${item.player.id}`}
                            className="font-bold text-white group-hover:text-rose-400 transition-colors text-sm"
                          >
                            {item.player.name}
                          </Link>
                          {item.player.riotId && (
                            <p className="text-[11px] text-[#94A3B8]">
                              {item.player.riotId}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleColor.badge}`}
                        >
                          {item.player.primaryRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#F1F5F9]">
                        {item.matches}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sky-400 tabular-nums text-sm">
                        {item.avgAcs}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                        <span
                          className={
                            item.kdRatio >= 1.2
                              ? "text-emerald-400"
                              : item.kdRatio >= 1.0
                              ? "text-white"
                              : "text-rose-400"
                          }
                        >
                          {item.kdRatio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold tabular-nums">
                        {item.firstKills} FK
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-400 tabular-nums">
                        {item.clutchesWon > 0 ? `${item.clutchesWon} W` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
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
        </div>
      </CardContent>
    </Card>
  );
}

