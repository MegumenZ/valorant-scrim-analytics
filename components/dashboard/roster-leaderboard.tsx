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
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#0c111a]/80">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFD166]" />
            <span>Leaderboard Roster</span>
          </CardTitle>
          <CardDescription>Akumulasi performa dan metrik tempur seluruh skuad</CardDescription>
        </div>
        <Link href="/roster">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 font-display">
            <span>Kelola Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW: Leaderboard Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1f2c42]/80">
          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-[#54657e] font-mono-stat text-xs">
              // BELUM ADA DATA PEMAIN.
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
                  className="block p-3.5 hover:bg-[#151e2e] active:bg-[#1a2538] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Rank & Player Info */}
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[3px] bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50 font-display font-black text-xs">
                            01
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[3px] bg-slate-400/20 text-slate-300 border border-slate-400/40 font-display font-black text-xs">
                            02
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[3px] bg-amber-700/20 text-amber-500 border border-amber-600/40 font-display font-black text-xs">
                            03
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-[#54657e] font-mono-stat font-bold text-xs">
                            0{idx + 1}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-display font-bold text-sm text-white flex items-center gap-1.5 uppercase tracking-wide">
                          <span>{item.player.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-display font-bold border ${roleColor.badge}`}>
                            {item.player.primaryRole}
                          </span>
                        </div>
                        {item.player.riotId && (
                          <div className="font-mono-stat text-[10px] text-[#8b9bb4] truncate max-w-[140px]">
                            {item.player.riotId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Matches Count */}
                    <div className="font-mono-stat text-[10px] text-[#8b9bb4] shrink-0">
                      {item.matches} Maps
                    </div>
                  </div>

                  {/* 3-Stat Metric Pill Grid */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1f2c42]/60 text-center">
                    <div className="p-1.5 rounded bg-[#0a0f18] border border-[#1f2c42]">
                      <div className="font-mono-stat text-[9px] text-[#8b9bb4]">AVG ACS</div>
                      <div className="font-display font-black text-sm text-[#38bdf8] tabular-nums">
                        {item.avgAcs}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-[#0a0f18] border border-[#1f2c42]">
                      <div className="font-mono-stat text-[9px] text-[#8b9bb4]">K/D RATIO</div>
                      <div className={`font-display font-black text-sm tabular-nums ${
                        item.kdRatio >= 1.2 ? "text-[#10E7B2]" : item.kdRatio >= 1.0 ? "text-white" : "text-[#FF4655]"
                      }`}>
                        {item.kdRatio.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-[#0a0f18] border border-[#1f2c42]">
                      <div className="font-mono-stat text-[9px] text-[#8b9bb4]">HEADSHOT</div>
                      <div className="font-display font-black text-sm text-[#FFD166] tabular-nums">
                        {item.hsPercent}%
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
              <tr className="border-y border-[#1f2c42] bg-[#0a0f18] text-[#8b9bb4] font-display uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4 text-center w-10">#</th>
                <th className="py-3 px-4">Pemain</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Match</th>
                <th className="py-3 px-4 text-right">Avg ACS</th>
                <th className="py-3 px-4 text-right">Avg ADR</th>
                <th className="py-3 px-4 text-right">K/D</th>
                <th className="py-3 px-4 text-right">HS %</th>
                <th className="py-3 px-4 text-center">FK / FD</th>
                <th className="py-3 px-4 text-center">Clutch</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2c42]/60 font-medium">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#54657e] font-mono-stat">
                    // BELUM ADA DATA PEMAIN.
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
                      className="hover:bg-[#151e2e] transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono-stat font-bold text-[#8b9bb4]">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[3px] bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50 font-display font-black text-xs">
                            01
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[3px] bg-slate-400/20 text-slate-300 border border-slate-400/40 font-display font-black text-xs">
                            02
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[3px] bg-amber-700/20 text-amber-500 border border-amber-600/40 font-display font-black text-xs">
                            03
                          </span>
                        ) : (
                          `0${idx + 1}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <Link
                            href={`/players/${item.player.id}`}
                            className="font-display font-bold text-white group-hover:text-[#FF4655] transition-colors text-sm uppercase tracking-wide"
                          >
                            {item.player.name}
                          </Link>
                          {item.player.riotId && (
                            <p className="font-mono-stat text-[10px] text-[#8b9bb4]">
                              {item.player.riotId}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-display font-bold uppercase border ${roleColor.badge}`}
                        >
                          {item.player.primaryRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono-stat text-[#ece8e1]">
                        {item.matches}
                      </td>
                      <td className="py-3 px-4 text-right font-display font-black text-[#38bdf8] tabular-nums text-sm">
                        {item.avgAcs}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-stat text-[#ece8e1] tabular-nums">
                        {item.avgAdr}
                      </td>
                      <td className="py-3 px-4 text-right font-display font-black tabular-nums text-sm">
                        <span
                          className={
                            item.kdRatio >= 1.2
                              ? "text-[#10E7B2]"
                              : item.kdRatio >= 1.0
                              ? "text-white"
                              : "text-[#FF4655]"
                          }
                        >
                          {item.kdRatio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-stat text-[#FFD166] font-bold tabular-nums">
                        {item.hsPercent}%
                      </td>
                      <td className="py-3 px-4 text-center font-mono-stat text-[#ece8e1] tabular-nums">
                        <span className="text-[#10E7B2] font-semibold">{item.firstKills}</span>
                        <span className="text-[#54657e] mx-1">/</span>
                        <span className="text-[#FF4655] font-semibold">{item.firstDeaths}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-display font-black text-[#FFD166] tabular-nums">
                        {item.clutchesWon}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link href={`/players/${item.player.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-[#FF4655] hover:bg-[#FF4655]/10 font-display">
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
