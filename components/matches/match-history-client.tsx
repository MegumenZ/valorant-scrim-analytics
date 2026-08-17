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
import { VALORANT_AGENTS } from "@/lib/data/valorant";

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
        matches={filteredMatches}
      />

      {/* Match Table */}
      <div className="rounded-xl border border-[#242e40] bg-[#141a24] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#242e40] bg-[#0e131b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold text-slate-100">
              Daftar Pertandingan ({filteredMatches.length} Match)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Terurut dari yang terbaru
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#242e40] bg-[#0e131b] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Map</th>
                <th className="py-3 px-4">Tim Lawan</th>
                <th className="py-3 px-4 text-center">Skor Akhir</th>
                <th className="py-3 px-4 text-center">Hasil</th>
                <th className="py-3 px-4 text-center">Sisi Awal</th>
                <th className="py-3 px-4">MVP Fragger</th>
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
                  const agentInfo = topFragger
                    ? VALORANT_AGENTS.find((a) => a.name === topFragger.agent)
                    : null;

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
                        <span className="px-2.5 py-1 rounded-md bg-[#1c2432] border border-[#242e40] text-xs">
                          {m.map}
                        </span>
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
                        {topFragger ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: agentInfo?.color || "#FF4655" }}
                            />
                            <span className="font-bold text-slate-100">
                              {topFragger.player?.name || "Player"}
                            </span>
                            <span className="text-slate-400 text-xs font-normal">
                              ({topFragger.agent})
                            </span>
                            <span className="text-xs font-bold text-sky-400 ml-1">
                              {topFragger.acs} ACS
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
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
