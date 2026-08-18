"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithStats, deleteMatch } from "@/lib/actions/matches";
import { MAP_METADATA, ValorantMap, VALORANT_AGENTS, getAgentIcon, getMapSplash } from "@/lib/data/valorant";
import { useUserRole } from "../layout/role-context";
import { MatchAttachment } from "@/lib/db/schema";
import { calculateKD } from "@/lib/utils/analytics";
import { formatFileSize } from "@/lib/utils/file-compressor";

interface MatchDetailViewProps {
  match: MatchWithStats;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MatchAttachment | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<MatchAttachment | null>(null);

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
    if (!confirm("Apakah Anda yakin ingin menghapus data pertandingan scrim ini?")) return;
    try {
      setIsDeleting(true);
      await deleteMatch(match.id);
      router.push("/matches");
      router.refresh();
    } catch (err: any) {
      alert("Gagal menghapus match: " + (err.message || "Unknown error"));
      setIsDeleting(false);
    }
  };

  const sortedStats = [...match.playerStats].sort((a, b) => b.acs - a.acs);
  const topFragger = sortedStats[0];

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
      <div className="flex items-center justify-between">
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Riwayat</span>
          </Button>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/matches/${match.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Match</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </Button>
          </div>
        )}
      </div>

      {/* MATCH HERO BANNER WITH MAP BANNER */}
      <div className="relative overflow-hidden rounded-xl border border-[#1C2433] bg-[#0F141C] p-6 sm:p-8 shadow-sm min-h-[160px] flex items-center">
        {/* Background Map Banner */}
        {mapMeta.listViewIcon && (
          <img
            src={mapMeta.listViewIcon}
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
                Mulai: {match.startSide === "ATTACK" ? "Attack" : "Defense"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Team SC <span className="text-[#64748B] font-normal">vs</span> <span className="text-[#FF4655]">{match.opponentName}</span>
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              Lokasi: {mapMeta.location}
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
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase">Lawan</div>
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
                {match.result}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* MATCH PERFORMANCE SCOREBOARD */}
      <Card>
        <CardHeader className="py-4 px-5 border-b border-[#1C2433]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Scoreboard Performa Pemain
            </CardTitle>
            <span className="text-xs text-[#94A3B8]">
              Disortir berdasarkan ACS
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* MOBILE VIEW: Scoreboard Player Cards (md:hidden) */}
          <div className="md:hidden divide-y divide-[#242e40]/70">
            {match.playerStats.map((stat, idx) => {
              const kd = calculateKD(stat.kills, stat.deaths);
              const isMVP = idx === 0;

              return (
                <div
                  key={stat.id}
                  className={`p-3.5 space-y-2.5 ${
                    isMVP ? "bg-amber-500/5" : ""
                  }`}
                >
                  {/* Top Bar: Agent, Player, MVP, ACS, KD Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={getAgentIcon(stat.agent)}
                        alt={stat.agent}
                        className="w-8 h-8 rounded-full bg-[#141a24] border border-[#242e40] shrink-0 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
                          {isMVP && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <Link
                            href={`/players/${stat.playerId}`}
                            className="hover:text-rose-400 transition-colors"
                          >
                            {stat.player.name}
                          </Link>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{stat.agent}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-black text-rose-400 tabular-nums">
                          {stat.acs} ACS
                        </div>
                      </div>
                      <Badge
                        variant={
                          kd >= 1.2 ? "win" : kd >= 1.0 ? "draw" : "loss"
                        }
                        className="text-[10px] px-1.5 py-0.2 font-bold"
                      >
                        {kd.toFixed(2)} KD
                      </Badge>
                    </div>
                  </div>

                  {/* 4-Stat Grid: KDA, ADR, HS, Clutch */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs pt-1 border-t border-[#242e40]/50">
                    <div className="p-1 rounded-lg bg-[#0e131b] border border-[#242e40]/60">
                      <div className="text-[9px] text-slate-400">K/D/A</div>
                      <div className="font-bold text-[11px] tabular-nums">
                        <span className="text-emerald-400">{stat.kills}</span>/
                        <span className="text-rose-400">{stat.deaths}</span>/
                        <span className="text-sky-400">{stat.assists}</span>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-[#0e131b] border border-[#242e40]/60">
                      <div className="text-[9px] text-slate-400">ADR</div>
                      <div className="font-bold text-[11px] text-slate-200 tabular-nums">
                        {stat.adr.toFixed(0)}
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-[#0e131b] border border-[#242e40]/60">
                      <div className="text-[9px] text-slate-400">HS %</div>
                      <div className="font-bold text-[11px] text-amber-400 tabular-nums">
                        {stat.hsPercent != null ? `${stat.hsPercent}%` : "-"}
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-[#0e131b] border border-[#242e40]/60">
                      <div className="text-[9px] text-slate-400">Clutch / FK</div>
                      <div className="font-bold text-[11px] text-emerald-400 tabular-nums">
                        {stat.clutchesWon > 0 ? `${stat.clutchesWon} W` : `${stat.firstKills} FK`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW: Full Data Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Pemain</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4 text-right">ACS</th>
                  <th className="py-3 px-4 text-center">K / D / A</th>
                  <th className="py-3 px-4 text-center">K/D Ratio</th>
                  <th className="py-3 px-4 text-right">ADR</th>
                  <th className="py-3 px-4 text-right">HS %</th>
                  <th className="py-3 px-4 text-center">First K/D</th>
                  <th className="py-3 px-4 text-center">Clutches</th>
                  <th className="py-3 px-4 text-right">KAST %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242e40]/70">
                {match.playerStats.map((stat, idx) => {
                  const kd = calculateKD(stat.kills, stat.deaths);
                  const isMVP = idx === 0;

                  return (
                    <tr
                      key={stat.id}
                      className={`hover:bg-[#1c2432]/50 transition-colors ${
                        isMVP ? "bg-amber-500/5 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          {isMVP && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <Link
                            href={`/players/${stat.playerId}`}
                            className="hover:text-rose-400 transition-colors"
                          >
                            {stat.player.name}
                          </Link>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={getAgentIcon(stat.agent)}
                            alt={stat.agent}
                            className="w-7 h-7 rounded-full bg-[#141a24] border border-[#242e40] shrink-0 object-cover"
                          />
                          <span className="font-semibold text-slate-200">{stat.agent}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-rose-400 text-sm tabular-nums">
                        {stat.acs}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-200 tabular-nums">
                        <span className="text-emerald-400">{stat.kills}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-rose-400">{stat.deaths}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-sky-400">{stat.assists}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                        <span className={kd >= 1.2 ? "text-emerald-400" : kd >= 1.0 ? "text-slate-200" : "text-rose-400"}>
                          {kd.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-200 tabular-nums font-semibold">
                        {stat.adr.toFixed(1)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-300 tabular-nums">
                        {stat.hsPercent != null ? `${stat.hsPercent}%` : "-"}
                      </td>

                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-200">
                        <span className="text-emerald-400">{stat.firstKills}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-rose-400">{stat.firstDeaths}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-amber-400 tabular-nums">
                        {stat.clutchesWon > 0 ? `${stat.clutchesWon} Menang` : "-"}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400 tabular-nums">
                        {stat.kastPercent != null ? `${stat.kastPercent}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* TACTICAL EVALUATION, ATTACHMENTS & VOD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tactical Notes & Coach Attachments Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Catatan Evaluasi & Lampiran Taktis</span>
              </div>
              {attachments.length > 0 && (
                <span className="text-[11px] font-semibold text-slate-400 bg-[#0e131b] px-2 py-0.5 rounded-full border border-[#242e40]">
                  {attachments.length} Berkas
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-300 space-y-4">
            {/* Notes Body */}
            {match.notes ? (
              <p className="whitespace-pre-wrap bg-[#0e131b] p-4 rounded-xl border border-[#242e40]">
                {match.notes}
              </p>
            ) : (
              <p className="text-slate-500 italic">
                Tidak ada catatan evaluasi tertulis untuk pertandingan ini.
              </p>
            )}

            {/* Attachments Gallery */}
            {attachments.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#242e40]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dokumen & Screenshot Taktis Coach:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-[#0e131b] border border-[#242e40] hover:border-[#3b4b66] transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.type === "image" ? (
                          <div
                            onClick={() => setSelectedImage(att)}
                            className="w-10 h-10 rounded-lg bg-[#141a24] border border-[#242e40] overflow-hidden shrink-0 cursor-pointer relative group/thumb"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedPdf(att)}
                            className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 cursor-pointer hover:bg-rose-500/20 transition-colors"
                          >
                            <FileText className="w-5 h-5" />
                          </div>
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
                            <span className="px-1.5 py-0.2 rounded bg-[#141a24] border border-[#242e40] text-emerald-400 font-semibold uppercase">
                              {att.type === "image" ? "Gambar" : "PDF"}
                            </span>
                            <span>{formatFileSize(att.sizeBytes)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Players */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#242e40]/60">
                        {att.type === "image" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedImage(att)}
                            className="flex-1 h-7 text-[11px] gap-1 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPdf(att)}
                            className="flex-1 h-7 text-[11px] gap-1 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Buka PDF</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(att)}
                          className="h-7 px-2.5 text-[11px] gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold"
                          title="Unduh berkas ke perangkat"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh</span>
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
              <span>Video Rekaman VOD Scrim</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {match.vodUrl ? (
              <div className="space-y-3">
                <p className="text-slate-300">
                  Tautan video rekaman scrim tersedia untuk ditinjau:
                </p>
                <a
                  href={match.vodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all font-semibold break-all text-xs"
                >
                  <Tv className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Buka Video VOD ({match.vodUrl})</span>
                </a>
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Belum ada tautan video VOD yang dilampirkan.
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
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#141a24] border border-[#242e40] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#242e40] bg-[#0e131b] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-bold text-slate-100 text-sm truncate">{selectedImage.name}</span>
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
                  <span>Unduh Gambar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.dataUrl}
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
            className="relative max-w-4xl w-full h-[85vh] bg-[#141a24] border border-[#242e40] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#242e40] bg-[#0e131b] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-bold text-slate-100 text-sm truncate">{selectedPdf.name}</span>
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
                  <span>Unduh Dokumen PDF</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPdf(null)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
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
    </div>
  );
}
