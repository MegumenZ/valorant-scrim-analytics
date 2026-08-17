import React from "react";
import Link from "next/link";
import { Swords, ChevronRight, ExternalLink, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithStats } from "@/lib/actions/matches";
import { VALORANT_AGENTS } from "@/lib/data/valorant";

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
      <CardContent className="p-0 overflow-x-auto">
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
                const agentInfo = topFragger
                  ? VALORANT_AGENTS.find((a) => a.name === topFragger.agent)
                  : null;

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-[#1c2432]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {m.matchDate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      <span className="px-2.5 py-1 rounded-md bg-[#1c2432] border border-[#242e40] text-xs">
                        {m.map}
                      </span>
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
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: agentInfo?.color || "#FF4655" }}
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
      </CardContent>
    </Card>
  );
}
