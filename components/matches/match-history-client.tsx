"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Swords, ExternalLink, Calendar, Trash2, Edit } from "lucide-react";
import { MatchWithStats, deleteMatch } from "@/lib/actions/matches";
import { MatchFilters } from "./match-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Apakah Anda yakin ingin menghapus catatan scrim ini?")) return;

    setIsDeleting(id);
    await deleteMatch(id);
    setIsDeleting(null);
    router.refresh();
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
      <div className="rounded-2xl border border-[#242e40] bg-[#141a24] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#242e40] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-200">
              Daftar Pertandingan Scrimmage ({filteredMatches.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Terurut dari yang terbaru
          </span>
        </div>

        {/* MOBILE VIEW: Match History Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-[#242e40]/70">
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Tidak ada match yang sesuai dengan filter.
            </div>
          ) : (
            filteredMatches.map((m) => {
              const topFragger = m.playerStats[0];

              return (
                <div
                  key={m.id}
                  className="p-3.5 hover:bg-[#1c2432]/60 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Map & Date */}
                    <div className="flex items-center gap-2">
                      <img
                        src={getMapListViewIcon(m.map)}
                        alt={m.map}
                        className="w-8 h-8 rounded-md object-cover border border-[#242e40] bg-[#0e131b] shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100">{m.map}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{m.matchDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Result & Score */}
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-black tabular-nums tracking-wide">
                        <span className={m.result === "WIN" ? "text-emerald-400" : m.result === "LOSS" ? "text-rose-400" : "text-amber-400"}>
                          {m.scoreTeam}
                        </span>
                        <span className="text-slate-500 mx-1">-</span>
                        <span className="text-slate-400">{m.scoreOpponent}</span>
                      </div>
                      <Badge
                        variant={
                          m.result === "WIN"
                            ? "win"
                            : m.result === "LOSS"
                            ? "loss"
                            : "draw"
                        }
                        className="text-[10px] px-1.5 py-0.5 font-bold"
                      >
                        {m.result}
                      </Badge>
                    </div>
                  </div>

                  {/* Opponent & Side */}
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-bold text-slate-200 truncate">
                      vs {m.opponentName}
                    </span>
                    <Badge variant={m.startSide === "ATTACK" ? "attack" : "defense"} className="text-[10px] px-1.5 py-0.2">
                      {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                    </Badge>
                  </div>

                  {/* 5-Agent Comp Stack & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#242e40]/50 text-xs">
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {m.playerStats.slice(0, 5).map((stat) => (
                        <img
                          key={stat.id}
                          src={getAgentIcon(stat.agent)}
                          alt={stat.agent}
                          title={`${stat.player?.name || "Player"} (${stat.agent})`}
                          className="w-5 h-5 rounded-full border border-[#141a24] bg-[#0e131b] object-cover"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link href={`/matches/${m.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1 hover:text-rose-400 hover:bg-rose-500/10 font-bold"
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
                              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                              title="Edit Match"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(m.id, e)}
                            disabled={isDeleting === m.id}
                            className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
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
              <tr className="border-b border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Map</th>
                <th className="py-3 px-4">Lawan</th>
                <th className="py-3 px-4 text-center">Skor</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4 text-center">Sisi</th>
                <th className="py-3 px-4">Komposisi Tim & MVP</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242e40]/70 font-medium">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada match yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => {
                  const topFragger = m.playerStats[0];

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#1c2432]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{m.matchDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <img
                            src={getMapListViewIcon(m.map)}
                            alt={m.map}
                            className="w-7 h-7 rounded-md object-cover border border-[#242e40] bg-[#141a24] shrink-0"
                          />
                          <span className="text-xs">{m.map}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 whitespace-nowrap text-sm">
                        {m.opponentName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-sm tracking-wider tabular-nums">
                        <span
                          className={
                            m.result === "WIN"
                              ? "text-emerald-400"
                              : m.result === "LOSS"
                              ? "text-rose-400"
                              : "text-amber-400"
                          }
                        >
                          {m.scoreTeam}
                        </span>
                        <span className="text-slate-500 mx-1.5">-</span>
                        <span className="text-slate-400">{m.scoreOpponent}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            m.result === "WIN"
                              ? "win"
                              : m.result === "LOSS"
                              ? "loss"
                              : "draw"
                          }
                        >
                          {m.result}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={m.startSide === "ATTACK" ? "attack" : "defense"}>
                          {m.startSide === "ATTACK" ? "Attack" : "Defense"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* Mini 5-Agent Comp Avatars */}
                          <div className="flex items-center -space-x-1.5 shrink-0">
                            {m.playerStats.slice(0, 5).map((stat) => (
                              <img
                                key={stat.id}
                                src={getAgentIcon(stat.agent)}
                                alt={stat.agent}
                                title={`${stat.player?.name || "Player"} (${stat.agent})`}
                                className="w-5 h-5 rounded-full border border-[#141a24] bg-[#0e131b] object-cover hover:z-10 hover:scale-125 transition-transform"
                              />
                            ))}
                          </div>

                          {/* Top MVP Text */}
                          {topFragger && (
                            <span className="text-[11px] text-slate-300 font-semibold truncate max-w-[140px]">
                              MVP: {topFragger.player?.name} ({topFragger.acs} ACS)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/matches/${m.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 text-xs gap-1 hover:text-rose-400 hover:bg-rose-500/10"
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
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                                  title="Edit Match"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(m.id, e)}
                                disabled={isDeleting === m.id}
                                className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
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
    </div>
  );
}
