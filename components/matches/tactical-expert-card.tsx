"use client";

import React from "react";
import {
  Shield,
  ShieldCheck,
  Swords,
  Crosshair,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
  Sparkles,
  Flame,
  Bomb,
  Clock,
  Split,
  Trophy,
  CheckCircle2,
  BrainCircuit,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TacticalMatchReport } from "@/lib/utils/tactical-expert-engine";

interface TacticalExpertCardProps {
  report: TacticalMatchReport;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-4 h-4 text-emerald-400" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  Crosshair: <Crosshair className="w-4 h-4 text-emerald-400" />,
  Trophy: <Trophy className="w-4 h-4 text-amber-400" />,
  CheckCircle2: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-sky-400" />,
  Flame: <Flame className="w-4 h-4 text-amber-400" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  TrendingDown: <TrendingDown className="w-4 h-4 text-rose-400" />,
  Bomb: <Bomb className="w-4 h-4 text-rose-400" />,
  Clock: <Clock className="w-4 h-4 text-amber-400" />,
  Split: <Split className="w-4 h-4 text-amber-400" />,
  Users: <Users className="w-4 h-4 text-sky-400" />,
  Target: <Target className="w-4 h-4 text-sky-400" />,
  ShieldAlert: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  Timer: <Clock className="w-4 h-4 text-sky-400" />,
};

export function TacticalExpertCard({ report }: TacticalExpertCardProps) {
  return (
    <Card className="bg-[#0F141C] border-[#1C2433] overflow-hidden shadow-sm">
      {/* Top Header */}
      <CardHeader className="py-4 px-5 border-b border-[#1C2433] bg-[#090C10]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                  Rapor Taktis & Evaluasi Coach
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  Real-Time Engine
                </Badge>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Diagnosis performa otomatis & sinkronisasi tren historis
              </p>
            </div>
          </div>

          {/* Tactical Grade & Momentum */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">
              {report.momentum.trendLabel}
            </span>
            <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${report.gradeBg} ${report.gradeBorder}`}>
              <span className={`text-base font-black tracking-tight ${report.gradeColor}`}>
                Grade {report.grade}
              </span>
              <span className="text-xs font-bold text-white font-mono">
                ({report.score}/100)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Executive Summary */}
        <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1C2433] text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Ringkasan Evaluasi Taktis:</span>
            <span>{report.summary}</span>
          </div>
        </div>

        {/* 5 Tactical Pillars Gauge */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] block">Round Winrate</span>
            <span className="text-sm font-black text-white font-mono">{report.pillars.roundWinRate}%</span>
          </div>
          <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] block">Trade Efficiency</span>
            <span className={`text-sm font-black font-mono ${report.pillars.tradeRate >= 55 ? "text-emerald-400" : "text-amber-400"}`}>
              {report.pillars.tradeRate}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] block">Pistol Control</span>
            <span className={`text-sm font-black font-mono ${report.pillars.pistolConversionRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {report.pillars.pistolConversionRate}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] block">Side Balance</span>
            <span className="text-sm font-black text-sky-400 font-mono">{report.pillars.sideBalanceScore}%</span>
          </div>
          <div className="p-2 rounded-lg bg-[#090C10] border border-[#1C2433] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#94A3B8] block">Retake / Post-Plant</span>
            <span className="text-sm font-black text-amber-400 font-mono">{report.pillars.postPlantRetakeScore}%</span>
          </div>
        </div>

        {/* 3 Pillars: Strengths, Weaknesses, Drills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Strengths */}
          <div className="p-4 rounded-xl bg-[#090C10] border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Kekuatan Taktis (What Went Well)</span>
            </div>
            <div className="space-y-2.5">
              {report.strengths.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    {ICON_MAP[item.icon] || <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Flaws */}
          <div className="p-4 rounded-xl bg-[#090C10] border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-rose-500/20 pb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Area Evaluasi (Critical Flaws)</span>
            </div>
            <div className="space-y-2.5">
              {report.weaknesses.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    {ICON_MAP[item.icon] || <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Actionable Drills */}
          <div className="p-4 rounded-xl bg-[#090C10] border border-sky-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 border-b border-sky-500/20 pb-2">
              <Target className="w-4 h-4 text-sky-400" />
              <span>Pekerjaan Rumah Coach (Drills)</span>
            </div>
            <div className="space-y-2.5">
              {report.drills.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    {ICON_MAP[item.icon] || <Target className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
