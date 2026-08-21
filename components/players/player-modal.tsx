"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { VALORANT_ROLES, ValorantRole } from "@/lib/data/valorant";
import { Player } from "@/lib/db/schema";
import { createPlayer, updatePlayer } from "@/lib/actions/players";
import { useRouter } from "next/navigation";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
}

export function PlayerModal({ isOpen, onClose, playerToEdit }: PlayerModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState(playerToEdit?.name || "");
  const [riotId, setRiotId] = useState(playerToEdit?.riotId || "");
  const [primaryRole, setPrimaryRole] = useState<ValorantRole>(
    (playerToEdit?.primaryRole as ValorantRole) || "Flex"
  );
  const [discordId, setDiscordId] = useState(playerToEdit?.discordId || "");
  const [isActive, setIsActive] = useState(playerToEdit?.isActive ?? true);

  useEffect(() => {
    if (isOpen) {
      setName(playerToEdit?.name || "");
      setRiotId(playerToEdit?.riotId || "");
      setPrimaryRole((playerToEdit?.primaryRole as ValorantRole) || "Flex");
      setDiscordId(playerToEdit?.discordId || "");
      setIsActive(playerToEdit?.isActive ?? true);
      setLoading(false);
      setErrorMsg(null);
    }
  }, [isOpen, playerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Nama pemain wajib diisi.");
      }

      const payload = {
        name: name.trim(),
        riotId: riotId.trim() || undefined,
        primaryRole,
        discordId: discordId.trim() || undefined,
        isActive,
      };

      if (playerToEdit) {
        const res = await updatePlayer(playerToEdit.id, payload);
        if (!res.success) {
          throw new Error(res.error || "Gagal memperbarui data pemain.");
        }
      } else {
        const res = await createPlayer(payload);
        if (!res.success) {
          throw new Error(res.error || "Gagal menyimpan data pemain.");
        }
      }

      setLoading(false);
      onClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan data pemain.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0F141C] border border-[#1C2433] rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2433]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {playerToEdit ? "Edit Data Pemain" : "Tambah Pemain Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161D28]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8]">
              Nama / Nickname Pemain *
            </label>
            <Input
              type="text"
              placeholder="e.g. f0rsakeN, Jinggg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs font-medium"
            />
          </div>

          {/* Riot ID */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8]">
              Riot ID (Game Tag)
            </label>
            <Input
              type="text"
              placeholder="e.g. f0rsakeN#PRX"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Primary Role */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8]">
              Role Utama *
            </label>
            <Select
              value={primaryRole}
              onChange={(e) => setPrimaryRole(e.target.value as ValorantRole)}
              className="text-xs font-medium"
            >
              {VALORANT_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#090C10] text-[#F1F5F9]">
                  {role}
                </option>
              ))}
            </Select>
          </div>

          {/* Discord ID */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8]">
              Username Discord
            </label>
            <Input
              type="text"
              placeholder="e.g. forsaken_prx"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Status Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-[#1C2433]">
            <span className="text-[#94A3B8] font-semibold">Status Pemain:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF4655] focus:ring-[#FF4655] bg-[#090C10] border-[#1C2433]"
              />
              <span className={isActive ? "text-emerald-400 font-semibold" : "text-[#94A3B8]"}>
                {isActive ? "Roster Starter (5 Inti)" : "Pemain Cadangan"}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1C2433]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="font-semibold shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{playerToEdit ? "Simpan Perubahan" : "Tambah Pemain"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
