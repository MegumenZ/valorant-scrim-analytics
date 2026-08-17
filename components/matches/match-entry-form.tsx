"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Check, AlertCircle, RefreshCw, Sparkles, HelpCircle, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VALORANT_MAPS, VALORANT_AGENTS, ValorantMap } from "@/lib/data/valorant";
import { Player, MatchAttachment } from "@/lib/db/schema";
import { createMatch, updateMatch } from "@/lib/actions/matches";
import { calculateKD, calculateMatchResult } from "@/lib/utils/analytics";
import { compressImageToWebP, processAndCompressPdf, formatFileSize } from "@/lib/utils/file-compressor";
import { FileText, Image as ImageIcon, Trash2, UploadCloud, Eye, CheckCircle2 } from "lucide-react";

interface PlayerStatRow {
  playerId: string;
  agent: string;
  acs: number | string;
  kills: number | string;
  deaths: number | string;
  assists: number | string;
  adr: number | string;
  hsPercent: number | string;
  firstKills: number | string;
  firstDeaths: number | string;
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
    stats: Array<{
      playerId: string;
      agent: string;
      acs: number;
      kills: number;
      deaths: number;
      assists: number;
      adr: number;
      hsPercent?: number | null;
      firstKills: number;
      firstDeaths: number;
      clutchesWon: number;
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
          throw new Error(
            `Berkas "${file.name}" tidak didukung. Hanya Gambar (PNG, JPG, WEBP) dan Dokumen PDF yang diperbolehkan.`
          );
        }

        if (isImage) {
          setCompressionFeedback(`Mengompresi gambar "${file.name}" ke WebP...`);
          const res = await compressImageToWebP(file);
          newAttachments.push(res.attachment);
          feedbackList.push(`Gambar "${res.attachment.name}" dikonversi ke WebP (${res.originalSizeFormatted} ➔ ${res.compressedSizeFormatted}, hemat ${res.savingsPercent}%)`);
        } else if (isPdf) {
          setCompressionFeedback(`Memproses & mengompresi PDF "${file.name}"...`);
          const res = await processAndCompressPdf(file);
          newAttachments.push(res.attachment);
          feedbackList.push(`PDF "${res.attachment.name}" dioptimasi (${res.compressedSizeFormatted})`);
        }
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
      setCompressionFeedback(feedbackList.join(" | "));
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
    { playerId: activeStarters[0]?.id || availablePlayers[0]?.id || "", agent: "Jett", acs: 240, kills: 18, deaths: 12, assists: 4, adr: 155, hsPercent: 28, firstKills: 4, firstDeaths: 2, clutchesWon: 1 },
    { playerId: activeStarters[1]?.id || availablePlayers[1]?.id || "", agent: "Raze", acs: 220, kills: 16, deaths: 14, assists: 5, adr: 145, hsPercent: 22, firstKills: 3, firstDeaths: 3, clutchesWon: 0 },
    { playerId: activeStarters[2]?.id || availablePlayers[2]?.id || "", agent: "Omen", acs: 195, kills: 14, deaths: 11, assists: 9, adr: 128, hsPercent: 30, firstKills: 1, firstDeaths: 1, clutchesWon: 2 },
    { playerId: activeStarters[3]?.id || availablePlayers[3]?.id || "", agent: "Sova", acs: 185, kills: 13, deaths: 12, assists: 11, adr: 120, hsPercent: 26, firstKills: 2, firstDeaths: 1, clutchesWon: 0 },
    { playerId: activeStarters[4]?.id || availablePlayers[4]?.id || "", agent: "Cypher", acs: 160, kills: 11, deaths: 10, assists: 6, adr: 105, hsPercent: 24, firstKills: 0, firstDeaths: 1, clutchesWon: 1 },
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
        adr: s.adr,
        hsPercent: s.hsPercent ?? "",
        firstKills: s.firstKills,
        firstDeaths: s.firstDeaths,
        clutchesWon: s.clutchesWon,
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
        { playerId: availablePlayers[0].id, agent: "Jett", acs: 285, kills: 22, deaths: 11, assists: 4, adr: 182, hsPercent: 32, firstKills: 5, firstDeaths: 2, clutchesWon: 1 },
        { playerId: availablePlayers[1].id, agent: "Raze", acs: 245, kills: 18, deaths: 13, assists: 5, adr: 158, hsPercent: 24, firstKills: 4, firstDeaths: 3, clutchesWon: 0 },
        { playerId: availablePlayers[2].id, agent: "Omen", acs: 210, kills: 15, deaths: 10, assists: 10, adr: 135, hsPercent: 29, firstKills: 1, firstDeaths: 1, clutchesWon: 2 },
        { playerId: availablePlayers[3].id, agent: "Fade", acs: 190, kills: 13, deaths: 12, assists: 12, adr: 122, hsPercent: 26, firstKills: 2, firstDeaths: 1, clutchesWon: 0 },
        { playerId: availablePlayers[4].id, agent: "Cypher", acs: 165, kills: 11, deaths: 9, assists: 7, adr: 108, hsPercent: 25, firstKills: 0, firstDeaths: 1, clutchesWon: 1 },
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
      if (new Set(selectedIds).size !== selectedIds.length) {
        throw new Error("Terdapat pemain duplikat yang dipilih. Setiap baris harus pemain yang berbeda.");
      }

