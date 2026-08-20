"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus Data",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0C1017] border border-[#1C2433] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2433] bg-[#090C10]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isDanger
                  ? "bg-[#FF4655]/10 border-[#FF4655]/30 text-[#FF4655]"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#94A3B8] hover:text-white transition-colors p-1 rounded hover:bg-[#1C2433] cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-4 text-xs text-[#CBD5E1] leading-relaxed">
          <p>{description}</p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#1C2433] bg-[#090C10]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs text-[#94A3B8] hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDanger ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs gap-1.5 font-bold ${
              isDanger
                ? "bg-[#FF4655] hover:bg-[#FF4655]/90 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
