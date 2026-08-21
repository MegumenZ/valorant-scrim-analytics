"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Calendar, Trash2, Edit, RefreshCw, RotateCcw } from "lucide-react";
import { MatchWithStats, deleteMatch } from "@/lib/actions/matches";
import { MatchFilters } from "./match-filters";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useUserRole } from "@/components/layout/role-context";
import { useRouter } from "next/navigation";
import { getAgentIcon, getMapListViewIcon } from "@/lib/data/valorant";

interface MatchHistoryClientProps {
  initialMatches: MatchWithStats[];
}

export function MatchHistoryClient({ initialMatches }: MatchHistoryClientProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
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
        throw new Error(res.error || "Gagal menghapus match");
      }
      setDeleteTargetId(null);
      router.refresh();
    } catch (err: any) {
      alert("Gagal menghapus match: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
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
      <div className="rounded-lg border border-[#1C2433] bg-[#0C1017] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#1C2433] bg-[#090C10] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Daftar Scrim ({filteredMatches.length})
            </span>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Terurut dari yang terbaru
          </span>
        </div>

        {/* MOBILE VIEW: Match History Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#1C2433]">
          {filteredMatches.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <p className="text-xs text-[#94A3B8]">
                Tidak ada pertandingan scrim yang sesuai dengan filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs gap-1.5 h-8"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </Button>
            </div>
          ) : (
            filteredMatches.map((m) => {
              return (
                <div
                  key={m.id}
                  className="p-4 hover:bg-[#141A24] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getMapListViewIcon(m.map)}
                        alt={m.map}
                        className="w-8 h-8 rounded object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                      />
                      <div>
                        <div className="font-tactical font-black text-base text-white uppercase tracking-wide">
                          {m.map}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#64748B]" />
                          <span>{m.matchDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Result & Score */}
                    <div className="flex items-center gap-2">
                      <div className="font-tactical text-lg font-black tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#64748B] mx-1">-</span>
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

                  {/* Opponent & Side */}
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-semibold text-white truncate">
                      vs {m.opponentName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        m.startSide === "ATTACK"
                          ? "text-[#FF4655] border-[#FF4655]/30 bg-[#FF4655]/10"
                          : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                      }`}
                    >
                      {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                    </span>
                  </div>

                  {/* 5-Agent Comp Stack & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1C2433] text-xs">
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {m.playerStats.slice(0, 5).map((stat) => (
                        <img
                          key={stat.id}
                          src={getAgentIcon(stat.agent)}
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
                          className="h-7 px-2 text-xs gap-1 hover:text-white hover:bg-[#1C2433] font-medium"
                        >
                          <span>Detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>

                      {isAdmin && (
                        <>
                          <Link href={`/matches/${m.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                              title="Edit Match"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTargetId(m.id)}
                            className="h-7 w-7 p-0 text-[#FF4655] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
                            title="Hapus Match"
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
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Map</th>
                <th className="py-3 px-4">Lawan</th>
                <th className="py-3 px-4 text-center">Skor</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4 text-center">Sisi Awal</th>
                <th className="py-3 px-4">Komposisi Agent</th>
                <th className="py-3 px-4">Top Fragger</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433]">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <p className="text-xs text-[#94A3B8]">
                        Tidak ada pertandingan scrim yang sesuai dengan filter.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="text-xs gap-1.5 h-8"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => {
                  const topFragger = m.playerStats[0];

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#141A24] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                        {m.matchDate}
                      </td>
                      <td className="py-3.5 px-4 font-tactical text-base font-black text-white uppercase tracking-wide">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getMapListViewIcon(m.map)}
                            alt={m.map}
                            className="w-7 h-7 rounded object-cover border border-[#1C2433] bg-[#161D28] shrink-0"
                          />
                          <span>{m.map}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-white whitespace-nowrap">
                        vs {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-tactical text-lg font-black tracking-wide tabular-nums">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-[#64748B] mx-1">-</span>
                        <span className="text-[#94A3B8]">{m.scoreOpponent}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
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
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            m.startSide === "ATTACK"
                              ? "text-[#FF4655] border-[#FF4655]/30 bg-[#FF4655]/10"
                              : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                          }`}
                        >
                          {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center -space-x-1.5">
                          {m.playerStats.slice(0, 5).map((stat) => (
                            <img
                              key={stat.id}
                              src={getAgentIcon(stat.agent)}
                              alt={stat.agent}
                              title={`${stat.player?.name || "Player"} (${stat.agent})`}
                              className="w-6 h-6 rounded-full border border-[#0C1017] bg-[#090C10] object-cover"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {topFragger ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <img
                              src={getAgentIcon(topFragger.agent)}
                              alt={topFragger.agent}
                              className="w-5 h-5 rounded-full bg-[#161D28] border border-[#2A364F] shrink-0 object-cover"
                            />
                            <span className="text-xs font-bold text-white">
                              {topFragger.player?.name || "Player"}
                            </span>
                            <span className="text-xs font-bold text-sky-400">
                              {topFragger.acs} ACS
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#64748B]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/matches/${m.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 hover:text-white hover:bg-[#1C2433]"
                            >
                              <span>Detail</span>
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>

                          {isAdmin && (
                            <>
                              <Link href={`/matches/${m.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                                  title="Edit Match"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTargetId(m.id)}
                                className="h-7 w-7 p-0 text-[#FF4655] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
                                title="Hapus Match"
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
        title="Konfirmasi Hapus Scrim"
        description="Apakah Anda yakin ingin menghapus data pertandingan scrim ini? Tindakan ini tidak dapat dibatalkan dan seluruh statistik ronde serta performa pemain akan dihapus permanen."
        confirmText="Hapus Permanen"
        cancelText="Batal"
        variant="danger"
        isLoading={Boolean(isDeleting)}
      />
    </div>
  );
}
