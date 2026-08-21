import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <Card className="bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
            Leaderboard Roster
          </CardTitle>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Akumulasi statistik performa individu seluruh pemain
          </p>
        </div>
        <Link href="/roster">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7 px-2.5 font-medium">
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
                  className="block p-4 hover:bg-[#141A24] active:bg-[#1A2230] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Rank & Player Info */}
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 font-tactical font-black text-base">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-400/15 text-slate-300 border border-slate-400/30">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-700/20 text-amber-500 border border-amber-700/30">
                            3
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-[#64748B] text-xs font-semibold">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{item.player.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${roleColor.badge}`}>
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

                  {/* 3-Stat Metric Inline Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#1C2433] text-center">
                    <div className="p-2 rounded bg-[#090C10] border border-[#1C2433]">
                      <div className="text-[10px] text-[#94A3B8] font-medium">Avg ACS</div>
                      <div className="font-tactical font-black text-base text-sky-400 tabular-nums">
                        {item.avgAcs}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#090C10] border border-[#1C2433]">
                      <div className="text-[10px] text-[#94A3B8] font-medium">K/D Ratio</div>
                      <div className={`font-tactical font-black text-base tabular-nums ${
                        item.kdRatio >= 1.2 ? "text-emerald-400" : item.kdRatio >= 1.0 ? "text-white" : "text-[#FF4655]"
                      }`}>
                        {item.kdRatio.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#090C10] border border-[#1C2433]">
                      <div className="text-[10px] text-[#94A3B8] font-medium">First Blood</div>
                      <div className="font-tactical font-black text-base text-emerald-400 tabular-nums">
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
              <tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-semibold text-[11px]">
                <th className="py-3 px-4 text-center w-10">#</th>
                <th className="py-3 px-4 sticky left-0 bg-[#090C10] z-10">Pemain</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Match</th>
                <th className="py-3 px-4 text-center">Avg ACS</th>
                <th className="py-3 px-4 text-center">K/D Ratio</th>
                <th className="py-3 px-4 text-center">First Blood (FK)</th>
                <th className="py-3 px-4 text-center">Clutch (1vX)</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433]">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#94A3B8]">
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
                      className="hover:bg-[#141A24] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-tactical font-black text-base">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-400/15 text-slate-300 border border-slate-400/30">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-700/20 text-amber-500 border border-amber-700/30">
                            3
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] text-xs font-semibold">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap sticky left-0 bg-[#0C1017] group-hover:bg-[#141A24] z-10 transition-colors">
                        <div className="text-xs">{item.player.name}</div>
                        {item.player.riotId && (
                          <div className="text-[11px] text-[#94A3B8] font-normal">
                            {item.player.riotId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${roleColor.badge}`}
                        >
                          {item.player.primaryRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-[#94A3B8] tabular-nums">
                        {item.matches}
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-lg font-black text-sky-400 tabular-nums">
                        {item.avgAcs}
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-lg font-black tabular-nums">
                        <span
                          className={
                            item.kdRatio >= 1.2
                              ? "text-emerald-400"
                              : item.kdRatio >= 1.0
                              ? "text-white"
                              : "text-[#FF4655]"
                          }
                        >
                          {item.kdRatio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-base font-bold text-emerald-400 tabular-nums">
                        {item.firstKills}
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-base font-bold text-amber-400 tabular-nums">
                        {item.clutchesWon}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/players/${item.player.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-[#94A3B8] hover:text-white hover:bg-[#1C2433]"
                          >
                            <span>Profil</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
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
