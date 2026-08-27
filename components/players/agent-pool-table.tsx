"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AgentStatSummary } from "@/lib/utils/analytics";
import { VALORANT_AGENTS, getAgentIcon } from "@/lib/data/valorant";
import { useTranslation } from "@/lib/i18n/context";

interface AgentPoolTableProps {
  agentPool: AgentStatSummary[];
}

export function AgentPoolTable({ agentPool }: AgentPoolTableProps) {
  const { t, language } = useTranslation();
  const isEn = language === "en";

  return (
    <Card className="bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
          {isEn ? "Agent Pool Statistics" : "Statistik Agent Pool"}
        </CardTitle>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          {isEn ? "Agent selection effectiveness and combat performance" : "Efektivitas pemilihan agent dan performa tempur"}
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-semibold text-[11px]">
              <th className="py-3 px-4 sticky left-0 bg-[#090C10] z-10">{t.matchDetail.agent}</th>
              <th className="py-3 px-4 text-center">{isEn ? "Matches" : "Match"}</th>
              <th className="py-3 px-4 text-center">{isEn ? "Record (W-L)" : "Rekor (W-L)"}</th>
              <th className="py-3 px-4 text-center">{t.dashboard.winRate}</th>
              <th className="py-3 px-4 text-center">Avg ACS</th>
              <th className="py-3 px-4 text-center">{isEn ? "K/D Ratio" : "K/D Ratio"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2433]">
            {agentPool.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                  {isEn ? "No match data available for this player." : "Belum ada data pertandingan untuk pemain ini."}
                </td>
              </tr>
            ) : (
              agentPool.map((stat) => {
                const agentInfo = VALORANT_AGENTS.find((a) => a.name === stat.agent);

                return (
                  <tr key={stat.agent} className="hover:bg-[#141A24] transition-colors group">
                    <td className="py-3 px-4 font-semibold text-white sticky left-0 bg-[#0C1017] group-hover:bg-[#141A24] z-10 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getAgentIcon(stat.agent)}
                          alt={stat.agent}
                          className="w-7 h-7 rounded-full bg-[#090C10] border border-[#1C2433] object-cover shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{stat.agent}</div>
                          {agentInfo && (
                            <div className="text-[10px] text-[#94A3B8] font-normal">
                              {agentInfo.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-[#94A3B8] tabular-nums font-medium">
                      {stat.matchesPlayed}
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums">
                      <span className="text-emerald-400 font-bold">{stat.wins}W</span>
                      <span className="text-[#64748B] mx-1">-</span>
                      <span className="text-[#FF4655] font-bold">{stat.losses}L</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-tactical text-base font-bold tabular-nums">
                      <span className={stat.winRate >= 50 ? "text-emerald-400" : "text-[#FF4655]"}>
                        {stat.winRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-tactical text-base font-bold text-sky-400 tabular-nums">
                      {stat.avgAcs}
                    </td>
                    <td className="py-3.5 px-4 text-center font-tactical text-base font-bold tabular-nums">
                      <span
                        className={
                          stat.kdRatio >= 1.2
                            ? "text-emerald-400"
                            : stat.kdRatio >= 1.0
                            ? "text-white"
                            : "text-[#FF4655]"
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
