"use client";
/* eslint-disable @next/next/no-img-element -- Native game asset thumbnails avoid Vercel image optimization usage. */

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Trash2, Edit, RefreshCw, RotateCcw } from "lucide-react";
import { MatchWithStats, deleteMatch } from "@/lib/actions/matches";
import { MatchFilters } from "./match-filters";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useUserRole } from "@/components/layout/role-context";
import { useRouter } from "next/navigation";
import { getAgentIcon, getMapListViewIcon } from "@/lib/data/valorant";
import { useTranslation } from "@/lib/i18n/context";
import { getTopFraggers, hasAdvancedMatchStats } from "@/lib/utils/match-scoreboard";
import { PageHeader } from "@/components/ui/page-header";

interface MatchHistoryClientProps {
  initialMatches: MatchWithStats[];
}

export function MatchHistoryClient({ initialMatches }: MatchHistoryClientProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const { t, language } = useTranslation();
  const isEn = language === "en";

  const [selectedMap, setSelectedMap] = useState("ALL");
  const [selectedResult, setSelectedResult] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredMatches = useMemo(() => {
    return initialMatches.filter((m) => {
      if (selectedMap !== "ALL" && m.map !== selectedMap) return false;
      if (selectedResult !== "ALL" && m.result !== selectedResult) return false;
      if (
        searchQuery &&
        !m.opponentName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [initialMatches, selectedMap, selectedResult, searchQuery]);

  const handleReset = () => {
    setSelectedMap("ALL");
    setSelectedResult("ALL");
    setSearchQuery("");
  };

  const confirmDeleteMatch = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(deleteTargetId);
      const res = await deleteMatch(deleteTargetId);
      if (!res.success) {
        throw new Error(res.error || (isEn ? "Failed to delete match" : "Gagal menghapus match"));
      }
      setDeleteTargetId(null);
      router.refresh();
    } catch (err: any) {
      alert((isEn ? "Failed to delete match: " : "Gagal menghapus match: ") + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t.nav.matchHistory} description={isEn ? "Browse match results and scoreboard data." : "Telusuri hasil scrim dan data scoreboard."} />

      {/* Top Bar Filters */}
      <MatchFilters
        selectedMap={selectedMap}
        onMapChange={setSelectedMap}
        selectedResult={selectedResult}
        onResultChange={setSelectedResult}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleReset}
        matches={initialMatches}
      />

      {/* Main Table Card */}
      <div className="rounded-xl border border-[#1C2433] bg-[#0C1017] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#1C2433] bg-[#090C10] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isEn ? `Scrim List (${filteredMatches.length})` : `Daftar Scrim (${filteredMatches.length})`}
            </span>
          </div>
          <span className="text-xs text-[#94A3B8]">
            {isEn ? "Sorted newest first" : "Terurut dari yang terbaru"}
          </span>
        </div>

        {/* MOBILE VIEW: Match History Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1C2433]">
          {filteredMatches.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <p className="text-xs text-[#94A3B8]">
                {isEn ? "No scrim matches match the current filter criteria." : "Tidak ada pertandingan scrim yang sesuai dengan filter."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs gap-1.5 h-8"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.common.reset}</span>
              </Button>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const topFraggers = getTopFraggers(m.playerStats);
              return (
                <div
                  key={m.id}
                  className="p-4 hover:bg-[#141A24] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getMapListViewIcon(m.map)} width={32} height={32} loading="lazy" decoding="async"
                        alt={m.map}
                        className="w-8 h-8 rounded object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                      />
                      <div>
                        <div className="font-tactical font-black text-base text-white uppercase tracking-wide">
                          {m.map}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#CBD5E1]" />
                          <span>{m.matchDate}</span>
                        </div>
                        {!hasAdvancedMatchStats(m.playerStats) && <span className="inline-flex rounded border border-slate-700 px-1.5 py-0.5 text-[9px] text-slate-400">{isEn ? "Compact recap" : "Rekap ringkas"}</span>}
                      </div>
                    </div>

                    {/* Result & Score */}
                    <div className="flex items-center gap-2">
                      <div className="font-tactical text-lg font-black tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#CBD5E1] mx-1">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          m.result === "WIN"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : m.result === "LOSS"
                            ? "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {m.result}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white truncate">vs {m.opponentName}</div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                    {topFraggers.map((fragger) => <span key={fragger.id} className="inline-flex items-center gap-1.5"><span className="font-semibold text-white">{fragger.player?.name || "Player"}</span><span className="text-[#94A3B8]">{fragger.agent} · {fragger.kills} K</span></span>)}
                  </div>
                  {/* 5-Agent Comp Stack & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1C2433] text-xs">
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {m.playerStats.slice(0, 5).map((stat) => (
                        <img
                          key={stat.id}
                          src={getAgentIcon(stat.agent)} width={24} height={24} loading="lazy" decoding="async"
                          alt={stat.agent}
                          title={`${stat.player?.name || "Player"} (${stat.agent})`}
                          className="w-5 h-5 rounded-full border border-[#0C1017] bg-[#090C10] object-cover"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link href={`/matches/${m.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-11 px-2 text-xs gap-1 hover:text-white hover:bg-[#1C2433] font-medium"
                        >
                          <span>{t.common.detail}</span>
                          <ChevronRight aria-hidden="true" className="w-3 h-3" />
                        </Button>
                      </Link>

                      {isAdmin && (
                        <>
                          <Link href={`/matches/${m.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={isEn ? "Edit scrim" : "Edit scrim"} className="h-11 w-11 p-0 text-[#CBD5E1] hover:text-white"
                              title={isEn ? "Edit scrim" : "Edit scrim"}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTargetId(m.id)}
                            aria-label={isEn ? "Delete scrim" : "Hapus scrim"} className="h-11 w-11 p-0 text-[#FF4655] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
                            title={isEn ? "Delete scrim" : "Hapus scrim"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP VIEW: Full Data Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C2433] bg-[#090C10] text-[#94A3B8] font-semibold text-[11px]">
                <th className="py-3 px-4">{isEn ? "Date" : "Tanggal"}</th>
                <th className="py-3 px-4 sticky left-0 bg-[#090C10] z-10">{t.matches.map}</th>
                <th className="py-3 px-4">{t.matches.opponent}</th>
                <th className="py-3 px-4 text-center">{isEn ? "Score" : "Skor"}</th>
                <th className="py-3 px-4 text-center">{isEn ? "Result" : "Hasil"}</th>
                <th className="py-3 px-4">{isEn ? "Agent Composition" : "Komposisi Agent"}</th>
                <th className="py-3 px-4">{t.matches.topFragger}</th>
                <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Aksi"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433]">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <p className="text-xs text-[#94A3B8]">
                        {isEn ? "No scrim matches match the current filter criteria." : "Tidak ada pertandingan scrim yang sesuai dengan filter."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="text-xs gap-1.5 h-8"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.common.reset}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => {
                  const topFraggers = getTopFraggers(m.playerStats);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#141A24] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-tactical text-base font-black text-white uppercase tracking-wide sticky left-0 bg-[#0C1017] group-hover:bg-[#141A24] z-10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getMapListViewIcon(m.map)} width={32} height={32} loading="lazy" decoding="async"
                            alt={m.map}
                            className="w-7 h-7 rounded object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                          />
                          <span>{m.map}</span>
                          {!hasAdvancedMatchStats(m.playerStats) && <span className="rounded border border-slate-700 px-1.5 py-0.5 text-[9px] font-sans font-medium normal-case tracking-normal text-slate-400">{isEn ? "Compact recap" : "Rekap ringkas"}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-white whitespace-nowrap">
                        vs {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-lg font-black tracking-wide tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#CBD5E1] mx-1">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase inline-flex items-center gap-1 ${
                            m.result === "WIN"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : m.result === "LOSS"
                              ? "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <span>{m.result === "WIN" ? "✓" : m.result === "LOSS" ? "✕" : "−"}</span>
                          <span>{m.result}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center -space-x-1.5">
                          {m.playerStats.slice(0, 5).map((stat) => (
                            <img
                              key={stat.id}
                              src={getAgentIcon(stat.agent)} width={24} height={24} loading="lazy" decoding="async"
                              alt={stat.agent}
                              title={`${stat.player?.name || "Player"} (${stat.agent})`}
                              className="w-6 h-6 rounded-full border border-[#0C1017] bg-[#090C10] object-cover"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {topFraggers.length ? topFraggers.map((fragger) => <span key={fragger.id} className="inline-flex items-center gap-1.5 whitespace-nowrap"><img src={getAgentIcon(fragger.agent)} width={20} height={20} loading="lazy" decoding="async" alt={fragger.agent} className="h-5 w-5 shrink-0 rounded-full border border-[#2A364F] object-cover" /><span className="font-bold text-white">{fragger.player?.name || "Player"}</span><span className="text-sky-400">{fragger.agent} · {fragger.kills} K</span></span>) : <span className="text-[#CBD5E1]">—</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/matches/${m.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-11 px-2 text-xs gap-1 hover:text-white hover:bg-[#1C2433]"
                            >
                              <span>{t.common.detail}</span>
                              <ChevronRight aria-hidden="true" className="w-3 h-3" />
                            </Button>
                          </Link>

                          {isAdmin && (
                            <>
                              <Link href={`/matches/${m.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={isEn ? "Edit scrim" : "Edit scrim"} className="h-11 w-11 p-0 text-[#CBD5E1] hover:text-white"
                                  title={isEn ? "Edit scrim" : "Edit scrim"}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTargetId(m.id)}
                                aria-label={isEn ? "Delete scrim" : "Hapus scrim"} className="h-11 w-11 p-0 text-[#FF4655] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
                                title={isEn ? "Delete scrim" : "Hapus scrim"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Tactical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteMatch}
        title={isEn ? "Confirm Scrim Deletion" : "Konfirmasi Hapus Scrim"}
        description={isEn ? "Are you sure you want to delete this scrim record? This action cannot be undone and all round statistics and player combat data will be permanently purged." : "Apakah Anda yakin ingin menghapus data pertandingan scrim ini? Tindakan ini tidak dapat dibatalkan dan seluruh statistik ronde serta performa pemain akan dihapus permanen."}
        confirmText={isEn ? "Delete Permanently" : "Hapus Permanen"}
        cancelText={t.common.cancel}
        variant="danger"
        isLoading={Boolean(isDeleting)}
      />
    </div>
  );
}
