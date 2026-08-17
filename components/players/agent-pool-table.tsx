import React from "react";
import { Crosshair } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { AgentStatSummary } from "@/lib/utils/analytics";
import { VALORANT_AGENTS } from "@/lib/data/valorant";

interface AgentPoolTableProps {
  agentPool: AgentStatSummary[];
}

export function AgentPoolTable({ agentPool }: AgentPoolTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crosshair className="w-4 h-4 text-rose-500" />
          <span>Efisiensi & Statistik Agent Pool</span>
        </CardTitle>
        <CardDescription>
          Distribusi win rate dan statistik tempur saat memainkan agent tertentu
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-y border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
              <th className="py-3 px-4">Agent</th>
              <th className="py-3 px-4 text-center">Match</th>
              <th className="py-3 px-4 text-center">Rekor (W-L)</th>
              <th className="py-3 px-4 text-right">Win Rate</th>
              <th className="py-3 px-4 text-right">Avg ACS</th>
              <th className="py-3 px-4 text-right">Avg ADR</th>
              <th className="py-3 px-4 text-right">K/D Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242e40]/70 font-medium">
            {agentPool.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Belum ada data pertandingan untuk pemain ini.
                </td>
              </tr>
            ) : (
              agentPool.map((stat) => {
                const agentInfo = VALORANT_AGENTS.find((a) => a.name === stat.agent);

                return (
                  <tr key={stat.agent} className="hover:bg-[#1c2432]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: agentInfo?.color || "#38BDF8" }}
                      />
                      <span>{stat.agent}</span>
                      {agentInfo && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({agentInfo.role})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-200">
                      {stat.matchesPlayed}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-emerald-400 font-bold">{stat.wins}W</span>
                      <span className="text-slate-500 mx-1">-</span>
                      <span className="text-rose-400 font-bold">{stat.losses}L</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                      <span className={stat.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}>
                        {stat.winRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sky-400 tabular-nums">
                      {stat.avgAcs}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-200 tabular-nums">
                      {stat.avgAdr}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                      <span
                        className={
                          stat.kdRatio >= 1.2
                            ? "text-emerald-400"
                            : stat.kdRatio >= 1.0
                            ? "text-slate-200"
                            : "text-rose-400"
                        }
                      >
                        {stat.kdRatio.toFixed(2)}
                      </span>
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
