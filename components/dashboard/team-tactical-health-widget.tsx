"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamTacticalOverview } from "@/lib/utils/tactical-expert-engine";
import { getMapListViewIcon } from "@/lib/data/valorant";

interface TeamTacticalHealthWidgetProps {
  overview: TeamTacticalOverview;
}

export function TeamTacticalHealthWidget({ overview }: TeamTacticalHealthWidgetProps) {
  const isHighGrade =
    overview.overallGrade === "S" ||
    overview.overallGrade === "A+" ||
    overview.overallGrade === "A";
  const isMidGrade =
    overview.overallGrade === "B+" || overview.overallGrade === "B";

  const gradeColor = isHighGrade
    ? "text-emerald-400 border-emerald-500/30"
    : isMidGrade
    ? "text-sky-400 border-sky-500/30"
    : "text-[#FF4655] border-[#FF4655]/40";

  return (
    <Card className="bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      {/* Tactical Telemetry Header */}
      <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              // UNIT HEALTH REPORT
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
                Kesehatan Taktis Tim
              </CardTitle>
              <span className="font-mono text-[10px] text-[#94A3B8] font-medium hidden sm:inline">
                [{overview.totalMatchesAnalyzed} SCRIMS ANALYZED]
              </span>
            </div>
          </div>

          {/* Inline Combat Grade Display */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider">
                Nilai Kolektif
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-[#94A3B8]">
                <span>SKOR:</span>
                <span className="text-white font-bold">{overview.averageScore}/100</span>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded bg-[#090C10] border font-tactical text-2xl font-black tracking-wider uppercase ${gradeColor}`}
            >
              GRADE {overview.overallGrade}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 4 Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Spacing & Trade Trend */}
          <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#1C2433] flex flex-col justify-between space-y-2 border-l-2 border-l-sky-400">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                // TREN SPACING TIM
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  overview.tradeRateTrend.isImproving
                    ? "text-emerald-400"
                    : "text-[#FF4655]"
                }`}
              >
                {overview.tradeRateTrend.delta >= 0
                  ? `▲ +${overview.tradeRateTrend.delta}%`
                  : `▼ ${overview.tradeRateTrend.delta}%`}
              </span>
            </div>
            <div>
              <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                {overview.tradeRateTrend.current}%
              </div>
              <div className="font-mono text-[11px] text-[#94A3B8] mt-0.5">
                BASELINE: {overview.tradeRateTrend.baseline}%
              </div>
            </div>
          </div>

          {/* 2. Strongest Map (with Map Silhouette / Tactical Icon) */}
          <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#1C2433] flex flex-col justify-between space-y-2 border-l-2 border-l-emerald-400">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                // MAP TERKUAT
              </span>
              <span className="font-mono text-[10px] text-[#94A3B8]">
                {overview.strongestMap
                  ? `${overview.strongestMap.matchCount} GAME`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
                  {overview.strongestMap ? overview.strongestMap.map : "N/A"}
                </div>
                <div className="font-mono text-[11px] font-bold text-emerald-400 mt-0.5">
                  {overview.strongestMap
                    ? `${overview.strongestMap.winrate}% WIN RATE`
                    : "Belum ada data"}
                </div>
              </div>
              {overview.strongestMap && (
                <img
                  src={getMapListViewIcon(overview.strongestMap.map)}
                  alt={overview.strongestMap.map}
                  className="w-10 h-10 rounded border border-emerald-500/30 object-cover shrink-0 bg-[#161D28]"
                />
              )}
            </div>
          </div>

          {/* 3. Weakest Map / Focus Evaluation (Danger Red Semantics) */}
          <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#1C2433] flex flex-col justify-between space-y-2 border-l-2 border-l-[#FF4655]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] font-semibold text-[#FF4655] uppercase tracking-wider">
                // FOKUS EVALUASI MAP
              </span>
              <span className="font-mono text-[10px] text-[#94A3B8]">
                {overview.weakestMap
                  ? `${overview.weakestMap.matchCount} GAME`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
                  {overview.weakestMap ? overview.weakestMap.map : "N/A"}
                </div>
                <div className="font-mono text-[11px] font-bold text-[#FF4655] mt-0.5">
                  {overview.weakestMap
                    ? `${overview.weakestMap.winrate}% WIN RATE`
                    : "Belum ada data"}
                </div>
              </div>
              {overview.weakestMap && (
                <img
                  src={getMapListViewIcon(overview.weakestMap.map)}
                  alt={overview.weakestMap.map}
                  className="w-10 h-10 rounded border border-[#FF4655]/40 object-cover shrink-0 bg-[#161D28]"
                />
              )}
            </div>
          </div>

          {/* 4. Collective Tactical Health Score */}
          <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#1C2433] flex flex-col justify-between space-y-2 border-l-2 border-l-sky-400">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                // SKOR FUNDAMENTAL
              </span>
            </div>
            <div>
              <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight tabular-nums">
                {overview.averageScore} <span className="text-base text-[#94A3B8] font-mono">/ 100</span>
              </div>
              <div className="font-mono text-[11px] text-[#94A3B8] mt-0.5">
                DISIPLIN TAKTIS TIM
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Coach Focus Box with Subtle Danger Glow on High Priority */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-[#090C10] border border-[#1C2433] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C2433] pb-2">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              // PRIORITAS EVALUASI COACH (MINGGU INI)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.topTeamPriorities.map((item, idx) => {
              const isHighUrgency = item.urgency === "HIGH";

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all space-y-1.5 ${
                    isHighUrgency
                      ? "bg-[#FF4655]/5 border-[#FF4655]/40 animate-pulse-subtle"
                      : "bg-[#0C1017] border-[#1C2433]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {item.title}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        isHighUrgency
                          ? "text-[#FF4655] border-[#FF4655]/40 bg-[#FF4655]/10"
                          : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                      }`}
                    >
                      {isHighUrgency ? "PRIORITAS TINGGI" : "PENGEMBANGAN"}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#94A3B8] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
