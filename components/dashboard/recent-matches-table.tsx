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
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-rose-500" />
            <span>Log Scrim Terkini</span>
          </CardTitle>
          <CardDescription>5 hasil scrimmage terakhir</CardDescription>
        </div>
        <Link href="/matches">
          <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
            <span>Semua Match</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW: Responsive Scrim Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#242e40]/70">
          {matches.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Belum ada catatan match.
            </div>
          ) : (
            matches.map((m) => {
              const topFragger = m.playerStats[0];

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="block p-3.5 hover:bg-[#1c2432]/60 active:bg-[#1c2432] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2">
                      <img
                        src={getMapListViewIcon(m.map)}
                        alt={m.map}
                        className="w-7 h-7 rounded-md object-cover border border-[#242e40] bg-[#141a24] shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100">{m.map}</div>
                        <div className="text-[10px] text-slate-400">{m.matchDate}</div>
                      </div>
                    </div>

                    {/* Result & Score Badge */}
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-black tabular-nums tracking-wide">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-rose-400" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-slate-500 mx-1">-</span>
                        <span className="text-slate-400">{m.scoreOpponent}</span>
                      </div>
                      <Badge
                        variant={
                          m.result === "WIN"
                            ? "win"
                            : m.result === "LOSS"
                            ? "loss"
                            : "draw"
                        }
                        className="text-[10px] px-1.5 py-0.5 font-bold"
                      >
                        {m.result}
                      </Badge>
                    </div>
                  </div>

                  {/* Opponent & Side */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="font-bold text-slate-200 truncate">
                      vs {m.opponentName}
                    </span>
                    <Badge variant={m.startSide === "ATTACK" ? "attack" : "defense"} className="text-[10px] px-1.5 py-0.2">
                      {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                    </Badge>
                  </div>

                  {/* MVP Fragger */}
                  {topFragger && (
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#242e40]/50 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={getAgentIcon(topFragger.agent)}
                          alt={topFragger.agent}
                          className="w-5 h-5 rounded-full bg-[#141a24] border border-[#242e40] shrink-0 object-cover"
                        />
                        <span className="font-bold text-slate-200">{topFragger.player?.name}</span>
                        <span className="text-slate-400 text-[10px]">({topFragger.agent})</span>
                      </div>
                      <span className="font-bold text-sky-400 text-[10px]">
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
              <tr className="border-y border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Map</th>
                <th className="py-3 px-4">Lawan</th>
                <th className="py-3 px-4 text-center">Skor</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4 text-center">Sisi</th>
                <th className="py-3 px-4">MVP / Top Fragger</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242e40]/70 font-medium">
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Belum ada catatan match.
                  </td>
                </tr>
              ) : (
                matches.map((m) => {
                  const topFragger = m.playerStats[0];

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#1c2432]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <img
                            src={getMapListViewIcon(m.map)}
                            alt={m.map}
                            className="w-7 h-7 rounded-md object-cover border border-[#242e40] bg-[#141a24] shrink-0"
                          />
                          <span className="text-xs">{m.map}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 whitespace-nowrap text-sm">
                        {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-sm tracking-wider tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-rose-400" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-slate-500 mx-1.5">-</span>
                        <span className="text-slate-400">{m.scoreOpponent}</span>
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
                            className="w-6 h-6 rounded-full bg-[#141a24] border border-[#242e40] shrink-0 object-cover"
                          />
                          <span className="font-bold text-slate-100">{topFragger.player?.name || "Player"}</span>
                          <span className="text-slate-400 text-xs font-normal">({topFragger.agent})</span>
                          <span className="text-xs font-bold text-sky-400 ml-1">
                            {topFragger.acs} ACS
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
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
