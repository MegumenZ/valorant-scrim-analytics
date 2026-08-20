import React from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchWithStats } from "@/lib/actions/matches";
import { getAgentIcon, getMapListViewIcon } from "@/lib/data/valorant";

interface RecentMatchesTableProps {
  matches: MatchWithStats[];
}

export function RecentMatchesTable({ matches }: RecentMatchesTableProps) {
  return (
    <Card className="bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
            // SCRIM INTELLIGENCE
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
            Log Scrim Terkini
          </CardTitle>
        </div>
        <Link href="/matches">
          <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 h-7 px-2.5 uppercase">
            <span>Semua Match</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {/* MOBILE VIEW: Responsive Scrim Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1C2433]">
          {matches.length === 0 ? (
            <div className="py-8 text-center font-mono text-[#64748B] text-xs">
              // NO_MATCH_RECORDS: Belum ada catatan match.
            </div>
          ) : (
            matches.map((m) => {
              const topFragger = m.playerStats[0];

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="block p-4 hover:bg-[#141A24] active:bg-[#1A2230] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getMapListViewIcon(m.map)}
                        alt={m.map}
                        className="w-8 h-8 rounded object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                      />
                      <div>
                        <div className="font-tactical font-black text-base text-white uppercase tracking-wide">
                          {m.map}
                        </div>
                        <div className="font-mono text-[10px] text-[#94A3B8]">{m.matchDate}</div>
                      </div>
                    </div>

                    {/* Result Tag */}
                    <div className="flex items-center gap-2">
                      <div className="font-tactical text-lg font-black tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#64748B] mx-1">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
                      </div>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          m.result === "WIN"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : m.result === "LOSS"
                            ? "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {m.result}
                      </span>
                    </div>
                  </div>

                  {/* Opponent & Side */}
                  <div className="flex items-center justify-between text-xs py-1 font-mono">
                    <span className="font-semibold text-[#F1F5F9] truncate">
                      VS {m.opponentName.toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        m.startSide === "ATTACK"
                          ? "text-[#FF4655] border-[#FF4655]/30 bg-[#FF4655]/10"
                          : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                      }`}
                    >
                      {m.startSide}
                    </span>
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
                        <span className="font-mono text-xs font-medium text-[#F1F5F9]">
                          {topFragger.player?.name}
                        </span>
                        <span className="font-mono text-[#64748B] text-[10px]">
                          ({topFragger.agent})
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-400">
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
              <tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-mono text-[10px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#1C2433]">
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center font-mono text-[#64748B]">
                    // NO_MATCH_RECORDS: Belum ada catatan match.
                  </td>
                </tr>
              ) : (
                matches.map((m) => {
                  const topFragger = m.playerStats[0];

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#141A24] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-[#94A3B8] whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-tactical text-base font-black text-white tracking-wide uppercase">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getMapListViewIcon(m.map)}
                            alt={m.map}
                            className="w-7 h-7 rounded object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                          />
                          <span>{m.map}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-white whitespace-nowrap">
                        VS {m.opponentName.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-lg font-black tracking-wide tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#64748B] mx-1">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            m.result === "WIN"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : m.result === "LOSS"
                              ? "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {m.result}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            m.startSide === "ATTACK"
                              ? "text-[#FF4655] border-[#FF4655]/30 bg-[#FF4655]/10"
                              : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                          }`}
                        >
                          {m.startSide}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {topFragger ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <img
                              src={getAgentIcon(topFragger.agent)}
                              alt={topFragger.agent}
                              className="w-6 h-6 rounded-full bg-[#161D28] border border-[#2A364F] shrink-0 object-cover"
                            />
                            <span className="font-mono text-xs font-bold text-white">
                              {topFragger.player?.name || "Player"}
                            </span>
                            <span className="font-mono text-[#64748B] text-[10px]">
                              ({topFragger.agent})
                            </span>
                            <span className="font-mono text-xs font-bold text-sky-400 ml-1">
                              {topFragger.acs} ACS
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-[#64748B]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/matches/${m.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 font-mono text-xs gap-1 hover:text-white hover:bg-[#1C2433]"
                          >
                            <span>DETAIL</span>
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
