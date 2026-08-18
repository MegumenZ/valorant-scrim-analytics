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
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#0c111a]/80">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#FF4655]" />
            <span>Log Scrim Terkini</span>
          </CardTitle>
          <CardDescription>5 hasil scrimmage kompetitif terakhir</CardDescription>
        </div>
        <Link href="/matches">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 font-display">
            <span>Semua Match</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW: Responsive Scrim Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1f2c42]/80">
          {matches.length === 0 ? (
            <div className="py-8 text-center text-[#54657e] font-mono-stat text-xs">
              // BELUM ADA CATATAN MATCH.
            </div>
          ) : (
            matches.map((m) => {
              const topFragger = m.playerStats[0];

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="block p-3.5 hover:bg-[#151e2e] active:bg-[#1a2538] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2">
                      <img
                        src={getMapListViewIcon(m.map)}
                        alt={m.map}
                        className="w-8 h-8 rounded object-cover border border-[#2b3d5c] bg-[#121824] shrink-0"
                      />
                      <div>
                        <div className="font-display font-bold text-xs uppercase text-white tracking-wider">{m.map}</div>
                        <div className="font-mono-stat text-[10px] text-[#8b9bb4]">{m.matchDate}</div>
                      </div>
                    </div>

                    {/* Result & Score Badge */}
                    <div className="flex items-center gap-1.5">
                      <div className="font-display text-base font-black tabular-nums tracking-wider">
                        <span className={m.result === "WIN" ? "text-[#10E7B2]" : m.result === "LOSS" ? "text-[#FF4655]" : "text-[#FFD166]"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#54657e] mx-1">-</span>
                        <span className="text-[#8b9bb4]">{m.scoreOpponent}</span>
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
                    <span className="font-display font-bold text-[#ece8e1] uppercase tracking-wide truncate">
                      VS {m.opponentName}
                    </span>
                    <Badge variant={m.startSide === "ATTACK" ? "attack" : "defense"}>
                      {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                    </Badge>
                  </div>

                  {/* MVP Fragger */}
                  {topFragger && (
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#1f2c42]/60 text-xs">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={getAgentIcon(topFragger.agent)}
                          alt={topFragger.agent}
                          className="w-5 h-5 rounded-full bg-[#121824] border border-[#2b3d5c] shrink-0 object-cover"
                        />
                        <span className="font-display font-bold text-[#ece8e1]">{topFragger.player?.name}</span>
                        <span className="font-mono-stat text-[#8b9bb4] text-[10px]">({topFragger.agent})</span>
                      </div>
                      <span className="font-mono-stat font-bold text-[#38bdf8] text-[11px]">
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
              <tr className="border-y border-[#1f2c42] bg-[#0a0f18] text-[#8b9bb4] font-display uppercase tracking-wider text-[11px] font-bold">
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
            <tbody className="divide-y divide-[#1f2c42]/60 font-medium">
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#54657e] font-mono-stat">
                    // BELUM ADA CATATAN MATCH.
                  </td>
                </tr>
              ) : (
                matches.map((m) => {
                  const topFragger = m.playerStats[0];

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#151e2e] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono-stat text-[#8b9bb4] whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-display font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <img
                            src={getMapListViewIcon(m.map)}
                            alt={m.map}
                            className="w-7 h-7 rounded object-cover border border-[#2b3d5c] bg-[#121824] shrink-0"
                          />
                          <span className="text-xs">{m.map}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-display font-bold text-white uppercase tracking-wide whitespace-nowrap text-sm">
                        {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-display font-black text-sm tracking-wider tabular-nums">
                        <span className={m.result === "WIN" ? "text-[#10E7B2]" : m.result === "LOSS" ? "text-[#FF4655]" : "text-[#FFD166]"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#54657e] mx-1.5">-</span>
                        <span className="text-[#8b9bb4]">{m.scoreOpponent}</span>
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
                              className="w-6 h-6 rounded-full bg-[#121824] border border-[#2b3d5c] shrink-0 object-cover"
                            />
                            <span className="font-display font-bold text-white">{topFragger.player?.name || "Player"}</span>
                            <span className="font-mono-stat text-[#8b9bb4] text-[10px]">({topFragger.agent})</span>
                            <span className="font-mono-stat text-xs font-bold text-[#38bdf8] ml-1">
                              {topFragger.acs} ACS
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#54657e] font-mono-stat">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/matches/${m.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1 hover:text-[#FF4655] hover:bg-[#FF4655]/10 font-display"
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
