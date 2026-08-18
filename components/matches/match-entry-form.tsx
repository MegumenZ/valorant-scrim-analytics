"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Check, AlertCircle, RefreshCw, Sparkles, HelpCircle, Calendar, Shield, Crosshair, Zap, RotateCcw, Swords, FileText, Image as ImageIcon, Trash2, UploadCloud, Eye, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VALORANT_MAPS, VALORANT_AGENTS, ValorantMap, getAgentIcon } from "@/lib/data/valorant";
import { Player, MatchAttachment } from "@/lib/db/schema";
import { createMatch, updateMatch } from "@/lib/actions/matches";
import { calculateKD, calculateMatchResult } from "@/lib/utils/analytics";
import { compressImageToWebP, processAndCompressPdf, formatFileSize } from "@/lib/utils/file-compressor";
import { RoundItem } from "@/lib/validations/match";

interface PlayerStatRow {
  playerId: string;
  agent: string;
  acs: number | string;
  kills: number | string;
  deaths: number | string;
  assists: number | string;
  firstKills: number | string;
  clutchesWon: number | string;
}

interface MatchEntryFormProps {
  availablePlayers: Player[];
  initialData?: {
    id: string;
    matchDate: string;
    map: ValorantMap;
    opponentName: string;
    scoreTeam: number;
    scoreOpponent: number;
    startSide: "ATTACK" | "DEFENSE";
    vodUrl?: string | null;
    notes?: string | null;
    attachments?: MatchAttachment[] | null;
    roundsTimeline?: RoundItem[] | null;
    stats: Array<{
      playerId: string;
      agent: string;
      acs: number;
      kills: number;
      deaths: number;
      assists: number;
      adr?: number;
      hsPercent?: number | null;
      firstKills: number;
      firstDeaths?: number;
      clutchesWon?: number;
    }>;
  };
}

