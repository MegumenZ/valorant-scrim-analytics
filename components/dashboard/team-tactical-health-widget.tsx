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
      {/* Clean Tactical Header */}
      <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
              Kesehatan Taktis Tim
            </CardTitle>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Evaluasi performa dari {overview.totalMatchesAnalyzed} pertandingan scrim
            </p>
          </div>

          {/* Inline Grade Display */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-[#94A3B8] font-medium">
                Skor Fundamental
              </div>
              <div className="text-xs text-white font-bold tabular-nums">
                {overview.averageScore} / 100
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
              <span className="text-xs font-semibold text-[#94A3B8]">
                Tren Spacing Tim
              </span>
              <span
                className={`text-xs font-bold ${
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
              <div className="text-[11px] text-[#94A3B8] mt-0.5">
                Baseline: {overview.tradeRateTrend.baseline}%
              </div>
            </div>
          </div>

          {/* 2. Strongest Map */}
          <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#1C2433] flex flex-col justify-between space-y-2 border-l-2 border-l-emerald-400">
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs font-semibold text-emerald-400">
                Map Terkuat
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                {overview.strongestMap
                  ? `${overview.strongestMap.matchCount} Game`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
                  {overview.strongestMap ? overview.strongestMap.map : "-"}
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                  {overview.strongestMap
                    ? `${overview.strongestMap.winrate}% Win Rate`
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

          {/* 3. Weakest Map / Focus Evaluation */}
          <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#1C2433] flex flex-col justify-between space-y-2 border-l-2 border-l-[#FF4655]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs font-semibold text-[#FF4655]">
                Fokus Evaluasi Map
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                {overview.weakestMap
                  ? `${overview.weakestMap.matchCount} Game`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
                  {overview.weakestMap ? overview.weakestMap.map : "-"}
                </div>
                <div className="text-[11px] font-bold text-[#FF4655] mt-0.5">
                  {overview.weakestMap
                    ? `${overview.weakestMap.winrate}% Win Rate`
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
              <span className="text-xs font-semibold text-[#94A3B8]">
                Rata-rata Skor Taktis
              </span>
            </div>
            <div>
              <div className="font-tactical text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight tabular-nums">
                {overview.averageScore} <span className="text-base text-[#94A3B8] font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">
                Fundamental Tim
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Coach Focus Box with Subtle Danger Glow on High Priority */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-[#090C10] border border-[#1C2433] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C2433] pb-2">
            <span className="text-xs font-bold text-white">
              Prioritas Evaluasi Coach (Minggu Ini)
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
                    <span className="text-xs font-bold text-white">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isHighUrgency
                          ? "text-[#FF4655] border-[#FF4655]/40 bg-[#FF4655]/10"
                          : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                      }`}
                    >
                      {isHighUrgency ? "Prioritas Tinggi" : "Pengembangan"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
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
