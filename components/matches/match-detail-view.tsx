"use client";
/* eslint-disable @next/next/no-img-element -- Native Valorant art and database attachment previews avoid Vercel image optimization usage. */

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Trophy,
  Tv,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Crown,
  Download,
  ExternalLink,
  Eye,
  X,
  Image as ImageIcon,
  Swords,
  Crosshair,
  Bomb,
  ShieldCheck,
  Timer,
  Sparkles,
  Share2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithStats, deleteMatch } from "@/lib/actions/matches";
import { MAP_METADATA, ValorantMap, VALORANT_AGENTS, getAgentIcon, getMapSplash } from "@/lib/data/valorant";
import { useUserRole } from "../layout/role-context";
import { MatchAttachment } from "@/lib/db/schema";
import { calculateKD } from "@/lib/utils/calculations";
import { canShowMvp, getVisibleScoreboardColumns, sortScoreboardRows } from "@/lib/utils/match-scoreboard";
import { formatFileSize } from "@/lib/utils/file-compressor";
import { RoundOutcomeType, RoundWinType } from "@/lib/validations/match";
import { getOutcomeConfig } from "@/components/matches/match-entry-form";
import { evaluateMatchTactics } from "@/lib/utils/tactical-expert-engine";
import { TacticalExpertCard } from "@/components/matches/tactical-expert-card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useTranslation } from "@/lib/i18n/context";
import { translateCoachNotes } from "@/lib/utils/note-translator";

interface MatchDetailViewProps {
  match: MatchWithStats;
  pastMatches?: MatchWithStats[];
}

