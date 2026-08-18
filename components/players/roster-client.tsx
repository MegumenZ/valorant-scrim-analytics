"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Edit, Trash2, ExternalLink, RefreshCw } from "lucide-react";
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
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
    setIsUpdating(player.id);
    try {
      await togglePlayerActive(player.id, player.isActive);
      router.refresh();
    } catch (err: any) {
      alert("Gagal mengubah status pemain: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (player: Player) => {
    if (!confirm(`Hapus pemain "${player.name}" dari roster tim?`)) return;
    setIsDeleting(player.id);
    try {
      await deletePlayer(player.id);
      router.refresh();
    } catch (err: any) {
      alert("Gagal menghapus pemain: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2433] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Roster Pemain
          </h1>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-semibold shadow-sm">
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pemain</span>
          </Button>
        )}
      </div>

      {/* SECTION 1: ACTIVE STARTER LINEUP (5 CORE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-semibold text-white">
              Pemain Inti ({activeStarters.length})
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">
            {activeStarters.length === 5 ? "Slot Penuh (5/5)" : `Slot: ${activeStarters.length}/5`}
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
                className="bg-[#0F141C] border-[#1C2433] hover:border-[#2A364F] transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-[#1C2433]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#161D28] border border-[#2A364F] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/players/${player.id}`}
                          className="font-bold text-white hover:text-[#FF4655] transition-colors text-base"
                        >
                          {player.name}
                        </Link>
                        {player.riotId && (
                          <p className="text-xs text-[#94A3B8]">
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

                <CardContent className="py-3 text-xs space-y-1.5 text-[#94A3B8]">
                  <div className="flex justify-between">
                    <span>Discord:</span>
                    <span className="text-[#F1F5F9]">{player.discordId || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">Starter Aktif</span>
                  </div>
                </CardContent>

                <div className="p-3 border-t border-[#1C2433] flex items-center justify-between gap-2 bg-[#090C10]/40">
                  <Link href={`/players/${player.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs gap-1 h-7 text-[#94A3B8] hover:text-white">
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
                        disabled={isUpdating === player.id || isDeleting === player.id}
                        className="h-7 px-2 text-xs text-[#94A3B8] hover:text-amber-400"
                        title="Pindahkan ke Cadangan"
                      >
                        {isUpdating === player.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          "Set Sub"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(player)}
                        disabled={isUpdating === player.id || isDeleting === player.id}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                        title="Edit Data Pemain"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(player)}
                        disabled={isUpdating === player.id || isDeleting === player.id}
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
                        title="Hapus Pemain"
                      >
                        {isDeleting === player.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
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
      <div className="space-y-4 pt-4 border-t border-[#1C2433]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#64748B]" />
            <h2 className="text-sm font-semibold text-[#94A3B8]">
              Pemain Cadangan ({substitutes.length})
            </h2>
          </div>
        </div>

        {substitutes.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[#1C2433] text-center text-[#64748B] text-xs">
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
                  className="bg-[#0F141C] border-[#1C2433] hover:border-[#2A364F] flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 border-b border-[#1C2433]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#161D28] border border-[#2A364F] flex items-center justify-center text-[#94A3B8] font-bold text-xs">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/players/${player.id}`}
                            className="font-bold text-white hover:text-[#FF4655] transition-colors text-sm"
                          >
                            {player.name}
                          </Link>
                          {player.riotId && (
                            <p className="text-xs text-[#94A3B8]">
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

                  <div className="p-3 border-t border-[#1C2433] flex items-center justify-between gap-2 bg-[#090C10]/40">
                    <Link href={`/players/${player.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs h-7 text-[#94A3B8] hover:text-white">
                        <span>Statistik</span>
                      </Button>
                    </Link>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(player)}
                          disabled={isUpdating === player.id || isDeleting === player.id}
                          className="h-7 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        >
                          {isUpdating === player.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            "Set Starter"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(player)}
                          disabled={isUpdating === player.id || isDeleting === player.id}
                          className="h-7 w-7 p-0 text-[#94A3B8]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(player)}
                          disabled={isUpdating === player.id || isDeleting === player.id}
                          className="h-7 w-7 p-0 text-rose-400"
                        >
                          {isDeleting === player.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
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