      if (!opponentName.trim()) {
        throw new Error("Nama tim lawan wajib diisi.");
      }

      const formattedStats = playerRows.map((row) => ({
        playerId: row.playerId,
        agent: row.agent,
        acs: Number(row.acs) || 0,
        kills: Number(row.kills) || 0,
        deaths: Number(row.deaths) || 0,
        assists: Number(row.assists) || 0,
        adr: Number(row.adr) || 0,
        hsPercent: row.hsPercent !== "" ? Number(row.hsPercent) : null,
        firstKills: Number(row.firstKills) || 0,
        firstDeaths: Number(row.firstDeaths) || 0,
        clutchesWon: Number(row.clutchesWon) || 0,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242e40] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-rose-500" />
            <span>{initialData ? "Edit Pertandingan Scrim" : "Catat Scrim Baru"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan tombol <kbd className="px-1.5 py-0.5 rounded bg-[#1c2432] border border-[#242e40] text-rose-400 font-mono font-bold">Tab</kbd> untuk berpindah kolom dengan cepat (&lt;90 detik).
          </p>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFillDemoData}
              className="text-xs gap-1.5 border-dashed border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
              title="Khusus mode development lokal"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isi Contoh Data (Dev)</span>
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: MATCH METADATA */}
      <Card>
        <CardHeader className="py-3 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">1. Informasi Pertandingan</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Hasil:</span>
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Tanggal Match *
              </label>
              <button
                type="button"
                onClick={() => setMatchDate(new Date().toISOString().split("T")[0])}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                title="Pilih tanggal hari ini"
              >
                Hari Ini
              </button>
            </div>
            <div className="relative">
              <Input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                required
                className="text-xs font-mono pl-8 cursor-pointer hover:border-slate-500"
              />
              <Calendar className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Map */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Pilihan Map *
            </label>
            <Select
              value={map}
              onChange={(e) => setMap(e.target.value as ValorantMap)}
              className="text-xs font-semibold"
            >
              {VALORANT_MAPS.map((m) => (
                <option key={m} value={m} className="bg-[#141a24] text-slate-100">
                  {m}
                </option>
              ))}
            </Select>
          </div>

          {/* Tim Lawan */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
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
            <label className="text-xs font-semibold text-slate-300">
              Sisi Awal (Babak Pertama) *
            </label>
            <Select
              value={startSide}
              onChange={(e) => setStartSide(e.target.value as "ATTACK" | "DEFENSE")}
              className="text-xs font-medium"
            >
              <option value="ATTACK" className="bg-[#141a24] text-rose-400 font-semibold">
                Attack Side (Penyerang)
              </option>
              <option value="DEFENSE" className="bg-[#141a24] text-sky-400 font-semibold">
                Defense Side (Bertahan)
              </option>
            </Select>
          </div>

          {/* Link VOD */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Link Video VOD (YouTube / Twitch Opsional)
            </label>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={vodUrl}
              onChange={(e) => setVodUrl(e.target.value)}
              className="text-xs text-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: 5 PLAYER STATS MATRIX */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-[#242e40]/70">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">2. Statistik 5 Pemain</CardTitle>
              <CardDescription>
                Pindah antar kolom secara cepat dengan tombol Tab keyboard.
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400">
              5 Slot Pemain
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-3.5 min-w-[140px]">Pemain *</th>
                <th className="py-3 px-3.5 min-w-[120px]">Agent *</th>
                <th className="py-3 px-2 text-center w-20">ACS *</th>
                <th className="py-3 px-2 text-center w-16">K *</th>
                <th className="py-3 px-2 text-center w-16">D *</th>
                <th className="py-3 px-2 text-center w-16">A *</th>
                <th className="py-3 px-2 text-center w-20">ADR *</th>
                <th className="py-3 px-2 text-center w-16">HS %</th>
                <th className="py-3 px-2 text-center w-16">FK</th>
                <th className="py-3 px-2 text-center w-16">FD</th>
                <th className="py-3 px-2 text-center w-16">Clutch</th>
                <th className="py-3 px-3 text-center min-w-[85px]">Live K/D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242e40]/60">
              {playerRows.map((row, index) => {
                const k = Number(row.kills) || 0;
                const d = Number(row.deaths) || 0;
                const liveKD = calculateKD(k, d);

                return (
                  <tr
                    key={index}
                    className="hover:bg-[#1c2432]/50 transition-colors"
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
                          <option key={p.id} value={p.id} className="bg-[#141a24] text-slate-100">
                            {p.name} ({p.primaryRole})
                          </option>
                        ))}
                      </Select>
                    </td>

                    {/* Agent */}
                    <td className="p-2.5">
                      <Select
                        value={row.agent}
                        onChange={(e) => handleRowChange(index, "agent", e.target.value)}
                        className="h-8 text-xs font-semibold"
                        required
                      >
                        {VALORANT_AGENTS.map((a) => (
                          <option key={a.name} value={a.name} className="bg-[#141a24] text-slate-100">
                            {a.name} ({a.role})
                          </option>
                        ))}
                      </Select>
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
                        className="h-8 text-center font-bold text-slate-200 px-1"
                      />
                    </td>

                    {/* ADR */}
                    <td className="p-1.5">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="145"
                        value={row.adr}
                        onChange={(e) => handleRowChange(index, "adr", e.target.value)}
                        required
                        className="h-8 text-center text-slate-200 px-1"
                      />
                    </td>

                    {/* HS % */}
                    <td className="p-1.5">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="28"
                        value={row.hsPercent}
                        onChange={(e) => handleRowChange(index, "hsPercent", e.target.value)}
                        className="h-8 text-center text-slate-300 px-1"
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

                    {/* First Deaths */}
                    <td className="p-1.5">
                      <Input
                        type="number"
                        min="0"
                        placeholder="1"
                        value={row.firstDeaths}
                        onChange={(e) => handleRowChange(index, "firstDeaths", e.target.value)}
                        className="h-8 text-center text-rose-400 px-1"
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
        </CardContent>
      </Card>

      {/* SECTION 3: COACH EVALUATION & ATTACHMENTS */}
      <Card>
        <CardHeader className="py-3 px-5">
          <CardTitle className="text-sm font-bold">3. Evaluasi & Catatan Taktis Coach / IGL</CardTitle>
          <CardDescription>
            Dokumentasikan catatan strategi, serta lampirkan screenshot diagram taktis (Auto WebP) atau berkas PDF playbook (&lt; 1MB).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <Textarea
            rows={3}
            placeholder="Contoh: Eksekusi B-site retake sangat lambat, perlu timing smoke yang lebih sinkron. Mid control round buy sudah solid."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs text-slate-200 leading-relaxed"
          />

          {/* Attachments Section */}
          <div className="space-y-3 pt-3 border-t border-[#242e40]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-rose-500" />
                <span>Lampiran Evaluasi (Gambar & PDF)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Format: <strong className="text-slate-300">Gambar (Auto WebP)</strong> atau <strong className="text-slate-300">PDF (&lt; 1MB)</strong>
              </span>
            </div>

            {/* Drag & Drop Upload Box */}
            <div className="relative border-2 border-dashed border-[#242e40] hover:border-rose-500/50 bg-[#0e131b] rounded-xl p-5 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf"
                onChange={handleFileUpload}
                disabled={isCompressing || loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {isCompressing ? "Sedang Mengompresi Berkas..." : "Klik atau Tarik File Gambar / PDF ke Sini"}
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Gambar resolusi tinggi otomatis dikonversi ke format WebP super ringan. PDF otomatis dioptimasi di bawah 1MB.
                </p>
              </div>
            </div>

            {/* Compression Feedback Banner */}
            {compressionFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300">
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
                    className="p-3 rounded-xl bg-[#141a24] border border-[#242e40] flex items-center justify-between gap-3 group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.type === "image" ? (
                        <div className="w-10 h-10 rounded-lg bg-[#0e131b] border border-[#242e40] overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate" title={att.name}>
                          {att.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#0e131b] border border-[#242e40] text-emerald-400 font-semibold uppercase">
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
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
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