export function MatchEntryForm({ availablePlayers, initialData }: MatchEntryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [matchDate, setMatchDate] = useState(
    initialData?.matchDate || new Date().toISOString().split("T")[0]
  );
  const [map, setMap] = useState<ValorantMap>(initialData?.map || "Ascent");
  const [opponentName, setOpponentName] = useState(initialData?.opponentName || "");
  const [scoreTeam, setScoreTeam] = useState<number | string>(initialData?.scoreTeam ?? 13);
  const [scoreOpponent, setScoreOpponent] = useState<number | string>(initialData?.scoreOpponent ?? 9);
  const [startSide, setStartSide] = useState<"ATTACK" | "DEFENSE">(initialData?.startSide || "ATTACK");
  const [vodUrl, setVodUrl] = useState(initialData?.vodUrl || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [attachments, setAttachments] = useState<MatchAttachment[]>(initialData?.attachments || []);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionFeedback, setCompressionFeedback] = useState<string | null>(null);

  const generateDefaultTimeline = (teamScore: number, oppScore: number, side: "ATTACK" | "DEFENSE"): RoundItem[] => {
    const total = teamScore + oppScore;
    if (total <= 0) return [];

    const items: RoundItem[] = [];
    let remWins = teamScore;
    let remLoss = oppScore;

    for (let r = 1; r <= total; r++) {
      let roundSide: "ATTACK" | "DEFENSE";
      if (r <= 12) {
        roundSide = side;
      } else if (r <= 24) {
        roundSide = side === "ATTACK" ? "DEFENSE" : "ATTACK";
      } else {
        const otCycle = Math.floor((r - 25) / 2);
        roundSide = otCycle % 2 === 0 ? side : (side === "ATTACK" ? "DEFENSE" : "ATTACK");
      }

      let winner: "TEAM" | "OPPONENT" = "TEAM";
      if (remWins > 0 && remLoss > 0) {
        if (r % 2 === 1 && remWins > 0) {
          winner = "TEAM";
          remWins--;
        } else if (remLoss > 0) {
          winner = "OPPONENT";
          remLoss--;
        } else {
          winner = "TEAM";
          remWins--;
        }
      } else if (remWins > 0) {
        winner = "TEAM";
        remWins--;
      } else {
        winner = "OPPONENT";
        remLoss--;
      }

      items.push({
        round: r,
        side: roundSide,
        winner,
      });
    }
    return items;
  };

  const [roundsTimeline, setRoundsTimeline] = useState<RoundItem[]>(() => {
    if (initialData?.roundsTimeline && initialData.roundsTimeline.length > 0) {
      return initialData.roundsTimeline;
    }
    return generateDefaultTimeline(Number(scoreTeam) || 0, Number(scoreOpponent) || 0, startSide);
  });

  useEffect(() => {
    const total = (Number(scoreTeam) || 0) + (Number(scoreOpponent) || 0);
    if (total <= 0) {
      setRoundsTimeline([]);
      return;
    }

    setRoundsTimeline((prev) => {
      if (prev.length === total) {
        return prev.map((item, idx) => {
          const r = idx + 1;
          let roundSide: "ATTACK" | "DEFENSE";
          if (r <= 12) {
            roundSide = startSide;
          } else if (r <= 24) {
            roundSide = startSide === "ATTACK" ? "DEFENSE" : "ATTACK";
          } else {
            const otCycle = Math.floor((r - 25) / 2);
            roundSide = otCycle % 2 === 0 ? startSide : (startSide === "ATTACK" ? "DEFENSE" : "ATTACK");
          }
          return { ...item, round: r, side: roundSide };
        });
      }

      const newItems: RoundItem[] = [];
      for (let r = 1; r <= total; r++) {
        let roundSide: "ATTACK" | "DEFENSE";
        if (r <= 12) {
          roundSide = startSide;
        } else if (r <= 24) {
          roundSide = startSide === "ATTACK" ? "DEFENSE" : "ATTACK";
        } else {
          const otCycle = Math.floor((r - 25) / 2);
          roundSide = otCycle % 2 === 0 ? startSide : (startSide === "ATTACK" ? "DEFENSE" : "ATTACK");
        }

        const existing = prev[r - 1];
        newItems.push({
          round: r,
          side: roundSide,
          winner: existing ? existing.winner : "TEAM",
        });
      }
      return newItems;
    });
  }, [scoreTeam, scoreOpponent, startSide]);

  const handleToggleRoundWinner = (roundNum: number) => {
    setRoundsTimeline((prev) =>
      prev.map((item) =>
        item.round === roundNum
          ? { ...item, winner: item.winner === "TEAM" ? "OPPONENT" : "TEAM" }
          : item
      )
    );
  };

  const handleAutoFillTimeline = () => {
    const sTeam = Number(scoreTeam) || 0;
    const sOpp = Number(scoreOpponent) || 0;
    setRoundsTimeline(generateDefaultTimeline(sTeam, sOpp, startSide));
  };

  const handleSetAllRounds = (winner: "TEAM" | "OPPONENT") => {
    setRoundsTimeline((prev) => prev.map((item) => ({ ...item, winner })));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setErrorMsg(null);
    setCompressionFeedback(null);

    try {
      if (attachments.length + files.length > 3) {
        throw new Error("Batas kuota lampiran: Maksimal 3 berkas (Gambar/PDF) per pertandingan untuk menjaga performa database tetap ringan.");
      }

      const newAttachments: MatchAttachment[] = [];
      const feedbackList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        if (!isImage && !isPdf) {
          throw new Error(`File "${file.name}" tidak didukung. Mohon unggah berkas Gambar (PNG/JPEG) atau Dokumen PDF.`);
        }

        if (isImage) {
          const res = await compressImageToWebP(file);
          newAttachments.push(res.attachment);
          feedbackList.push(`${res.attachment.name}: ${res.originalSizeFormatted} ➔ ${res.compressedSizeFormatted} (WebP - Hemat ${res.savingsPercent}%)`);
        } else if (isPdf) {
          const res = await processAndCompressPdf(file);
          newAttachments.push(res.attachment);
          feedbackList.push(`${res.attachment.name}: ${res.compressedSizeFormatted} (PDF Optimal)`);
        }
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
      setCompressionFeedback(feedbackList.join(" • "));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses lampiran.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const activeStarters = availablePlayers.filter((p) => p.isActive).slice(0, 5);

  const defaultRows: PlayerStatRow[] = [
    { playerId: activeStarters[0]?.id || availablePlayers[0]?.id || "", agent: "Jett", acs: 240, kills: 18, deaths: 12, assists: 4, firstKills: 4, clutchesWon: 1 },
    { playerId: activeStarters[1]?.id || availablePlayers[1]?.id || "", agent: "Raze", acs: 220, kills: 16, deaths: 14, assists: 5, firstKills: 3, clutchesWon: 0 },
    { playerId: activeStarters[2]?.id || availablePlayers[2]?.id || "", agent: "Omen", acs: 195, kills: 14, deaths: 11, assists: 9, firstKills: 1, clutchesWon: 2 },
    { playerId: activeStarters[3]?.id || availablePlayers[3]?.id || "", agent: "Sova", acs: 185, kills: 13, deaths: 12, assists: 11, firstKills: 2, clutchesWon: 0 },
    { playerId: activeStarters[4]?.id || availablePlayers[4]?.id || "", agent: "Cypher", acs: 160, kills: 11, deaths: 10, assists: 6, firstKills: 0, clutchesWon: 1 },
  ];

  const [playerRows, setPlayerRows] = useState<PlayerStatRow[]>(() => {
    if (initialData && initialData.stats.length > 0) {
      return initialData.stats.map((s) => ({
        playerId: s.playerId,
        agent: s.agent,
        acs: s.acs,
        kills: s.kills,
        deaths: s.deaths,
        assists: s.assists,
        firstKills: s.firstKills,
        clutchesWon: s.clutchesWon ?? 0,
      }));
    }
    return defaultRows;
  });

  const numTeam = Number(scoreTeam) || 0;
  const numOpp = Number(scoreOpponent) || 0;
  const computedResult = calculateMatchResult(numTeam, numOpp);

  const handleRowChange = (index: number, field: keyof PlayerStatRow, value: any) => {
    setPlayerRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFillDemoData = () => {
    setOpponentName("Alter Ego");
    setScoreTeam(13);
    setScoreOpponent(8);
    setMap("Ascent");
    setStartSide("ATTACK");
    setNotes("Anti-eco sangat rapi, retake A site berhasil dengan koordinasi flash dan smoke.");
    setVodUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    if (availablePlayers.length >= 5) {
      setPlayerRows([
        { playerId: availablePlayers[0].id, agent: "Jett", acs: 285, kills: 22, deaths: 11, assists: 4, firstKills: 5, clutchesWon: 1 },
        { playerId: availablePlayers[1].id, agent: "Raze", acs: 245, kills: 18, deaths: 13, assists: 5, firstKills: 4, clutchesWon: 0 },
        { playerId: availablePlayers[2].id, agent: "Omen", acs: 210, kills: 15, deaths: 10, assists: 10, firstKills: 1, clutchesWon: 2 },
        { playerId: availablePlayers[3].id, agent: "Fade", acs: 190, kills: 13, deaths: 12, assists: 12, firstKills: 2, clutchesWon: 0 },
        { playerId: availablePlayers[4].id, agent: "Cypher", acs: 165, kills: 11, deaths: 9, assists: 7, firstKills: 0, clutchesWon: 1 },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const selectedIds = playerRows.map((r) => r.playerId).filter(Boolean);
      if (selectedIds.length !== 5) {
        throw new Error("Mohon pilih 5 pemain aktif untuk match ini.");
      }
      
      const formattedStats = playerRows.map((row) => ({
        playerId: row.playerId,
        agent: row.agent,
        acs: Number(row.acs) || 0,
        kills: Number(row.kills) || 0,
        deaths: Number(row.deaths) || 0,
        assists: Number(row.assists) || 0,
        adr: 0,
        hsPercent: null,
        firstKills: Number(row.firstKills) || 0,
        firstDeaths: 0,
        clutchesWon: Number(row.clutchesWon) || 0,
        kastPercent: null,
      }));

      const payload = {
        matchDate,
        map,
        opponentName: opponentName.trim(),
        scoreTeam: Number(scoreTeam) || 0,
        scoreOpponent: Number(scoreOpponent) || 0,
        startSide,
        vodUrl: vodUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments,
        roundsTimeline,
        playerStats: formattedStats,
      };

      if (initialData?.id) {
        await updateMatch(initialData.id, payload);
        router.push(`/matches/${initialData.id}`);
      } else {
        const res = await createMatch(payload);
        router.push(`/matches/${res.matchId}`);
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan match data.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2433] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {initialData ? "Edit Scrim" : "Catat Scrim Baru"}
          </h1>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFillDemoData}
              className="text-xs gap-1.5 border border-[#2A364F] text-[#94A3B8] hover:text-white"
              title="Khusus mode development lokal"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isi Contoh Data (Dev)</span>
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: MATCH METADATA */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">1. Informasi Pertandingan</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Hasil:</span>
              <Badge
                variant={
                  computedResult === "WIN"
                    ? "win"
                    : computedResult === "LOSS"
                    ? "loss"
                    : "draw"
                }
              >
                {computedResult} ({numTeam} - {numOpp})
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
          {/* Tanggal */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]">
              Tanggal Match *
            </label>
            <Input
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              required
              className="text-xs font-mono cursor-pointer"
            />
          </div>

          {/* Map */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]">
              Pilihan Map *
            </label>
            <Select
              value={map}
              onChange={(e) => setMap(e.target.value as ValorantMap)}
              className="text-xs font-semibold"
            >
              {VALORANT_MAPS.map((m) => (
                <option key={m} value={m} className="bg-[#090C10] text-[#F1F5F9]">
                  {m}
                </option>
              ))}
            </Select>
          </div>

          {/* Tim Lawan */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]">
              Nama Tim Lawan *
            </label>
            <Input
              type="text"
              placeholder="e.g. Alter Ego, BOOM Esports"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              required
              className="text-xs font-medium"
            />
          </div>

          {/* Skor Tim vs Lawan */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-emerald-400">
              Skor Tim *
            </label>
            <Input
              type="number"
              min="0"
              max="99"
              value={scoreTeam}
              onChange={(e) => setScoreTeam(e.target.value)}
              required
              className="font-bold text-emerald-400 text-center text-sm"
            />
          </div>

          <div className="md:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-rose-400">
              Skor Lawan *
            </label>
            <Input
              type="number"
              min="0"
              max="99"
              value={scoreOpponent}
              onChange={(e) => setScoreOpponent(e.target.value)}
              required
              className="font-bold text-rose-400 text-center text-sm"
            />
          </div>

          {/* Sisi Awal */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]">
              Sisi Awal (Babak Pertama) *
            </label>
            <Select
              value={startSide}
              onChange={(e) => setStartSide(e.target.value as "ATTACK" | "DEFENSE")}
              className="text-xs font-medium"
            >
              <option value="ATTACK" className="bg-[#090C10] text-rose-400 font-semibold">
                Attack Side (Penyerang)
              </option>
              <option value="DEFENSE" className="bg-[#090C10] text-sky-400 font-semibold">
                Defense Side (Bertahan)
              </option>
            </Select>
          </div>

          {/* Link VOD */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]">
              Link Video VOD (YouTube / Twitch Opsional)
            </label>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={vodUrl}
              onChange={(e) => setVodUrl(e.target.value)}
              className="text-xs text-[#F1F5F9]"
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: ROUND-BY-ROUND TIMELINE */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#FF4655]" />
                <span>2. Kronologi Ronde (Round-by-Round)</span>
              </CardTitle>
              <CardDescription className="text-xs text-[#94A3B8] mt-0.5">
                Tandai hasil setiap ronde (W = Menang, L = Kalah). Klik kotak ronde untuk mengganti status.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillTimeline}
                className="text-xs h-7 gap-1 text-[#94A3B8] hover:text-white"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Auto-Fill Skor</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSetAllRounds("TEAM")}
                className="text-[11px] h-7 px-2 text-emerald-400 hover:bg-emerald-500/10"
              >
                Semua W
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSetAllRounds("OPPONENT")}
                className="text-[11px] h-7 px-2 text-rose-400 hover:bg-rose-500/10"
              >
                Semua L
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-4">
          {roundsTimeline.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#64748B]">
              Masukkan Skor Tim & Lawan di atas untuk mengaktifkan kronologi ronde.
            </div>
          ) : (
            <>
              {/* Tally / Sync Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#090C10] border border-[#1C2433] text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400">Tim: {roundsTimeline.filter(r => r.winner === "TEAM").length} W</span>
                    <span className="text-[#64748B]">/ {scoreTeam}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-rose-400">Lawan: {roundsTimeline.filter(r => r.winner === "OPPONENT").length} L</span>
                    <span className="text-[#64748B]">/ {scoreOpponent}</span>
                  </div>
                </div>

                {roundsTimeline.filter(r => r.winner === "TEAM").length !== Number(scoreTeam) && (
                  <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Jumlah W belum sesuai dengan skor tim ({scoreTeam})
                  </span>
                )}
              </div>

              {/* Babak 1 (R1 - R12) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Babak 1 (Ronde 1 - 12)</span>
                    <Badge variant={startSide === "ATTACK" ? "attack" : "defense"} className="text-[10px] py-0 px-2">
                      {startSide === "ATTACK" ? "Attack Side" : "Defense Side"}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">
                    Pistol Round: R1
                  </span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {roundsTimeline.slice(0, 12).map((item) => {
                    const isWin = item.winner === "TEAM";
                    const isPistol = item.round === 1;

                    return (
                      <button
                        key={item.round}
                        type="button"
                        onClick={() => handleToggleRoundWinner(item.round)}
                        className={`relative rounded-lg border p-2 flex flex-col items-center justify-between gap-1 transition-all cursor-pointer select-none hover:scale-105 active:scale-95 ${
                          isWin
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
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
                        <span className="text-sm font-black tracking-wider">
                          {isWin ? "W" : "L"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Babak 2 (R13 - R24) */}
              {roundsTimeline.length > 12 && (
                <div className="space-y-2 pt-2 border-t border-[#1C2433]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Babak 2 (Ronde 13 - 24)</span>
                      <Badge variant={startSide === "ATTACK" ? "defense" : "attack"} className="text-[10px] py-0 px-2">
                        {startSide === "ATTACK" ? "Defense Side" : "Attack Side"}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#94A3B8]">
                      Pistol Round: R13
                    </span>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {roundsTimeline.slice(12, 24).map((item) => {
                      const isWin = item.winner === "TEAM";
                      const isPistol = item.round === 13;

                      return (
                        <button
                          key={item.round}
                          type="button"
                          onClick={() => handleToggleRoundWinner(item.round)}
                          className={`relative rounded-lg border p-2 flex flex-col items-center justify-between gap-1 transition-all cursor-pointer select-none hover:scale-105 active:scale-95 ${
                            isWin
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
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
                          <span className="text-sm font-black tracking-wider">
                            {isWin ? "W" : "L"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overtime (R25+) */}
              {roundsTimeline.length > 24 && (
                <div className="space-y-2 pt-2 border-t border-[#1C2433]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">Overtime (Ronde 25+)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {roundsTimeline.slice(24).map((item) => {
                      const isWin = item.winner === "TEAM";

                      return (
                        <button
                          key={item.round}
                          type="button"
                          onClick={() => handleToggleRoundWinner(item.round)}
                          className={`relative rounded-lg border p-2 flex flex-col items-center justify-between gap-1 transition-all cursor-pointer select-none hover:scale-105 active:scale-95 ${
                            isWin
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#94A3B8]">
                            <span>R{item.round}</span>
                          </div>
                          <span className="text-sm font-black tracking-wider">
                            {isWin ? "W" : "L"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* SECTION 3: 5 PLAYER STATS MATRIX */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">3. Statistik 5 Pemain</CardTitle>
            <span className="text-xs text-[#94A3B8]">
              5 Slot Pemain
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* MOBILE VIEW: Player Stat Input Cards (md:hidden) */}
          <div className="md:hidden divide-y divide-[#1C2433] p-3 space-y-4">
            {playerRows.map((row, index) => {
              const k = Number(row.kills) || 0;
              const d = Number(row.deaths) || 0;
              const liveKD = calculateKD(k, d);

              return (
                <div
                  key={index}
                  className="rounded-xl bg-[#090C10] border border-[#1C2433] p-3.5 space-y-3"
                >
                  {/* Card Header: Slot Number & Live KD */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#1C2433]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#161D28] border border-[#2A364F] text-[#FF4655] font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        Slot Pemain #{index + 1}
                      </span>
                    </div>

                    <Badge
                      variant={
                        liveKD >= 1.2 ? "win" : liveKD >= 1.0 ? "draw" : "loss"
                      }
                      className="text-[10px] px-2 py-0.5 font-semibold"
                    >
                      {liveKD.toFixed(2)} KD
                    </Badge>
                  </div>

                  {/* Player & Agent Dropdowns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#94A3B8]">Pemain *</label>
                      <Select
                        value={row.playerId}
                        onChange={(e) => handleRowChange(index, "playerId", e.target.value)}
                        className="h-9 text-xs font-semibold"
                        required
                      >
                        <option value="" disabled>Pilih Pemain</option>
                        {availablePlayers.map((p) => (
                          <option key={p.id} value={p.id} className="bg-[#090C10] text-[#F1F5F9]">
                            {p.name} ({p.primaryRole})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#94A3B8]">Agent *</label>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-[#090C10] border border-[#1C2433] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          <img
                            src={getAgentIcon(row.agent)}
                            alt={row.agent}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <Select
                          value={row.agent}
                          onChange={(e) => handleRowChange(index, "agent", e.target.value)}
                          className="h-9 text-xs font-semibold flex-1"
                          required
                        >
                          {VALORANT_AGENTS.map((a) => (
                            <option key={a.name} value={a.name} className="bg-[#090C10] text-[#F1F5F9]">
                              {a.name} ({a.role})
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Primary Combat Stats Grid (6 cols) */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-semibold text-[#94A3B8]">Statistik Pertandingan</div>
                    <div className="grid grid-cols-6 gap-1 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-sky-400 font-bold">ACS *</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="240"
                          value={row.acs}
                          onChange={(e) => handleRowChange(index, "acs", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-sky-400 px-1 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-emerald-400 font-bold">K *</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="18"
                          value={row.kills}
                          onChange={(e) => handleRowChange(index, "kills", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-emerald-400 px-1 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-rose-400 font-bold">D *</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="12"
                          value={row.deaths}
                          onChange={(e) => handleRowChange(index, "deaths", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-rose-400 px-1 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-[#94A3B8] font-bold">A *</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="5"
                          value={row.assists}
                          onChange={(e) => handleRowChange(index, "assists", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-[#F1F5F9] px-1 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-emerald-400 font-medium">FK</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="2"
                          value={row.firstKills}
                          onChange={(e) => handleRowChange(index, "firstKills", e.target.value)}
                          className="h-8 text-center text-emerald-400 px-1 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-amber-400 font-bold">1vX</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={row.clutchesWon}
                          onChange={(e) => handleRowChange(index, "clutchesWon", e.target.value)}
                          className="h-8 text-center text-amber-400 font-bold px-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW: Full Data Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-semibold text-[11px]">
                  <th className="py-3 px-3.5 min-w-[150px]">Pemain *</th>
                  <th className="py-3 px-3.5 min-w-[165px]">Agent *</th>
                  <th className="py-3 px-2 text-center w-20">ACS *</th>
                  <th className="py-3 px-2 text-center w-16">K *</th>
                  <th className="py-3 px-2 text-center w-16">D *</th>
                  <th className="py-3 px-2 text-center w-16">A *</th>
                  <th className="py-3 px-2 text-center w-20">First Bloods (FK)</th>
                  <th className="py-3 px-2 text-center w-20">Clutch (1vX)</th>
                  <th className="py-3 px-3 text-center min-w-[90px]">Live K/D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2433]">
                {playerRows.map((row, index) => {
                  const k = Number(row.kills) || 0;
                  const d = Number(row.deaths) || 0;
                  const liveKD = calculateKD(k, d);

                  return (
                    <tr
                      key={index}
                      className="hover:bg-[#161D28]/40 transition-colors"
                    >
                      {/* Pemain */}
                      <td className="p-2.5">
                        <Select
                          value={row.playerId}
                          onChange={(e) => handleRowChange(index, "playerId", e.target.value)}
                          className="h-8 text-xs font-semibold"
                          required
                        >
                          <option value="" disabled>Pilih Pemain</option>
                          {availablePlayers.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[#090C10] text-[#F1F5F9]">
                              {p.name} ({p.primaryRole})
                            </option>
                          ))}
                        </Select>
                      </td>

                      {/* Agent */}
                      <td className="p-2.5 min-w-[165px]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#090C10] border border-[#1C2433] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            <img
                              src={getAgentIcon(row.agent)}
                              alt={row.agent}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <Select
                            value={row.agent}
                            onChange={(e) => handleRowChange(index, "agent", e.target.value)}
                            className="h-8 text-xs font-semibold flex-1"
                            required
                          >
                            {VALORANT_AGENTS.map((a) => (
                              <option key={a.name} value={a.name} className="bg-[#090C10] text-[#F1F5F9]">
                                {a.name} ({a.role})
                              </option>
                            ))}
                          </Select>
                        </div>
                      </td>

                      {/* ACS */}
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="0"
                          placeholder="240"
                          value={row.acs}
                          onChange={(e) => handleRowChange(index, "acs", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-sky-400 px-1"
                        />
                      </td>

                      {/* Kills */}
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="0"
                          placeholder="18"
                          value={row.kills}
                          onChange={(e) => handleRowChange(index, "kills", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-emerald-400 px-1"
                        />
                      </td>

                      {/* Deaths */}
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="0"
                          placeholder="12"
                          value={row.deaths}
                          onChange={(e) => handleRowChange(index, "deaths", e.target.value)}
                          required
                          className="h-8 text-center font-bold text-rose-400 px-1"
                        />
                      </td>

                      {/* Assists */}
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="0"
                          placeholder="5"
                          value={row.assists}
                          onChange={(e) => handleRowChange(index, "assists", e.target.value)}
                          required
                          className="h-8 text-center text-slate-200 px-1"
                        />
                      </td>

                      {/* First Kills */}
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="0"
                          placeholder="2"
                          value={row.firstKills}
                          onChange={(e) => handleRowChange(index, "firstKills", e.target.value)}
                          className="h-8 text-center text-emerald-400 px-1"
                        />
                      </td>

                      {/* Clutches */}
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={row.clutchesWon}
                          onChange={(e) => handleRowChange(index, "clutchesWon", e.target.value)}
                          className="h-8 text-center text-amber-400 font-bold px-1"
                        />
                      </td>

                      {/* Live K/D */}
                      <td className="p-2.5 text-center font-bold text-xs tabular-nums">
                        <span
                          className={
                            liveKD >= 1.2
                              ? "text-emerald-400 font-extrabold"
                              : liveKD >= 1.0
                              ? "text-slate-200"
                              : "text-rose-400"
                          }
                        >
                          {liveKD.toFixed(2)} KD
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: EVALUATION & ATTACHMENTS */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433]">
          <CardTitle className="text-sm font-semibold">4. Evaluasi & Catatan Taktis</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <Textarea
            rows={3}
            placeholder="Catatan evaluasi strategi atau analisis rotasi..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs text-[#F1F5F9] leading-relaxed"
          />

          {/* Attachments Section */}
          <div className="space-y-3 pt-3 border-t border-[#1C2433]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-[#FF4655]" />
                <span>Lampiran Evaluasi</span>
              </label>
              <span className="text-[11px] text-[#94A3B8]">
                Maksimal 3 berkas (Gambar / PDF)
              </span>
            </div>

            {/* Drag & Drop Upload Box */}
            <div className="relative border-2 border-dashed border-[#1C2433] hover:border-[#FF4655]/50 bg-[#090C10] rounded-xl p-5 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf"
                onChange={handleFileUpload}
                disabled={isCompressing || loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[#FF4655] group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white">
                  {isCompressing ? "Memproses berkas..." : "Klik atau Tarik File Gambar / PDF ke Sini"}
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Mendukung format PNG, JPG, dan PDF
                </p>
              </div>
            </div>

            {/* Compression Feedback Banner */}
            {compressionFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{compressionFeedback}</span>
              </div>
            )}

            {/* Uploaded Attachments Grid */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-[#0F141C] border border-[#1C2433] flex items-center justify-between gap-3 group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.type === "image" ? (
                        <div className="w-10 h-10 rounded-lg bg-[#090C10] border border-[#1C2433] overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate" title={att.name}>
                          {att.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#090C10] border border-[#1C2433] text-emerald-400 font-semibold uppercase">
                            {att.type === "image" ? "WebP" : "PDF"}
                          </span>
                          <span>{formatFileSize(att.sizeBytes)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="h-7 w-7 p-0 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                      title="Hapus Lampiran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SUBMIT BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 px-6 font-bold shadow-lg shadow-rose-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{initialData ? "Simpan Perubahan" : "Simpan & Publish Match"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
