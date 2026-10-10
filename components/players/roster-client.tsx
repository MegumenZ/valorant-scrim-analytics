"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PlayerModal } from "./player-modal";
import { deletePlayer, setPlayerActiveStatus, type RosterPlayer } from "@/lib/actions/players";
import { useUserRole } from "@/components/layout/role-context";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { AGENT_ROLE_COLORS, ValorantRole } from "@/lib/data/valorant";
import { PageHeader } from "@/components/ui/page-header";

type ConfirmAction = { player: RosterPlayer; kind: "status" | "delete" } | null;

export function RosterClient({ initialPlayers }: { initialPlayers: RosterPlayer[] }) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<RosterPlayer | null>(null);
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmAction>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const activePlayers = initialPlayers.filter((player) => player.isActive);
  const inactivePlayers = initialPlayers.filter((player) => !player.isActive);

  const openAdd = () => { setEditingPlayer(null); setModalOpen(true); };
  const openEdit = (player: RosterPlayer) => { setEditingPlayer(player); setModalOpen(true); };

  const confirmAction = async () => {
    if (!confirmation || pendingPlayerId) return;
    const { player, kind } = confirmation;
    setPendingPlayerId(player.id);
    setToast(null);
    try {
      const result = kind === "status"
        ? await setPlayerActiveStatus(player.id, !player.isActive)
        : await deletePlayer(player.id);
      if (!result.success) throw new Error(result.error || (isEn ? "Action failed." : "Aksi gagal."));
      setConfirmation(null);
      setToast({ kind: "success", message: kind === "status"
        ? (player.isActive ? (isEn ? "Player deactivated." : "Pemain dinonaktifkan.") : (isEn ? "Player activated." : "Pemain diaktifkan."))
        : (isEn ? "Player permanently deleted." : "Pemain dihapus permanen.") });
      router.refresh();
    } catch (error) {
      setToast({ kind: "error", message: error instanceof Error ? error.message : (isEn ? "Action failed." : "Aksi gagal.") });
    } finally {
      setPendingPlayerId(null);
    }
  };

  const renderPlayerCard = (player: RosterPlayer) => {
    const roleColor = AGENT_ROLE_COLORS[player.primaryRole as ValorantRole] || AGENT_ROLE_COLORS.Flex;
    return <Card key={player.id} className="flex flex-col justify-between rounded-xl border border-[#1C2433] bg-[#0C1017] shadow-sm">
      <CardHeader className="border-b border-[#1C2433] bg-[#090C10] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1C2433] bg-[#0C1017] font-tactical text-lg font-black text-white">{player.name.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <Link href={`/players/${player.id}`} className="block truncate text-sm font-bold text-white hover:text-[#FF4655]">{player.name}</Link>
              {player.riotId && <p className="truncate font-mono text-[11px] text-[#94A3B8]">{player.riotId}</p>}
            </div>
          </div>
          <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold ${roleColor.badge}`}>{player.primaryRole}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4 text-xs text-[#94A3B8]">
        <div className="flex justify-between gap-3"><span>Discord</span><span className="max-w-[65%] truncate font-medium text-white">{player.discordId || "—"}</span></div>
        <div className="flex justify-between"><span>{isEn ? "Status" : "Status"}</span><span className={player.isActive ? "font-semibold text-emerald-400" : "font-semibold text-[#94A3B8]"}>{player.isActive ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}</span></div>
        <div className="flex justify-between"><span>{isEn ? "Matches played" : "Jumlah match"}</span><span className="font-mono tabular-nums text-white">{player.matchCount}</span></div>
      </CardContent>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1C2433] bg-[#090C10]/40 p-3">
        <Link href={`/players/${player.id}`}><Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2 text-xs text-[#94A3B8] hover:text-white"><Users className="h-3.5 w-3.5" />{isEn ? "Statistics" : "Statistik"}</Button></Link>
        {isAdmin && <div className="flex flex-wrap items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-11 px-3 text-xs" disabled={pendingPlayerId === player.id} onClick={() => setConfirmation({ player, kind: "status" })}>{player.isActive ? (isEn ? "Deactivate" : "Nonaktifkan") : (isEn ? "Activate" : "Aktifkan")}</Button>
          <Button variant="ghost" size="sm" aria-label={isEn ? `Edit ${player.name}` : `Edit ${player.name}`} title={isEn ? "Edit player" : "Edit pemain"} className="h-11 w-11 p-0" disabled={pendingPlayerId === player.id} onClick={() => openEdit(player)}><Edit className="h-4 w-4" /></Button>
          {!player.isActive && player.matchCount === 0 && <Button variant="ghost" size="sm" aria-label={isEn ? `Permanently delete ${player.name}` : `Hapus permanen ${player.name}`} title={isEn ? "Permanently delete player" : "Hapus pemain permanen"} className="h-11 w-11 p-0 text-[#FF4655]" disabled={pendingPlayerId === player.id} onClick={() => setConfirmation({ player, kind: "delete" })}><Trash2 className="h-4 w-4" /></Button>}
        </div>}
      </div>
    </Card>;
  };

  const confirmIsDelete = confirmation?.kind === "delete";
  const confirmedPlayer = confirmation?.player;
  return <div className="space-y-7 pb-10">
    {toast && <div role={toast.kind === "error" ? "alert" : "status"} aria-live="polite" className={`fixed right-4 top-16 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-xl ${toast.kind === "error" ? "border-rose-500/40 bg-[#190D12] text-rose-200" : "border-emerald-500/40 bg-[#0D1915] text-emerald-200"}`}>
      <div className="flex items-center justify-between gap-4">{toast.message}<button type="button" aria-label={isEn ? "Dismiss notification" : "Tutup notifikasi"} onClick={() => setToast(null)} className="flex h-11 w-11 items-center justify-center font-bold">×</button></div>
    </div>}
    <PageHeader title={isEn ? "Player Roster" : "Roster Pemain"} description={isEn ? "Manage active and inactive players." : "Kelola pemain aktif dan nonaktif."} action={isAdmin && <Button onClick={openAdd} className="gap-1.5 font-semibold text-xs"><UserPlus className="h-4 w-4" />{isEn ? "Add Player" : "Tambah Pemain"}</Button>} />

    <section className="space-y-3" aria-label={isEn ? "Active players" : "Pemain aktif"}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-white">{isEn ? `Active (${activePlayers.length})` : `Aktif (${activePlayers.length})`}</h2>
      {activePlayers.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{activePlayers.map(renderPlayerCard)}</div> : <p className="rounded-lg border border-dashed border-[#1C2433] p-6 text-center text-sm text-[#94A3B8]">{isEn ? "No active players." : "Belum ada pemain aktif."}</p>}
    </section>

    <details className="group border-t border-[#1C2433] pt-5">
      <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-[#94A3B8]">{isEn ? `Inactive (${inactivePlayers.length})` : `Nonaktif (${inactivePlayers.length})`}</summary>
      <div className="mt-3">{inactivePlayers.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{inactivePlayers.map(renderPlayerCard)}</div> : <p className="rounded-lg border border-dashed border-[#1C2433] p-6 text-center text-sm text-[#94A3B8]">{isEn ? "No inactive players." : "Belum ada pemain nonaktif."}</p>}</div>
    </details>

    {modalOpen && <PlayerModal isOpen onClose={() => setModalOpen(false)} playerToEdit={editingPlayer} />}
    <ConfirmModal
      isOpen={Boolean(confirmation)}
      onClose={() => setConfirmation(null)}
      onConfirm={confirmAction}
      title={confirmIsDelete ? (isEn ? "Permanently delete player?" : "Hapus pemain permanen?") : (isEn ? (confirmedPlayer?.isActive ? "Deactivate player?" : "Activate player?") : (confirmedPlayer?.isActive ? "Nonaktifkan pemain?" : "Aktifkan pemain?"))}
      description={confirmIsDelete
        ? (isEn ? `Permanently delete ${confirmedPlayer?.name}. This cannot be undone. This option is only available when the player has no match history.` : `Hapus permanen ${confirmedPlayer?.name}. Tindakan ini tidak dapat dibatalkan dan hanya tersedia jika pemain belum memiliki riwayat match.`)
        : (isEn ? (confirmedPlayer?.isActive ? `Deactivate ${confirmedPlayer?.name}? Their match history and statistics will remain unchanged.` : `Activate ${confirmedPlayer?.name} for the current roster? Their match history remains unchanged.`) : (confirmedPlayer?.isActive ? `Nonaktifkan ${confirmedPlayer?.name}? Riwayat dan statistik match tetap utuh.` : `Aktifkan ${confirmedPlayer?.name} pada roster saat ini? Riwayat match tetap utuh.`))}
      confirmText={confirmIsDelete ? (isEn ? "Delete permanently" : "Hapus permanen") : (confirmedPlayer?.isActive ? (isEn ? "Deactivate" : "Nonaktifkan") : (isEn ? "Activate" : "Aktifkan"))}
      cancelText={t.common.cancel}
      variant={confirmIsDelete ? "danger" : "warning"}
      isLoading={pendingPlayerId === confirmedPlayer?.id}
    />
  </div>;
}
