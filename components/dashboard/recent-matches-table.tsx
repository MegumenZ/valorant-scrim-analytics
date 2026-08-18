import React from "react";
import Link from "next/link";
import { Swords, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithStats } from "@/lib/actions/matches";
import { getAgentIcon, getMapListViewIcon } from "@/lib/data/valorant";

interface RecentMatchesTableProps {
  matches: MatchWithStats[];
}

export function RecentMatchesTable({ matches }: RecentMatchesTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
        <div>
          <CardTitle className="text-base">
            Log Scrim Terkini
          </CardTitle>
        </div>
        <Link href="/matches">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 font-medium">
            <span>Semua Match</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW: Responsive Scrim Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1C2433]">
          {matches.length === 0 ? (
            <div className="py-8 text-center text-[#64748B] text-xs">
              Belum ada catatan match.
            </div>
          ) : (
            matches.map((m) => {
              const topFragger = m.playerStats[0];

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="block p-4 hover:bg-[#161D28] active:bg-[#202A3B] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getMapListViewIcon(m.map)}
                        alt={m.map}
                        className="w-8 h-8 rounded-lg object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{m.map}</div>
                        <div className="text-[11px] text-[#94A3B8]">{m.matchDate}</div>
                      </div>
                    </div>

                    {/* Result & Score */}
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-rose-400" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#64748B] mx-1">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
                      </div>
                      <Badge
                        variant={
                          m.result === "WIN"
                            ? "win"
                            : m.result === "LOSS"
                            ? "loss"
                            : "draw"
                        }
                      >
                        {m.result}
                      </Badge>
                    </div>
                  </div>

                  {/* Opponent & Side */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="font-semibold text-[#F1F5F9] truncate">
                      vs {m.opponentName}
                    </span>
                    <Badge variant={m.startSide === "ATTACK" ? "attack" : "defense"}>
                      {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                    </Badge>
                  </div>

                  {/* Top Fragger */}
                  {topFragger && (
                    <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-[#1C2433] text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAgentIcon(topFragger.agent)}
                          alt={topFragger.agent}
                          className="w-5 h-5 rounded-full bg-[#161D28] border border-[#2A364F] shrink-0 object-cover"
                        />
                        <span className="font-medium text-[#F1F5F9]">{topFragger.player?.name}</span>
                        <span className="text-[#64748B] text-[11px]">({topFragger.agent})</span>
                      </div>
                      <span className="font-semibold text-sky-400 text-xs">
                        {topFragger.acs} ACS
                      </span>
                    </div>
                  )}
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
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Map</th>
                <th className="py-3 px-4">Lawan</th>
                <th className="py-3 px-4 text-center">Skor</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4 text-center">Sisi</th>
                <th className="py-3 px-4">Top Fragger / MVP</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433] font-medium">
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748B]">
                    Belum ada catatan match.
                  </td>
                </tr>
              ) : (
                matches.map((m) => {
                  const topFragger = m.playerStats[0];

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#161D28] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getMapListViewIcon(m.map)}
                            alt={m.map}
                            className="w-7 h-7 rounded-md object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                          />
                          <span>{m.map}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap text-sm">
                        {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-sm tracking-wide tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-rose-400" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#64748B] mx-1.5">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
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
                          {m.result}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={m.startSide === "ATTACK" ? "attack" : "defense"}>
                          {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {topFragger ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <img
                              src={getAgentIcon(topFragger.agent)}
                              alt={topFragger.agent}
                              className="w-6 h-6 rounded-full bg-[#161D28] border border-[#2A364F] shrink-0 object-cover"
                            />
                            <span className="font-semibold text-white">{topFragger.player?.name || "Player"}</span>
                            <span className="text-[#64748B] text-xs">({topFragger.agent})</span>
                            <span className="text-xs font-semibold text-sky-400 ml-1">
                              {topFragger.acs} ACS
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#64748B]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/matches/${m.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1 hover:text-rose-400 hover:bg-rose-500/10"
                          >
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
        </div>
      </CardContent>
    </Card>
  );
}

