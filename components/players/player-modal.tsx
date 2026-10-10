"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { UserPlus, UserCheck, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { VALORANT_ROLES, ValorantRole } from "@/lib/data/valorant";
import { Player } from "@/lib/db/schema";
import { createPlayer, updatePlayer } from "@/lib/actions/players";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
}

export function PlayerModal({ isOpen, onClose, playerToEdit }: PlayerModalProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const loadingRef = useRef(loading);
  const closeRef = useRef(onClose);

  useEffect(() => {
    loadingRef.current = loading;
    closeRef.current = onClose;
  }, [loading, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button, input, select")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingRef.current) closeRef.current();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [isOpen]);

  const [name, setName] = useState(playerToEdit?.name || "");
  const [riotId, setRiotId] = useState(playerToEdit?.riotId || "");
  const [primaryRole, setPrimaryRole] = useState<ValorantRole>(
    (playerToEdit?.primaryRole as ValorantRole) || "Flex"
  );
  const [discordId, setDiscordId] = useState(playerToEdit?.discordId || "");
  const [isActive, setIsActive] = useState(playerToEdit?.isActive ?? true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error(isEn ? "Player name is required." : "Nama pemain wajib diisi.");
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
          throw new Error(res.error || (isEn ? "Failed to update player data." : "Gagal memperbarui data pemain."));
        }
      } else {
        const res = await createPlayer(payload);
        if (!res.success) {
          throw new Error(res.error || (isEn ? "Failed to save player data." : "Gagal menyimpan data pemain."));
        }
      }

      setLoading(false);
      onClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? "Failed to save player data." : "Gagal menyimpan data pemain."));
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
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="relative w-full max-w-md bg-[#0F141C] border border-[#1C2433] rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2433]">
          <div className="flex items-center gap-2">
            <h3 id={titleId} className="text-sm font-semibold text-white">
              {playerToEdit ? (isEn ? "Edit Player Profile" : "Edit Data Pemain") : (isEn ? "Add New Player" : "Tambah Pemain Baru")}
            </h3>
          </div>
          <button
            type="button"
            aria-label={t.common.close}
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[#CBD5E1] hover:text-white hover:bg-[#161D28]"
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
              {isEn ? "Player Name / Nickname *" : "Nama / Nickname Pemain *"}
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
              {isEn ? "Riot ID (In-game Tag)" : "Riot ID (Game Tag)"}
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
              {isEn ? "Primary Role *" : "Role Utama *"}
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
              {isEn ? "Discord Username" : "Username Discord"}
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
          {!playerToEdit && <div className="pt-2 flex items-center justify-between border-t border-[#1C2433]">
            <span className="text-[#94A3B8] font-semibold">{isEn ? "Player Status:" : "Status Pemain:"}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF4655] focus:ring-[#FF4655] bg-[#090C10] border-[#1C2433]"
              />
              <span className={isActive ? "text-emerald-400 font-semibold" : "text-[#94A3B8]"}>
                {isActive ? (isEn ? "Active roster" : "Roster aktif") : (isEn ? "Inactive" : "Nonaktif")}
              </span>
            </label>
          </div>}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1C2433]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              {t.common.cancel}
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
                  <span>{isEn ? "Saving..." : "Menyimpan..."}</span>
                </>
              ) : (
                <span>{playerToEdit ? (isEn ? "Save Changes" : "Simpan Perubahan") : (isEn ? "Add Player" : "Tambah Pemain")}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
