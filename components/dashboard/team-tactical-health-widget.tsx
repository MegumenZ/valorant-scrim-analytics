"use client";

import React from "react";
import {
  BrainCircuit,
  Swords,
  MapPin,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamTacticalOverview } from "@/lib/utils/tactical-expert-engine";

interface TeamTacticalHealthWidgetProps {
  overview: TeamTacticalOverview;
}

export function TeamTacticalHealthWidget({ overview }: TeamTacticalHealthWidgetProps) {
  return (
    <Card className="bg-[#0F141C] border-[#1C2433] overflow-hidden shadow-sm">
      <CardHeader className="py-4 px-5 border-b border-[#1C2433] bg-[#090C10]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-white">
                  Kesehatan Taktis Tim
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
                  Analisis Kolektif
                </Badge>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Akumulasi evaluasi performa dari {overview.totalMatchesAnalyzed} pertandingan scrim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-[#94A3B8] font-medium">Nilai Kolektif:</span>
            <Badge
              variant={
                overview.overallGrade === "S" || overview.overallGrade === "A+" || overview.overallGrade === "A"
                  ? "win"
                  : overview.overallGrade === "B+" || overview.overallGrade === "B"
                  ? "draw"
                  : "loss"
              }
              className="text-xs font-black px-2.5 py-1"
            >
              Grade {overview.overallGrade} ({overview.averageScore}/100)
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Trade Rate Trend */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                Tren Spacing Tim
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${overview.tradeRateTrend.isImproving ? "text-emerald-400" : "text-rose-400"}`}>
                {overview.tradeRateTrend.isImproving ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {overview.tradeRateTrend.delta >= 0 ? `+${overview.tradeRateTrend.delta}%` : `${overview.tradeRateTrend.delta}%`}
              </span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {overview.tradeRateTrend.current}% <span className="text-xs font-normal text-[#94A3B8]">Trade Rate</span>
            </div>
            <p className="text-[10px] text-[#94A3B8]">Baseline: {overview.tradeRateTrend.baseline}%</p>
          </div>

          {/* Strongest Map */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Map Terkuat
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {overview.strongestMap ? `${overview.strongestMap.matchCount} Game` : "-"}
              </span>
            </div>
            <div className="text-xl font-black text-white">
              {overview.strongestMap ? overview.strongestMap.map : "-"}
            </div>
            <p className="text-[10px] text-emerald-400 font-medium">
              {overview.strongestMap ? `${overview.strongestMap.winrate}% Winrate Scrim` : "Belum ada data"}
            </p>
          </div>

          {/* Weakest Map */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Fokus Evaluasi Map
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {overview.weakestMap ? `${overview.weakestMap.matchCount} Game` : "-"}
              </span>
            </div>
            <div className="text-xl font-black text-white">
              {overview.weakestMap ? overview.weakestMap.map : "-"}
            </div>
            <p className="text-[10px] text-rose-400 font-medium">
              {overview.weakestMap ? `${overview.weakestMap.winrate}% Winrate Scrim` : "Belum ada data"}
            </p>
          </div>

          {/* Collective Health Score */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                Rata-rata Skor Taktis
              </span>
            </div>
            <div className="text-xl font-black text-sky-400 font-mono">
              {overview.averageScore} <span className="text-xs font-normal text-[#94A3B8]">/ 100</span>
            </div>
            <p className="text-[10px] text-[#94A3B8]">Fundamental Kolektif</p>
          </div>
        </div>

        {/* Actionable Coach Focus Box */}
        <div className="p-4 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#1C2433] pb-2">
            <span>Fokus Evaluasi Tim Minggu Ini (Prioritas Coach)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.topTeamPriorities.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#0F141C] border border-[#1C2433] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.urgency === "HIGH" ? "bg-rose-400" : "bg-sky-400"}`} />
                    <span className="text-xs font-bold text-white">
                      {item.title}
                    </span>
                  </div>
                  <Badge variant={item.urgency === "HIGH" ? "loss" : "outline"} className="text-[9px] py-0 px-1.5 font-bold">
                    {item.urgency === "HIGH" ? "Prioritas Tinggi" : "Pengembangan"}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-4">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
