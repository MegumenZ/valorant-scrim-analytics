"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck, Edit, Trash2, ExternalLink } from "lucide-react";
import { Player } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AGENT_ROLE_COLORS, ValorantRole } from "@/lib/data/valorant";
import { PlayerModal } from "./player-modal";
import { togglePlayerActive, deletePlayer } from "@/lib/actions/players";
import { useUserRole } from "@/components/layout/role-context";
import { useRouter } from "next/navigation";

interface RosterClientProps {
  initialPlayers: Player[];
}

export function RosterClient({ initialPlayers }: RosterClientProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const activeStarters = initialPlayers.filter((p) => p.isActive);
  const substitutes = initialPlayers.filter((p) => !p.isActive);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setModalOpen(true);
  };

  const handleToggleStatus = async (player: Player) => {
    await togglePlayerActive(player.id, player.isActive);
    router.refresh();
  };

  const handleDelete = async (player: Player) => {
    if (!confirm(`Hapus pemain "${player.name}" dari roster tim?`)) return;
    await deletePlayer(player.id);
    router.refresh();
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242e40] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-rose-500" />
            <span>Manajemen Roster Tim</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengaturan susunan 5 pemain inti starter, pemain cadangan, dan peran spesifik dalam skuad.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-bold shadow-md shadow-rose-950/40">
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pemain</span>
          </Button>
        )}
      </div>

      {/* SECTION 1: ACTIVE STARTER LINEUP (5 CORE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Lineup Pemain Inti Starter ({activeStarters.length} Pemain)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {activeStarters.length === 5 ? "Slot Penuh (5/5)" : `Slot: ${activeStarters.length}/5 Pemain`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeStarters.map((player) => {
            const roleColor =
              AGENT_ROLE_COLORS[player.primaryRole as ValorantRole] ||
              AGENT_ROLE_COLORS.Flex;

            return (
              <Card
                key={player.id}
                className="hover:border-[#334155] transition-all bg-[#141a24] flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1c2432] border border-[#242e40] flex items-center justify-center text-slate-100 font-extrabold text-sm shadow-sm">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/players/${player.id}`}
                          className="font-bold text-slate-100 hover:text-rose-400 transition-colors text-base"
                        >
                          {player.name}
                        </Link>
                        {player.riotId && (
                          <p className="text-xs text-slate-400">
                            {player.riotId}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleColor.badge}`}>
                      {player.primaryRole}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="py-2.5 text-xs space-y-1 text-slate-400 border-t border-[#242e40]/70">
                  <div className="flex justify-between">
                    <span>Discord:</span>
                    <span className="text-slate-200">{player.discordId || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">Starter Aktif</span>
                  </div>
                </CardContent>

                <div className="p-3 border-t border-[#242e40]/70 flex items-center justify-between gap-2 bg-[#0e131b]">
                  <Link href={`/players/${player.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs gap-1 h-7">
                      <span>Lihat Statistik</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(player)}
                        className="h-7 px-2 text-xs text-slate-400 hover:text-amber-400"
                        title="Pindahkan ke Cadangan"
                      >
                        Set Sub
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(player)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                        title="Edit Data Pemain"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(player)}
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
                        title="Hapus Pemain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SUBSTITUTES / BENCH */}
      <div className="space-y-4 pt-4 border-t border-[#242e40]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Pemain Cadangan & Sub ({substitutes.length} Pemain)
            </h2>
          </div>
        </div>

        {substitutes.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[#242e40] text-center text-slate-500 text-xs">
            Belum ada pemain cadangan yang terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {substitutes.map((player) => {
              const roleColor =
                AGENT_ROLE_COLORS[player.primaryRole as ValorantRole] ||
                AGENT_ROLE_COLORS.Flex;

              return (
                <Card
                  key={player.id}
                  className="bg-[#10151f] border-[#242e40] flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#1c2432] border border-[#242e40] flex items-center justify-center text-slate-400 font-extrabold text-xs">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/players/${player.id}`}
                            className="font-bold text-slate-300 hover:text-rose-400 transition-colors text-sm"
                          >
                            {player.name}
                          </Link>
                          {player.riotId && (
                            <p className="text-xs text-slate-400">
                              {player.riotId}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleColor.badge}`}>
                        {player.primaryRole}
                      </span>
                    </div>
                  </CardHeader>

                  <div className="p-3 border-t border-[#242e40] flex items-center justify-between gap-2">
                    <Link href={`/players/${player.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs h-7">
                        <span>Statistik</span>
                      </Button>
                    </Link>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(player)}
                          className="h-7 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        >
                          Set Starter
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(player)}
                          className="h-7 w-7 p-0 text-slate-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(player)}
                          className="h-7 w-7 p-0 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Player Modal */}
      <PlayerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        playerToEdit={editingPlayer}
      />
    </div>
  );
}
