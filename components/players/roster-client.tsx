"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Edit, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Player } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

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

  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;
    setIsDeleting(playerToDelete.id);
    try {
      await deletePlayer(playerToDelete.id);
      setPlayerToDelete(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2433] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Roster & Skuad Pemain
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manajemen pemain inti, cadangan, dan peran taktis tim
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-semibold shadow-sm text-xs">
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pemain</span>
          </Button>
        )}
      </div>

      {/* SECTION 1: ACTIVE STARTER LINEUP (5 CORE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
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
                className="bg-[#0C1017] border-[#1C2433] hover:border-[#2A364F] transition-all flex flex-col justify-between rounded-lg shadow-sm"
              >
                <CardHeader className="py-3 px-4 border-b border-[#1C2433] bg-[#090C10]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0C1017] border border-[#1C2433] flex items-center justify-center text-white font-tactical font-black text-lg shadow-inner">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/players/${player.id}`}
                          className="font-bold text-white hover:text-sky-400 transition-colors text-sm"
                        >
                          {player.name}
                        </Link>
                        {player.riotId && (
                          <p className="text-[11px] font-mono text-[#94A3B8]">
                            {player.riotId}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleColor.badge}`}>
                      {player.primaryRole}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 text-xs space-y-1.5 text-[#94A3B8]">
                  <div className="flex justify-between">
                    <span>Discord:</span>
                    <span className="text-white font-medium">{player.discordId || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">Starter Aktif</span>
                  </div>
                </CardContent>

                <div className="p-3 border-t border-[#1C2433] flex items-center justify-between gap-2 bg-[#090C10]/40">
                  <Link href={`/players/${player.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs gap-1 h-7 text-[#94A3B8] hover:text-white hover:bg-[#1C2433]">
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
                        className="h-7 px-2 text-xs text-[#94A3B8] hover:text-amber-400 hover:bg-[#1C2433]"
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
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white hover:bg-[#1C2433]"
                        title="Edit Data Pemain"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPlayerToDelete(player)}
                        disabled={isUpdating === player.id || isDeleting === player.id}
                        className="h-7 w-7 p-0 text-[#FF4655] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
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
      <div className="space-y-3 pt-4 border-t border-[#1C2433]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#64748B]" />
            <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
              Pemain Cadangan ({substitutes.length})
            </h2>
          </div>
        </div>

        {substitutes.length === 0 ? (
          <div className="p-6 rounded-lg border border-dashed border-[#1C2433] text-center text-[#64748B] text-xs">
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
                  className="bg-[#0C1017] border-[#1C2433] hover:border-[#2A364F] flex flex-col justify-between rounded-lg shadow-sm"
                >
                  <CardHeader className="py-3 px-4 border-b border-[#1C2433] bg-[#090C10]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0C1017] border border-[#1C2433] flex items-center justify-center text-[#94A3B8] font-tactical font-black text-base shadow-inner">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/players/${player.id}`}
                            className="font-bold text-white hover:text-sky-400 transition-colors text-sm"
                          >
                            {player.name}
                          </Link>
                          {player.riotId && (
                            <p className="text-[11px] font-mono text-[#94A3B8]">
                              {player.riotId}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleColor.badge}`}>
                        {player.primaryRole}
                      </span>
                    </div>
                  </CardHeader>

                  <div className="p-3 border-t border-[#1C2433] flex items-center justify-between gap-2 bg-[#090C10]/40">
                    <Link href={`/players/${player.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs h-7 text-[#94A3B8] hover:text-white hover:bg-[#1C2433]">
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
                          className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white hover:bg-[#1C2433]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPlayerToDelete(player)}
                          disabled={isUpdating === player.id || isDeleting === player.id}
                          className="h-7 w-7 p-0 text-[#FF4655] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
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

      {/* Custom Tactical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(playerToDelete)}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={confirmDeletePlayer}
        title="Konfirmasi Hapus Pemain"
        description={`Apakah Anda yakin ingin menghapus pemain "${playerToDelete?.name}" dari skuad tim? Seluruh relasi data roster pemain akan diperbarui.`}
        confirmText="Hapus Pemain"
        cancelText="Batal"
        variant="danger"
        isLoading={Boolean(isDeleting)}
      />
    </div>
  );
}
