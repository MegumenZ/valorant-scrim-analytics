"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Target,
  CheckCircle2,
  BrainCircuit,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TacticalMatchReport } from "@/lib/utils/tactical-expert-engine";

interface TacticalExpertCardProps {
  report: TacticalMatchReport;
}

export function TacticalExpertCard({ report }: TacticalExpertCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDiscordSummary = () => {
    const text = `📋 **RAPOR TAKTIS SCRIM - TEAM SC**
🎯 **Grade: ${report.grade} (${report.score}/100)** | ${report.momentum.trendLabel}

📝 **Ringkasan Evaluasi:**
${report.summary}

📊 **5 Pilar Fundamental Taktis:**
• Win Rate Ronde: ${report.pillars.roundWinRate}%
• Efisiensi Trade: ${report.pillars.tradeRate}%
• Ronde Pistol: ${report.pillars.pistolConversionRate}%
• Keseimbangan Sisi: ${report.pillars.sideBalanceScore}%
• Retake & Post-Plant: ${report.pillars.postPlantRetakeScore}%

✅ **Kekuatan Taktis Tim:**
${report.strengths.map((s) => `• ${s.title}: ${s.desc}`).join("\n")}

⚠️ **Celah & Evaluasi Kritis:**
${report.weaknesses.map((w) => `• ${w.title}: ${w.desc}`).join("\n")}

🎯 **Menu Latihan Taktis (Drill):**
${report.drills.map((d) => `• ${d.title}: ${d.desc}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
                <CardTitle className="text-sm font-bold text-white">
                  Rapor Taktis & Evaluasi Coach
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
                  Analisis Real-Time
                </Badge>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Diagnosis taktis otomatis & komparasi tren riwayat tim
              </p>
            </div>
          </div>

          {/* Tactical Grade & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyDiscordSummary}
              className="h-8 px-2.5 text-xs gap-1.5 text-[#94A3B8] hover:text-white hover:border-[#2A364F]"
              title="Salin ringkasan evaluasi untuk dibagikan ke Discord / WhatsApp tim"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-[11px]">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Salin Ringkasan</span>
                </>
              )}
            </Button>

            <span className="text-xs text-[#94A3B8] font-medium hidden md:inline">
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
        <div className="p-3.5 rounded-xl bg-[#090C10] border-l-4 border-l-amber-500 border border-[#1C2433] text-xs text-slate-200 leading-relaxed">
          <span className="font-bold text-amber-400 block mb-0.5">Ringkasan Evaluasi Taktis:</span>
          <span>{report.summary}</span>
        </div>

        {/* 5 Tactical Pillars Gauge */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] font-semibold block">Win Rate Ronde</span>
            <span className="text-sm font-black text-white font-mono">{report.pillars.roundWinRate}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] font-semibold block">Efisiensi Trade</span>
            <span className={`text-sm font-black font-mono ${report.pillars.tradeRate >= 55 ? "text-emerald-400" : "text-amber-400"}`}>
              {report.pillars.tradeRate}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] font-semibold block">Ronde Pistol</span>
            <span className={`text-sm font-black font-mono ${report.pillars.pistolConversionRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {report.pillars.pistolConversionRate}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090C10] border border-[#1C2433]">
            <span className="text-[10px] text-[#94A3B8] font-semibold block">Keseimbangan Sisi</span>
            <span className="text-sm font-black text-sky-400 font-mono">{report.pillars.sideBalanceScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090C10] border border-[#1C2433] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#94A3B8] font-semibold block">Retake & Post-Plant</span>
            <span className="text-sm font-black text-amber-400 font-mono">{report.pillars.postPlantRetakeScore}%</span>
          </div>
        </div>

        {/* 3 Pillars: Strengths, Weaknesses, Drills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Strengths */}
          <div className="p-4 rounded-xl bg-[#090C10] border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Kekuatan Taktis Tim</span>
            </div>
            <div className="space-y-3">
              {report.strengths.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-3.5">
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
              <span>Celah & Evaluasi Kritis</span>
            </div>
            <div className="space-y-3">
              {report.weaknesses.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-3.5">
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
              <span>Menu Latihan Taktis (Drill)</span>
            </div>
            <div className="space-y-3">
              {report.drills.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-3.5">
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