export function MatchDetailView({ match, pastMatches = [] }: MatchDetailViewProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MatchAttachment | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<MatchAttachment | null>(null);
  const imageDialogRef = useRef<HTMLDivElement>(null);
  const pdfDialogRef = useRef<HTMLDivElement>(null);
  const imageDialogTitleId = useId();
  const pdfDialogTitleId = useId();
  const [showTranslatedNotes, setShowTranslatedNotes] = useState(false);

  const attachments: MatchAttachment[] = match.parsedAttachments || [];

  const mapMeta = MAP_METADATA[match.map as ValorantMap] || {
    name: match.map,
    location: "Valorant Protocol Site",
    callout: "Standard Tactical Arena",
    color: "from-slate-900 to-slate-950",
    splash: getMapSplash(match.map),
    listViewIcon: "",
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteMatch(match.id);
      if (!res.success) {
        throw new Error(res.error || "Gagal menghapus match");
      }
      router.push("/matches");
      router.refresh();
    } catch (err: any) {
      alert("Gagal menghapus match: " + (err.message || "Unknown error"));
      setIsDeleting(false);
    }
  };

  const [isCopiedSummary, setIsCopiedSummary] = useState(false);

  useEffect(() => {
    if (!selectedImage && !selectedPdf) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = selectedImage ? imageDialogRef.current : pdfDialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSelectedImage(null); setSelectedPdf(null); }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [href], iframe, [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
  }, [selectedImage, selectedPdf]);

  const sortedStats = sortScoreboardRows(match.playerStats);
  const topFragger = sortedStats[0];
  const scoreboardColumns = getVisibleScoreboardColumns(match.playerStats);
  const showMvp = canShowMvp(match.playerStats);

  const handleCopyMatchSummary = () => {
    const topFraggerKd = topFragger ? calculateKD(topFragger.kills, topFragger.deaths) : 0;
    const resultEmoji = match.result === "WIN" ? "✅ WIN" : match.result === "LOSS" ? "❌ LOSS" : "⚖️ DRAW";

    const text = isEn
      ? `🎮 **SCRIM MATCH SUMMARY - TEAM SC**
🗺️ **Map:** ${match.map} (${match.startSide === "ATTACK" ? "Attack" : "Defense"} Start) | 📅 ${match.matchDate}
🏆 **Result:** Team SC **${match.scoreTeam} - ${match.scoreOpponent}** ${match.opponentName} (${resultEmoji})

${showMvp ? "👑 **MVP:**" : "**Top Fragger:**"} ${topFragger?.player?.name || "Player"} (${topFragger?.agent}) - ${topFragger?.acs ?? "—"} ACS | ${topFragger?.kills}/${topFragger?.deaths}/${topFragger?.assists} (${topFraggerKd.toFixed(2)} KD)

📊 **Team SC Scoreboard:**
${sortedStats.map((p, idx) => `${idx + 1}. **${p.player.name}** (${p.agent}) ➔ **${p.acs ?? "—"} ACS** | ${p.kills}/${p.deaths}/${p.assists} | ${p.firstKills} FK${(p.clutchesWon ?? 0) > 0 ? ` | ${p.clutchesWon} Clutch` : ""}`).join("\n")}`
      : `🎮 **SCRIM MATCH SUMMARY - TEAM SC**
🗺️ **Map:** ${match.map} (${match.startSide === "ATTACK" ? "Attack" : "Defense"} Start) | 📅 ${match.matchDate}
🏆 **Hasil:** Team SC **${match.scoreTeam} - ${match.scoreOpponent}** ${match.opponentName} (${resultEmoji})

${showMvp ? "👑 **MVP:**" : "**Top Fragger:**"} ${topFragger?.player?.name || "Player"} (${topFragger?.agent}) - ${topFragger?.acs ?? "—"} ACS | ${topFragger?.kills}/${topFragger?.deaths}/${topFragger?.assists} (${topFraggerKd.toFixed(2)} KD)

📊 **Scoreboard Tim SC:**
${sortedStats.map((p, idx) => `${idx + 1}. **${p.player.name}** (${p.agent}) ➔ **${p.acs ?? "—"} ACS** | ${p.kills}/${p.deaths}/${p.assists} | ${p.firstKills} FK${(p.clutchesWon ?? 0) > 0 ? ` | ${p.clutchesWon} Clutch` : ""}`).join("\n")}`;

    navigator.clipboard.writeText(text.trim());
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2500);
  };

  const handleDownload = (attachment: MatchAttachment) => {
    const link = document.createElement("a");
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Bar Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-[#94A3B8] hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>{t.matchDetail.backToHistory}</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {/* One-Click Share to Discord / WhatsApp */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMatchSummary}
            className="gap-1.5 text-xs text-[#94A3B8] hover:text-white"
            title={t.matchDetail.shareToDiscord}
          >
            {isCopiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">{t.matchDetail.copiedToClipboard}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.matchDetail.shareToDiscord}</span>
              </>
            )}
          </Button>

          {isAdmin && (
            <>
              <Link href={`/matches/${match.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Edit className="w-3.5 h-3.5" />
                  <span>{t.matchDetail.editMatch}</span>
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.matchDetail.deleteMatch}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MATCH HERO BANNER WITH MAP BANNER */}
      <div className="relative overflow-hidden rounded-xl border border-[#1C2433] bg-[#0F141C] p-6 sm:p-8 shadow-sm min-h-[160px] flex items-center">
        {/* Background Map Banner */}
        {mapMeta.listViewIcon && (
          <img
            src={mapMeta.listViewIcon} width={1280} height={720}
            alt={match.map}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-luminosity scale-105 pointer-events-none"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F141C] via-[#0F141C]/90 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#161D28] border border-[#2A364F] text-xs font-bold text-white">
                {match.map}
              </span>
              <span className="text-xs text-[#94A3B8] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                {match.matchDate}
              </span>
              <Badge variant={match.startSide === "ATTACK" ? "attack" : "defense"}>
                {isEn ? "Start: " : "Mulai: "}
                {match.startSide === "ATTACK" ? t.common.attack : t.common.defense}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Team SC <span className="text-[#64748B] font-normal">vs</span> <span className="text-[#FF4655]">{match.opponentName}</span>
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              {isEn ? "Location: " : "Lokasi: "}{mapMeta.location}
            </p>
          </div>

          {/* Clean Modern Score Box */}
          <div className="flex items-center gap-4 bg-[#090C10]/95 backdrop-blur-sm px-6 py-4 rounded-xl border border-[#1C2433] shrink-0 shadow-sm">
            <div className="text-center">
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase">Team SC</div>
              <div className={`text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight ${
                match.result === "WIN" ? "text-emerald-400" : match.result === "LOSS" ? "text-rose-400" : "text-amber-400"
              }`}>
                {match.scoreTeam}
              </div>
            </div>
            <div className="text-2xl font-bold text-[#64748B]">:</div>
            <div className="text-center">
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase">{isEn ? "Opponent" : "Lawan"}</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#F1F5F9] tabular-nums tracking-tight">
                {match.scoreOpponent}
              </div>
            </div>
            <div className="ml-2 pl-4 border-l border-[#1C2433]">
              <Badge
                variant={
                  match.result === "WIN"
                    ? "win"
                    : match.result === "LOSS"
                    ? "loss"
                    : "draw"
                }
                className="text-xs px-3 py-1 font-bold"
              >
                {match.result === "WIN" ? t.common.win.toUpperCase() : match.result === "LOSS" ? t.common.loss.toUpperCase() : t.common.draw.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* TACTICAL EXPERT & COACH EVALUATION CARD */}
      {match.parsedRoundTimeline && match.parsedRoundTimeline.length > 0 && match.parsedRoundTimeline.some((round) => round.tradedDeaths != null || round.tradesWon != null) && (() => {
        const tacticalReport = evaluateMatchTactics(match, pastMatches, language);
        return tacticalReport ? <TacticalExpertCard report={tacticalReport} /> : null;
      })()}

      {/* MATCH PERFORMANCE SCOREBOARD */}
      <Card className="bg-[#0F141C] border-[#1C2433]">
        <CardHeader className="py-4 px-5 border-b border-[#1C2433]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-white">{t.matchDetail.scoreboardTitle}</CardTitle>
            <span className="text-xs text-[#94A3B8]">{t.matchDetail.scoreboardSubtitle}</span>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-max text-left border-collapse text-xs">
            <thead><tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-semibold text-[11px] uppercase">
              <th className="sticky left-0 z-10 bg-[#090C10] px-4 py-3">{t.matchDetail.player}</th>
              <th className="px-4 py-3">{t.matchDetail.agent}</th>
              <th className="px-4 py-3 text-center">{t.matchDetail.kda}</th>
              <th className="px-4 py-3 text-center">{t.matchDetail.kdRatio}</th>
              {scoreboardColumns.firstKills && <th className="px-4 py-3 text-center">{t.matchDetail.firstBlood}</th>}
              {scoreboardColumns.plants && <th className="px-4 py-3 text-center">Plants</th>}
              {scoreboardColumns.defuses && <th className="px-4 py-3 text-center">Defuses</th>}
              {scoreboardColumns.acs && <th className="px-4 py-3 text-right">{t.matchDetail.acs}</th>}
              {scoreboardColumns.adr && <th className="px-4 py-3 text-right">ADR</th>}
              {scoreboardColumns.hsPercent && <th className="px-4 py-3 text-right">HS%</th>}
              {scoreboardColumns.kastPercent && <th className="px-4 py-3 text-right">KAST%</th>}
              {scoreboardColumns.firstDeaths && <th className="px-4 py-3 text-center">FD</th>}
              {scoreboardColumns.clutchesWon && <th className="px-4 py-3 text-center">{t.matchDetail.clutch}</th>}
            </tr></thead>
            <tbody className="divide-y divide-[#1C2433]">
              {sortedStats.map((stat, idx) => {
                const kd = calculateKD(stat.kills, stat.deaths);
                const isMvpRow = showMvp && idx === 0;
                return <tr key={stat.id} className={`group transition-colors hover:bg-[#141A24] ${isMvpRow ? "bg-amber-500/5" : ""}`}>
                  <td className="sticky left-0 z-10 bg-[#0C1017] px-4 py-3.5 font-bold text-[#F1F5F9] transition-colors group-hover:bg-[#141A24]">
                    <div className="flex items-center gap-2">
                      {isMvpRow && <Crown aria-label="MVP" className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                      <Link href={`/players/${stat.playerId}`} className="whitespace-nowrap hover:text-rose-400">{stat.player.name}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><img src={getAgentIcon(stat.agent)} width={28} height={28} loading="lazy" decoding="async" alt={stat.agent} className="h-7 w-7 rounded-full border border-[#2A364F] bg-[#161D28] object-cover" /><span className="font-semibold text-[#F1F5F9]">{stat.agent}</span></div></td>
                  <td className="px-4 py-3.5 text-center font-bold tabular-nums"><span className="text-emerald-400">{stat.kills}</span><span className="mx-1 text-[#64748B]">/</span><span className="text-rose-400">{stat.deaths}</span><span className="mx-1 text-[#64748B]">/</span><span className="text-sky-400">{stat.assists}</span></td>
                  <td className="px-4 py-3.5 text-center font-bold tabular-nums"><span className={kd >= 1.2 ? "text-emerald-400" : kd >= 1 ? "text-[#F1F5F9]" : "text-rose-400"}>{kd.toFixed(2)}</span></td>
                  {scoreboardColumns.firstKills && <td className="px-4 py-3.5 text-center tabular-nums">{stat.firstKills ?? "—"}</td>}
                  {scoreboardColumns.plants && <td className="px-4 py-3.5 text-center tabular-nums">{stat.plants ?? "—"}</td>}
                  {scoreboardColumns.defuses && <td className="px-4 py-3.5 text-center tabular-nums">{stat.defuses ?? "—"}</td>}
                  {scoreboardColumns.acs && <td className="px-4 py-3.5 text-right font-black tabular-nums text-rose-400">{stat.acs ?? "—"}</td>}
                  {scoreboardColumns.adr && <td className="px-4 py-3.5 text-right tabular-nums">{stat.adr ?? "—"}</td>}
                  {scoreboardColumns.hsPercent && <td className="px-4 py-3.5 text-right tabular-nums">{stat.hsPercent == null ? "—" : `${stat.hsPercent}%`}</td>}
                  {scoreboardColumns.kastPercent && <td className="px-4 py-3.5 text-right tabular-nums">{stat.kastPercent == null ? "—" : `${stat.kastPercent}%`}</td>}
                  {scoreboardColumns.firstDeaths && <td className="px-4 py-3.5 text-center tabular-nums">{stat.firstDeaths ?? "—"}</td>}
                  {scoreboardColumns.clutchesWon && <td className="px-4 py-3.5 text-center tabular-nums">{stat.clutchesWon ?? "—"}</td>}
                </tr>;
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {(match.opponentPlayerStats?.length ?? 0) > 0 && (() => {
        const opponentRows = match.opponentPlayerStats ?? [];
        const opponentColumns = getVisibleScoreboardColumns(opponentRows);
        return <Card className="bg-[#0F141C] border-[#1C2433]">
          <CardHeader className="py-4 px-5 border-b border-[#1C2433]"><CardTitle className="text-base font-bold text-white">{match.opponentName}</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-max text-left text-xs">
              <thead><tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] text-[11px] uppercase">
                <th className="px-4 py-3">{t.matchDetail.player}</th><th className="px-4 py-3">{t.matchDetail.agent}</th>
                <th className="px-4 py-3 text-center">{t.matchDetail.kda}</th><th className="px-4 py-3 text-center">{t.matchDetail.kdRatio}</th>
                {opponentColumns.firstKills && <th className="px-4 py-3 text-center">{t.matchDetail.firstBlood}</th>}
                {opponentColumns.plants && <th className="px-4 py-3 text-center">Plants</th>}
                {opponentColumns.defuses && <th className="px-4 py-3 text-center">Defuses</th>}
              </tr></thead>
              <tbody className="divide-y divide-[#1C2433]">{opponentRows.map((stat) => {
                const kd = calculateKD(stat.kills, stat.deaths);
                return <tr key={stat.id}>
                  <td className="px-4 py-3 font-semibold text-white">{stat.displayName}</td><td className="px-4 py-3 text-slate-300">{stat.agent}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">{stat.kills}/{stat.deaths}/{stat.assists}</td><td className="px-4 py-3 text-center font-mono tabular-nums">{kd.toFixed(2)}</td>
                  {opponentColumns.firstKills && <td className="px-4 py-3 text-center font-mono tabular-nums">{stat.firstKills ?? "—"}</td>}
                  {opponentColumns.plants && <td className="px-4 py-3 text-center font-mono tabular-nums">{stat.plants ?? "—"}</td>}
                  {opponentColumns.defuses && <td className="px-4 py-3 text-center font-mono tabular-nums">{stat.defuses ?? "—"}</td>}
                </tr>;
              })}</tbody>
            </table>
          </CardContent>
        </Card>;
      })()}

      {/* ROUND PROGRESSION TIMELINE (IF RECORDED) */}
      {match.parsedRoundTimeline && match.parsedRoundTimeline.length > 0 && (
        <Card className="bg-[#0F141C] border-[#1C2433]">
          <CardHeader className="py-3.5 px-5 border-b border-[#1C2433]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                <Swords className="w-4 h-4 text-[#FF4655]" />
                <span>{t.matchDetail.roundProgressionTitle}</span>
              </CardTitle>

              {/* Half Score Summaries */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                {(() => {
                  const h1 = match.parsedRoundTimeline.slice(0, 12);
                  const h1Wins = h1.filter((r) => r.winner === "TEAM").length;
                  const h1Loss = h1.filter((r) => r.winner === "OPPONENT").length;

                  const h2 = match.parsedRoundTimeline.slice(12, 24);
                  const h2Wins = h2.filter((r) => r.winner === "TEAM").length;
                  const h2Loss = h2.filter((r) => r.winner === "OPPONENT").length;

                  return (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#090C10] border border-[#1C2433] text-[#94A3B8]">
                        {isEn ? "1st Half: " : "Babak 1: "}<strong className="text-white">{h1Wins}-{h1Loss}</strong>
                      </span>
                      {h2.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#090C10] border border-[#1C2433] text-[#94A3B8]">
                          {isEn ? "2nd Half: " : "Babak 2: "}<strong className="text-white">{h2Wins}-{h2Loss}</strong>
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Babak 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{isEn ? "1st Half (R1 - R12)" : "Babak 1 (R1 - R12)"}</span>
                  <Badge variant={match.startSide === "ATTACK" ? "attack" : "defense"} className="text-[10px] py-0 px-2">
                    {match.startSide === "ATTACK" ? t.common.attack : t.common.defense}
                  </Badge>
                </div>
                <span className="text-[11px] text-[#94A3B8]">{isEn ? "Pistol Round: R1" : "Pistol Round: R1"}</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                {match.parsedRoundTimeline.slice(0, 12).map((item) => {
                  const isWin = item.winner === "TEAM";
                  const isPistol = item.round === 1;
                  const outcomeConfig = getOutcomeConfig(item.side, item.winner, item.outcomeType || item.winType, language);

                  return (
                    <div
                      key={item.round}
                      className={`rounded-xl border p-1.5 flex flex-col items-center justify-between gap-1 select-none ${
                        isWin
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#94A3B8]">
                        <span>R{item.round}</span>
                        {isPistol && (
                          <span title="Pistol Round">
                            <Crosshair className="w-2.5 h-2.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-base font-black tracking-wider py-0.5">
                        {isWin ? "W" : "L"}
                      </span>
                      <span
                        title={`${isWin ? (isEn ? "Win Method" : "Cara Menang") : (isEn ? "Loss Reason" : "Cara Kalah")}: ${outcomeConfig.label}`}
                        className={`w-full py-0.5 px-0.5 rounded text-[8px] sm:text-[9px] font-bold border truncate text-center ${outcomeConfig.bg} ${outcomeConfig.border} ${outcomeConfig.color}`}
                      >
                        {outcomeConfig.short}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Babak 2 */}
            {match.parsedRoundTimeline.length > 12 && (
              <div className="space-y-2 pt-2 border-t border-[#1C2433]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{isEn ? "2nd Half (R13 - R24)" : "Babak 2 (R13 - R24)"}</span>
                    <Badge variant={match.startSide === "ATTACK" ? "defense" : "attack"} className="text-[10px] py-0 px-2">
                      {match.startSide === "ATTACK" ? t.common.defense : t.common.attack}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">{isEn ? "Pistol Round: R13" : "Pistol Round: R13"}</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                  {match.parsedRoundTimeline.slice(12, 24).map((item) => {
                    const isWin = item.winner === "TEAM";
                    const isPistol = item.round === 13;
                    const outcomeConfig = getOutcomeConfig(item.side, item.winner, item.outcomeType || item.winType, language);

                    return (
                      <div
                        key={item.round}
                        className={`rounded-xl border p-1.5 flex flex-col items-center justify-between gap-1 select-none ${
                          isWin
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#94A3B8]">
                          <span>R{item.round}</span>
                          {isPistol && (
                            <span title="Pistol Round">
                              <Crosshair className="w-2.5 h-2.5 text-amber-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-base font-black tracking-wider py-0.5">
                          {isWin ? "W" : "L"}
                        </span>
                        <span
                          title={`${isWin ? (isEn ? "Win Method" : "Cara Menang") : (isEn ? "Loss Reason" : "Cara Kalah")}: ${outcomeConfig.label}`}
                          className={`w-full py-0.5 px-0.5 rounded text-[8px] sm:text-[9px] font-bold border truncate text-center ${outcomeConfig.bg} ${outcomeConfig.border} ${outcomeConfig.color}`}
                        >
                          {outcomeConfig.short}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Babak Overtime */}
            {match.parsedRoundTimeline.length > 24 && (
              <div className="space-y-2 pt-2 border-t border-[#1C2433]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">{isEn ? "Overtime (OT)" : "Babak Overtime (OT)"}</span>
                  <span className="text-[11px] text-[#94A3B8]">{match.parsedRoundTimeline.length - 24} {isEn ? "Extra Rounds" : "Ronde Tambahan"}</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                  {match.parsedRoundTimeline.slice(24).map((item) => {
                    const isWin = item.winner === "TEAM";
                    const outcomeConfig = getOutcomeConfig(item.side, item.winner, item.outcomeType || item.winType, language);

                    return (
                      <div
                        key={item.round}
                        className={`rounded-xl border p-1.5 flex flex-col items-center justify-between gap-1 select-none ${
                          isWin
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#94A3B8]">
                          <span>R{item.round}</span>
                        </div>
                        <span className="text-base font-black tracking-wider py-0.5">
                          {isWin ? "W" : "L"}
                        </span>
                        <span
                          title={`${isWin ? (isEn ? "Win Method" : "Cara Menang") : (isEn ? "Loss Reason" : "Cara Kalah")}: ${outcomeConfig.label}`}
                          className={`w-full py-0.5 px-0.5 rounded text-[8px] sm:text-[9px] font-bold border truncate text-center ${outcomeConfig.bg} ${outcomeConfig.border} ${outcomeConfig.color}`}
                        >
                          {outcomeConfig.short}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TACTICAL BREAKDOWN PANEL */}
            {(() => {
              const teamWins = match.parsedRoundTimeline.filter(r => r.winner === "TEAM");
              const teamLosses = match.parsedRoundTimeline.filter(r => r.winner === "OPPONENT");

              const defuseWins = teamWins.filter(r => (r.outcomeType || r.winType) === "DEFUSE").length;
              const detonationWins = teamWins.filter(r => (r.outcomeType || r.winType) === "DETONATION").length;
              const timeWins = teamWins.filter(r => (r.outcomeType || r.winType) === "TIME").length;
              const elimWins = teamWins.filter(r => !(r.outcomeType || r.winType) || (r.outcomeType || r.winType) === "ELIMINATION").length;

              const defusedLosses = teamLosses.filter(r => (r.outcomeType || r.winType) === "DEFUSE").length;
              const detonationLosses = teamLosses.filter(r => (r.outcomeType || r.winType) === "DETONATION").length;
              const timeoutLosses = teamLosses.filter(r => (r.outcomeType || r.winType) === "TIME").length;
              const elimLosses = teamLosses.filter(r => !(r.outcomeType || r.winType) || (r.outcomeType || r.winType) === "ELIMINATION").length;

              return (
                <div className="space-y-3 pt-2">
                  {/* Cara Menang */}
                  <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        {isEn ? `Team Round Win Methods (${teamWins.length} Rounds)` : `Distribusi Cara Menang Tim (${teamWins.length} Ronde)`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-2.5 rounded-lg bg-[#0F141C] border border-sky-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-sky-400 block">Retake / Defuse</span>
                        <div className="text-lg font-black text-white">{defuseWins}</div>
                        <p className="text-[9px] text-[#94A3B8]">Defender Defuse</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0F141C] border border-amber-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 block">Post-Plant (Boom)</span>
                        <div className="text-lg font-black text-white">{detonationWins}</div>
                        <p className="text-[9px] text-[#94A3B8]">Spike Detonated</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0F141C] border border-rose-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-rose-400 block">{isEn ? "Elimination" : "Eliminasi"}</span>
                        <div className="text-lg font-black text-white">{elimWins}</div>
                        <p className="text-[9px] text-[#94A3B8]">{isEn ? "Team Wiped" : "Duel Bersih"}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0F141C] border border-emerald-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 block">{isEn ? "Site Stall (0:00)" : "Waktu Habis (0:00)"}</span>
                        <div className="text-lg font-black text-white">{timeWins}</div>
                        <p className="text-[9px] text-[#94A3B8]">{isEn ? "On Defense" : "Saat Defense"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cara Kalah */}
                  {teamLosses.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-2.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white">
                          {isEn ? `Conceded Round Reasons (${teamLosses.length} Rounds)` : `Distribusi Cara Kalah Tim (${teamLosses.length} Ronde)`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="p-2.5 rounded-lg bg-[#0F141C] border border-sky-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-sky-400 block">{isEn ? "Enemy Retake" : "Musuh Retake"}</span>
                          <div className="text-lg font-black text-white">{defusedLosses}</div>
                          <p className="text-[9px] text-[#94A3B8]">{isEn ? "Failed Post-Plant" : "Gagal Tahan Spike"}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#0F141C] border border-amber-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 block">{isEn ? "Enemy Detonation" : "Spike Musuh Boom"}</span>
                          <div className="text-lg font-black text-white">{detonationLosses}</div>
                          <p className="text-[9px] text-[#94A3B8]">{isEn ? "Failed Defuse" : "Gagal Retake"}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#0F141C] border border-rose-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-rose-400 block">{isEn ? "Eliminated" : "Tereliminasi"}</span>
                          <div className="text-lg font-black text-white">{elimLosses}</div>
                          <p className="text-[9px] text-[#94A3B8]">Wiped Out</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#0F141C] border border-emerald-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 block">{isEn ? "Plant Failed (0:00)" : "Gagal Plant (0:00)"}</span>
                          <div className="text-lg font-black text-white">{timeoutLosses}</div>
                          <p className="text-[9px] text-[#94A3B8]">{isEn ? "On Attack" : "Saat Attack"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* TACTICAL EVALUATION, ATTACHMENTS & VOD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tactical Notes & Coach Attachments Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>{t.matchDetail.coachNotesTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                {match.notes && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTranslatedNotes(!showTranslatedNotes)}
                    className="h-6 px-2 text-[10px] text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 rounded border border-sky-500/30"
                  >
                    {showTranslatedNotes ? t.matchDetail.originalNotes : t.matchDetail.translateNotes}
                  </Button>
                )}
                {attachments.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#94A3B8] bg-[#090C10] px-2 py-0.5 rounded-full border border-[#1C2433]">
                    {attachments.length} {isEn ? "Files" : "Berkas"}
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-300 space-y-4">
            {/* Notes Body */}
            {match.notes ? (
              <div className="space-y-1.5">
                <p className="whitespace-pre-wrap bg-[#090C10] p-4 rounded-xl border border-[#1C2433]">
                  {showTranslatedNotes ? translateCoachNotes(match.notes) : match.notes}
                </p>
                {showTranslatedNotes && (
                  <p className="text-[10px] text-sky-400 italic">
                    * Automated tactical English translation for team leadership review.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                {t.matchDetail.noNotes}
              </p>
            )}

            {/* Attachments Gallery */}
            {attachments.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#1C2433]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.matchDetail.attachmentsSubtitle}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-[#090C10] border border-[#1C2433] hover:border-[#2A364F] transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.type === "image" ? (
                          <button
                            type="button"
                            aria-label={isEn ? `Preview ${att.name}` : `Pratinjau ${att.name}`}
                            onClick={() => setSelectedImage(att)}
                            className="h-11 w-11 rounded-lg bg-[#161D28] border border-[#2A364F] overflow-hidden shrink-0 cursor-pointer relative group/thumb"
                          >
                            <img
                              src={att.dataUrl} width={1600} height={900} loading="lazy" decoding="async"
                              alt={att.name}
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            aria-label={isEn ? `Preview ${att.name}` : `Pratinjau ${att.name}`}
                            onClick={() => setSelectedPdf(att)}
                            className="h-11 w-11 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0 cursor-pointer hover:bg-rose-500/20 transition-colors"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            onClick={() => att.type === "image" ? setSelectedImage(att) : setSelectedPdf(att)}
                            className="text-xs font-bold text-slate-200 truncate cursor-pointer hover:text-rose-400 transition-colors"
                            title={att.name}
                          >
                            {att.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-[#161D28] border border-[#2A364F] text-emerald-400 font-semibold uppercase">
                              {att.type === "image" ? "Image" : "PDF"}
                            </span>
                            <span>{formatFileSize(att.sizeBytes)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Players */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#1C2433]">
                        {att.type === "image" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedImage(att)}
                            className="flex-1 h-7 text-[11px] gap-1 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isEn ? "View" : "Lihat"}</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPdf(att)}
                            className="flex-1 h-7 text-[11px] gap-1 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isEn ? "Open PDF" : "Buka PDF"}</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(att)}
                          className="h-7 px-2.5 text-[11px] gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold"
                          title={t.matchDetail.downloadAttachment}
                        >
                          <Download className="w-3 h-3" />
                          <span>{isEn ? "Download" : "Unduh"}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VOD Player / Link Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              <Tv className="w-4 h-4 text-sky-400" />
              <span>{t.matchDetail.vodReviewTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {match.vodUrl ? (
              <div className="space-y-3">
                <p className="text-slate-300">
                  {t.matchDetail.vodReviewSubtitle}:
                </p>
                <a
                  href={match.vodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t.matchDetail.watchVod}</span>
                </a>
              </div>
            ) : (
              <p className="text-slate-500 italic">
                {isEn ? "No VOD link attached for this match." : "Tidak ada tautan rekaman VOD untuk match ini."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* IMAGE LIGHTBOX MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            ref={imageDialogRef} role="dialog" aria-modal="true" aria-labelledby={imageDialogTitleId} tabIndex={-1} className="relative max-w-4xl w-full max-h-[90vh] bg-[#141a24] border border-[#242e40] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#242e40] bg-[#0e131b] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-rose-500 shrink-0" />
                <span id={imageDialogTitleId} className="font-bold text-slate-100 text-sm truncate">{selectedImage.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                  {formatFileSize(selectedImage.sizeBytes)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(selectedImage)}
                  className="gap-1.5 h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isEn ? "Download Image" : "Unduh Gambar"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  aria-label={t.common.close} className="h-11 w-11 p-0 text-[#CBD5E1] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={selectedImage.dataUrl} width={1600} height={900} decoding="async"
                alt={selectedImage.name}
                className="max-h-[70vh] w-auto object-contain rounded-lg border border-[#242e40]"
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {selectedPdf && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPdf(null)}
        >
          <div
            ref={pdfDialogRef} role="dialog" aria-modal="true" aria-labelledby={pdfDialogTitleId} tabIndex={-1} className="relative max-w-4xl w-full h-[85vh] bg-[#141a24] border border-[#242e40] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#242e40] bg-[#0e131b] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <span id={pdfDialogTitleId} className="font-bold text-slate-100 text-sm truncate">{selectedPdf.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/30">
                  {formatFileSize(selectedPdf.sizeBytes)} PDF
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(selectedPdf)}
                  className="gap-1.5 h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isEn ? "Download PDF" : "Unduh Dokumen PDF"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPdf(null)}
                  aria-label={t.common.close} className="h-11 w-11 p-0 text-[#CBD5E1] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body / Iframe */}
            <div className="flex-1 overflow-hidden bg-[#0e131b]">
              <iframe
                src={selectedPdf.dataUrl}
                title={selectedPdf.name}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Tactical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t.matchDetail.deleteConfirmTitle}
        description={t.matchDetail.deleteConfirmDesc}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
